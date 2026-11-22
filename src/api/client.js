// Thin client for the app's own API (server/). Call shapes mirror what the pages use:
//   entities.<Name>.list(opts) / filter(query, opts) / get(id) / create(data)
//   entities.<Name>.update(id, patch) / delete(id) / count(query) / subscribe(cb)
//   functions.invoke(name, body) -> { data }
// Errors are thrown with .status, .data and .response.{status,data}.

async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    err.response = { status: res.status, data };
    throw err;
  }
  return data;
}

// ---- Live updates: one EventSource shared by every subscriber ----
const listeners = new Set();
let source = null;

function ensureSource() {
  if (source || typeof EventSource === 'undefined') return;
  source = new EventSource('/api/events', { withCredentials: true });
  source.onmessage = (msg) => {
    let event;
    try {
      event = JSON.parse(msg.data);
    } catch {
      return;
    }
    for (const fn of listeners) fn(event);
  };
  // EventSource reconnects on its own; nothing to do on error.
}

function subscribe(entity, cb) {
  const handler = (event) => {
    if (event.entity === entity) cb(event);
  };
  listeners.add(handler);
  ensureSource();
  return () => {
    listeners.delete(handler);
    if (listeners.size === 0 && source) {
      source.close();
      source = null;
    }
  };
}

// ---- Entities ----
function entity(name) {
  const base = `/entities/${name}`;
  return {
    list: (opts = {}) => request('POST', `${base}/query`, { ...opts }),
    filter: (query = {}, opts = {}) => request('POST', `${base}/query`, { filter: query, ...opts }),
    get: (id) => request('GET', `${base}/${encodeURIComponent(id)}`),
    count: (query = {}) => request('POST', `${base}/count`, { filter: query }).then((r) => r.count),
    create: (data) => request('POST', base, data),
    update: (id, patch) => request('PATCH', `${base}/${encodeURIComponent(id)}`, patch),
    delete: (id) => request('DELETE', `${base}/${encodeURIComponent(id)}`),
    subscribe: (cb) => subscribe(name, cb),
  };
}

const ENTITY_NAMES = [
  'Study',
  'Lesson',
  'StudyGroup',
  'StudyProgress',
  'JournalEntry',
  'GroupMessage',
  'LessonComment',
  'SessionAttendance',
  'SessionEvent',
  'BibleChapter',
];

export const entities = Object.fromEntries(ENTITY_NAMES.map((name) => [name, entity(name)]));

// ---- Server functions (server/functions) ----
export const functions = {
  invoke: async (name, body = {}) => {
    const data = await request('POST', `/functions/${encodeURIComponent(name)}`, body);
    return { data };
  },
};

// ---- Auth (email + password, own sessions) ----
export const auth = {
  register: (email, password) => request('POST', '/auth/register', { email, password }),
  verifyOtp: (email, code) => request('POST', '/auth/verify-otp', { email, code }),
  resendOtp: (email) => request('POST', '/auth/resend-otp', { email }),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  logout: () => request('POST', '/auth/logout'),
  // Resolves to the user, or rejects with status 401 when signed out.
  me: async () => (await request('GET', '/auth/me')).user,
  forgot: (email) => request('POST', '/auth/forgot', { email }),
  reset: (token, password) => request('POST', '/auth/reset', { token, password }),
};

// ---- Google Calendar ----
export const calendar = {
  // Opens the consent flow in a popup; the callback page closes it.
  connectUrl: '/api/calendar/connect',
  disconnect: () => request('POST', '/calendar/disconnect'),
};
