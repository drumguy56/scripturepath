import { randomUUID, timingSafeEqual } from 'node:crypto';
import { Hono } from 'hono';
import { and, desc, eq, gt } from 'drizzle-orm';
import { db, schema } from '../db';
import {
  clearLoginFailures,
  createSession,
  currentActor,
  endSession,
  loginLocked,
  recordLoginFailure,
  randomToken,
  sha256,
  sixDigitCode,
  toActor,
} from '../lib/auth';
import { codeEmail, newMemberEmail, resetEmail, sendMail } from '../lib/mail';

export const auth = new Hono();

const CODE_MINUTES = 15;
const RESET_MINUTES = 60;
const MAX_CODE_ATTEMPTS = 5;
const RESEND_SECONDS = 60;
const MIN_PASSWORD = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const adminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

function normEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

async function readBody(c: any): Promise<Record<string, any>> {
  const value = await c.req.json().catch(() => null);
  return value && typeof value === 'object' ? value : {};
}

function sameHash(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

async function findUser(email: string) {
  const [row] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return row ?? null;
}

// Stores a fresh one-time code for an email and sends it. Replaces any earlier codes.
async function issueVerificationCode(email: string) {
  const code = sixDigitCode();
  await db.delete(schema.authTokens).where(and(eq(schema.authTokens.email, email), eq(schema.authTokens.purpose, 'verify')));
  await db.insert(schema.authTokens).values({
    id: randomUUID(),
    email,
    purpose: 'verify',
    token_hash: sha256(code),
    attempts: '0',
    expires_at: new Date(Date.now() + CODE_MINUTES * 60_000),
  });
  const mail = codeEmail(code);
  await sendMail({ to: email, ...mail, text: mail.text });
}

async function latestVerificationCode(email: string) {
  const [row] = await db
    .select()
    .from(schema.authTokens)
    .where(and(eq(schema.authTokens.email, email), eq(schema.authTokens.purpose, 'verify')))
    .orderBy(desc(schema.authTokens.created_date))
    .limit(1);
  return row ?? null;
}

auth.post('/register', async (c) => {
  const body = await readBody(c);
  const email = normEmail(body.email);
  const password = String(body.password ?? '');
  const fullName = String(body.full_name ?? '').trim().slice(0, 120);
  if (!EMAIL_RE.test(email)) return c.json({ error: 'Enter a valid email address' }, 400);
  if (password.length < MIN_PASSWORD) return c.json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, 400);

  const passwordHash = await Bun.password.hash(password, { algorithm: 'argon2id' });
  const existing = await findUser(email);
  if (existing?.verified) return c.json({ error: 'An account with this email already exists' }, 409);

  if (existing) {
    // Unverified account: let the person start over with a new password and code.
    await db
      .update(schema.users)
      .set({ password_hash: passwordHash, full_name: fullName || existing.full_name, updated_date: new Date() })
      .where(eq(schema.users.id, existing.id));
  } else {
    await db.insert(schema.users).values({
      id: randomUUID(),
      email,
      full_name: fullName,
      password_hash: passwordHash,
      role: email === adminEmail() ? 'admin' : 'user',
      verified: false,
    });
  }
  await issueVerificationCode(email);
  return c.json({ ok: true }, 201);
});

auth.post('/verify-otp', async (c) => {
  const body = await readBody(c);
  const email = normEmail(body.email);
  const code = String(body.code ?? body.otpCode ?? '').trim();
  const user = await findUser(email);
  const row = await latestVerificationCode(email);
  if (!user || !row || row.expires_at < new Date()) {
    return c.json({ error: 'That code has expired. Request a new one.' }, 400);
  }
  const attempts = Number(row.attempts);
  if (attempts >= MAX_CODE_ATTEMPTS) return c.json({ error: 'Too many attempts. Request a new code.' }, 429);

  if (!sameHash(sha256(code), row.token_hash)) {
    await db
      .update(schema.authTokens)
      .set({ attempts: String(attempts + 1) })
      .where(eq(schema.authTokens.id, row.id));
    return c.json({ error: 'That code is not right' }, 400);
  }

  await db.delete(schema.authTokens).where(and(eq(schema.authTokens.email, email), eq(schema.authTokens.purpose, 'verify')));
  const isAdmin = email === adminEmail();
  const [updated] = await db
    .update(schema.users)
    .set({ verified: true, role: isAdmin ? 'admin' : user.role, updated_date: new Date() })
    .where(eq(schema.users.id, user.id))
    .returning();

  if (!isAdmin && adminEmail()) {
    const mail = newMemberEmail({
      name: updated.full_name || updated.email,
      email: updated.email,
      joinedAt: new Date().toUTCString(),
    });
    sendMail({ to: adminEmail(), ...mail }).catch((err) => console.error('admin alert failed', err));
  }

  await createSession(c, updated.id);
  return c.json({ user: toActor(updated) });
});

