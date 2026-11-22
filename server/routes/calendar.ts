import { randomBytes } from 'node:crypto';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { getActor, isSecureUrl, requireActor } from '../lib/auth';
import { consentUrl, disconnectGoogle, exchangeCode, googleConfigured } from '../lib/google';

export const calendar = new Hono();

const STATE_COOKIE = 'sp_gcal_state';

const page = (title: string, message: string) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="font-family:system-ui;background:#1a1714;color:#fbf8f4;padding:32px">
<p>${message}</p><script>setTimeout(function(){window.close()},800)</script></body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );

// Opens Google's consent screen. The app opens this in a popup and watches for it to close.
calendar.get('/connect', requireActor, (c) => {
  if (!googleConfigured()) {
    return c.json({ error: 'Google Calendar is not configured on this server. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and APP_URL.' }, 503);
  }
  const state = randomBytes(24).toString('base64url');
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isSecureUrl(),
    path: '/api/calendar',
    maxAge: 600,
  });
  return c.redirect(consentUrl(state));
});

calendar.get('/callback', requireActor, async (c) => {
  const actor = getActor(c);
  const expected = getCookie(c, STATE_COOKIE);
  deleteCookie(c, STATE_COOKIE, { path: '/api/calendar' });
  const state = c.req.query('state');
  if (!expected || !state || expected !== state) return page('Calendar', 'That link has expired. Try connecting again.');
  if (c.req.query('error')) return page('Calendar', 'Calendar access was not granted.');
  const code = c.req.query('code');
  if (!code) return page('Calendar', 'Google did not return a code. Try connecting again.');
  try {
    await exchangeCode(code, actor.id);
    return page('Calendar connected', 'Google Calendar is connected. You can close this window.');
  } catch (error) {
    console.error('calendar callback failed', error);
    return page('Calendar', 'Could not connect Google Calendar. Try again.');
  }
});

calendar.post('/disconnect', requireActor, async (c) => {
  await disconnectGoogle(getActor(c).id);
  return c.json({ ok: true });
});
