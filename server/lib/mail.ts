// Transactional email. Uses Resend's HTTP API when RESEND_API_KEY is set; otherwise the
// message is printed to the server log so local development still works end to end.
export type Mail = { to: string; subject: string; html: string; text: string };

export async function sendMail(mail: Mail): Promise<{ delivered: boolean }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'ScripturePath <no-reply@localhost>';
  if (!key) {
    console.log(`[mail:not-configured] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return { delivered: false };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    console.error('[mail] Resend rejected the message', res.status, await res.text().catch(() => ''));
    return { delivered: false };
  }
  return { delivered: true };
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

export function codeEmail(code: string) {
  const text = `Your ScripturePath verification code is ${code}. It expires in 15 minutes.`;
  const html = `<p>Your ScripturePath verification code is:</p><p style="font-size:28px;letter-spacing:6px;font-weight:700">${code}</p><p>It expires in 15 minutes. If you did not sign up, ignore this email.</p>`;
  return { subject: 'Your ScripturePath verification code', html, text };
}

export function resetEmail(link: string) {
  const text = `Reset your ScripturePath password: ${link}\nThis link expires in 1 hour. If you did not ask for this, ignore this email.`;
  const html = `<p>Reset your ScripturePath password:</p><p><a href="${escape(link)}">Choose a new password</a></p><p>This link expires in 1 hour. If you did not ask for this, ignore this email.</p>`;
  return { subject: 'Reset your ScripturePath password', html, text };
}

export function newMemberEmail(fields: { name: string; email: string; joinedAt: string }) {
  const name = escape(fields.name);
  const email = escape(fields.email);
  const joined = escape(fields.joinedAt);
  const text = `${fields.name} (${fields.email}) just joined ScripturePath on ${fields.joinedAt}.`;
  const html = `<div style="font-family:Arial,sans-serif;background:#1a1714;color:#fbf8f4;padding:32px">
<h2 style="margin:0 0 8px">A new member just joined</h2>
<p style="color:#45bcf7">${name} created an account and can now begin a study.</p>
<table style="margin-top:16px;font-size:15px">
<tr><td style="color:#45bcf7;padding:6px 16px 6px 0">Name</td><td>${name}</td></tr>
<tr><td style="color:#45bcf7;padding:6px 16px 6px 0">Email</td><td>${email}</td></tr>
<tr><td style="color:#45bcf7;padding:6px 16px 6px 0">Date</td><td>${joined}</td></tr>
</table>
<p style="margin-top:24px"><a href="${escape(process.env.APP_URL || '')}" style="background:#934225;color:#fbf8f4;padding:12px 22px;border-radius:24px;text-decoration:none;font-weight:700">Open ScripturePath</a></p>
<p style="color:#45bcf7;font-size:13px">You receive this note because you are an admin of ScripturePath.</p>
</div>`;
  return { subject: `New member: ${fields.name}`, html, text };
}