auth.post('/resend-otp', async (c) => {
  const body = await readBody(c);
  const email = normEmail(body.email);
  const user = await findUser(email);
  // Same answer whether or not the account exists, so this cannot be used to probe emails.
  if (!user || user.verified) return c.json({ ok: true });
  const last = await latestVerificationCode(email);
  if (last && Date.now() - last.created_date.getTime() < RESEND_SECONDS * 1000) {
    return c.json({ error: 'Please wait a minute before requesting another code' }, 429);
  }
  await issueVerificationCode(email);
  return c.json({ ok: true });
});

auth.post('/login', async (c) => {
  const body = await readBody(c);
  const email = normEmail(body.email);
  const password = String(body.password ?? '');
  if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);
  if (loginLocked(email)) return c.json({ error: 'Too many failed attempts. Try again in 15 minutes.' }, 429);

  const user = await findUser(email);
  const ok = user ? await Bun.password.verify(password, user.password_hash) : false;
  if (!user || !ok) {
    recordLoginFailure(email);
    return c.json({ error: 'Incorrect email or password' }, 401);
  }
  if (!user.verified) return c.json({ error: 'Verify your email to continue', needs_verification: true, email }, 403);

  clearLoginFailures(email);
  await createSession(c, user.id);
  return c.json({ user: toActor(user) });
});

auth.post('/logout', async (c) => {
  await endSession(c);
  return c.json({ ok: true });
});

auth.get('/me', async (c) => {
  const actor = await currentActor(c);
  if (!actor || !actor.verified) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ user: actor });
});

auth.post('/forgot', async (c) => {
  const body = await readBody(c);
  const email = normEmail(body.email);
  const user = email ? await findUser(email) : null;
  if (user?.verified) {
    const token = randomToken();
    await db.delete(schema.authTokens).where(and(eq(schema.authTokens.email, email), eq(schema.authTokens.purpose, 'reset')));
    await db.insert(schema.authTokens).values({
      id: randomUUID(),
      email,
      purpose: 'reset',
      token_hash: sha256(token),
      attempts: '0',
      expires_at: new Date(Date.now() + RESET_MINUTES * 60_000),
    });
    const link = `${(process.env.APP_URL || '').replace(/\/$/, '')}/reset-password?token=${token}`;
    const mail = resetEmail(link);
    await sendMail({ to: email, ...mail });
  }
  // Always the same response, so accounts cannot be discovered this way.
  return c.json({ ok: true });
});

auth.post('/reset', async (c) => {
  const body = await readBody(c);
  const token = String(body.token ?? '');
  const password = String(body.password ?? '');
  if (!token) return c.json({ error: 'This reset link is not valid' }, 400);
  if (password.length < MIN_PASSWORD) return c.json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, 400);

  const [row] = await db
    .select()
    .from(schema.authTokens)
    .where(
      and(
        eq(schema.authTokens.token_hash, sha256(token)),
        eq(schema.authTokens.purpose, 'reset'),
        gt(schema.authTokens.expires_at, new Date())
      )
    )
    .limit(1);
  if (!row) return c.json({ error: 'This reset link is invalid or has expired' }, 400);

  const user = await findUser(row.email);
  if (!user) return c.json({ error: 'This reset link is invalid or has expired' }, 400);

  const passwordHash = await Bun.password.hash(password, { algorithm: 'argon2id' });
  await db
    .update(schema.users)
    .set({ password_hash: passwordHash, verified: true, updated_date: new Date() })
    .where(eq(schema.users.id, user.id));
  await db.delete(schema.authTokens).where(and(eq(schema.authTokens.email, row.email), eq(schema.authTokens.purpose, 'reset')));
  // Signing out every device: a reset means someone may have had the old password.
  await db.delete(schema.sessions).where(eq(schema.sessions.user_id, user.id));
  return c.json({ ok: true });
});
