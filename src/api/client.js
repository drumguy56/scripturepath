import { createRealtimeClient } from '@neon/realtime/client';

// Thin client for the app's own API (server/). Call shapes mirror what the pages use:
//   entities.<Name>.list(opts) / filter(query, opts) / get(id) / create(data)
//   entities.<Name>.update(id, patch) / delete(id) / count(query) / subscribe(cb)
//   functions.invoke(name, body) -> { data }
// Errors are thrown with .status, .data and .response.{status,data}.

// Neon Auth JWT, fetched through the app's /api/auth/token proxy and cached until shortly before expiry.
let tokenCache = null; // { token, exp }

export async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.exp - 60 > now) return tokenCache.token;
  tokenCache = null;
  const res = await fetch('/api/auth/token', { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data?.token) return null;
  const payload = JSON.parse(atob(data.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  tokenCache = { token: data.token, exp: payload.exp || now + 900 };
  return data.token;
}

function clearToken() {
  tokenCache = null;
}

async function request(method, path, body) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers,
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

// ---- Live updates: Neon Realtime. One sealed live query per entity, shared by every subscriber. ----
// The server seals a query that matches the REST read rules for the caller; Neon pushes the
// full result set and we diff it into create / update / delete events.
const groups = new Map(); // entity -> group
let realtimeClient = null;

function getRealtimeClient() {
  if (realtimeClient) return realtimeClient;
  const url = import.meta.env.VITE_NEON_REALTIME_URL;
  if (!url) return null;
  realtimeClient = createRealtimeClient({ url, logLevel: 'error' });
  return realtimeClient;
}

// Row shape matches the REST API (server/lib/records.ts toRecord).
function toRecord(row) {
  let data = row.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  const iso = (v) => (v instanceof Date ? v.toISOString() : v);
  return {
    ...(data || {}),
    id: row.id,
    created_by_id: row.created_by_id ?? null,
    created_date: iso(row.created_date),
    updated_date: iso(row.updated_date),
  };
}

function emit(group, event) {
  for (const cb of [...group.listeners]) {
    try {
      cb(event);
    } catch (err) {
      console.error('live update listener failed', err);
    }
  }
}

function handleSnapshot(group, snap) {
  if (group.closed) return;
  if (snap.status === 'error') {
    group.sub?.unsubscribe();
    group.sub = null;
    retryLater(group, 2000);
    return;
  }
  if (snap.data === undefined) return;
  const next = new Map();
  for (const row of snap.data) {
    const rec = toRecord(row);
    next.set(rec.id, rec);
  }
  // The first snapshot is the baseline: it is not reported as changes.
  if (group.rows) {
    for (const [id, rec] of next) {
      const prev = group.rows.get(id);
      if (!prev) emit(group, { type: 'create', entity: group.entity, id, data: rec });
      else if (JSON.stringify(prev) !== JSON.stringify(rec)) emit(group, { type: 'update', entity: group.entity, id, data: rec });
    }
    for (const [id, rec] of group.rows) {
      if (!next.has(id)) emit(group, { type: 'delete', entity: group.entity, id, data: rec });
    }
  }
  group.rows = next;
}

function scheduleRenew(group, sealed) {
  clearTimeout(group.timer);
  const delay = Math.max(1000, sealed.expiresAt - Date.now() - 10000);
  group.timer = setTimeout(() => renew(group), delay);
}

async function renew(group) {
  const sub = group.sub;
  if (group.closed || !sub) return;
  try {
    const sealed = await request('POST', '/realtime/seal', { entity: group.entity });
    if (group.closed || group.sub !== sub) return;
    await sub.renew(sealed);
    scheduleRenew(group, sealed);
  } catch (err) {
    if (group.closed || group.sub !== sub) return;
    if (err?.status === 401) return; // signed out: the page is about to leave
    group.timer = setTimeout(() => renew(group), 1000);
  }
}

function retryLater(group, ms) {
  clearTimeout(group.timer);
  group.timer = setTimeout(() => {
    group.sub?.unsubscribe();
    group.sub = null;
    start(group);
  }, ms);
}

async function start(group) {
  const client = getRealtimeClient();
  if (!client) return;
  try {
    const sealed = await request('POST', '/realtime/seal', { entity: group.entity });
    if (group.closed) return;
    const sub = client.subscribe(sealed);
    group.sub = sub;
    sub.onChange((snap) => handleSnapshot(group, snap));
    handleSnapshot(group, sub.getSnapshot());
    scheduleRenew(group, sealed);
  } catch (err) {
    if (group.closed) return;
    if (err?.status === 401) return;
    retryLater(group, 2000);
  }
}

function subscribe(entity, cb) {
  let group = groups.get(entity);
  if (!group) {
    group = { entity, listeners: new Set(), sub: null, timer: null, rows: null, closed: false };
    groups.set(entity, group);
    start(group);
  }
  group.listeners.add(cb);
  return () => {
    group.listeners.delete(cb);
    if (group.listeners.size === 0 && !group.closed) {
      group.closed = true;
      clearTimeout(group.timer);
      group.sub?.unsubscribe();
      group.sub = null;
      if (groups.get(entity) === group) groups.delete(entity);
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

// ---- Auth (Neon Auth, reached through the app's /api/auth proxy) ----
// Neon sets its session cookie on the app origin; the JWT for API calls comes from /api/auth/token.
export const auth = {
  register: (name, email, password) => request('POST', '/auth/sign-up/email', { name, email, password }),
  login: (email, password) => request('POST', '/auth/sign-in/email', { email, password }).then((r) => {
    clearToken();
    return r;
  }),
  logout: () => request('POST', '/auth/sign-out', {}).finally(clearToken),
  // Resolves to the user, or rejects with status 401 when signed out.
  me: async () => (await request('GET', '/auth/me')).user,
  forgot: (email) =>
    request('POST', '/auth/request-password-reset', {
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    }),
  reset: (token, newPassword) => request('POST', '/auth/reset-password', { token, newPassword }),
};

// ---- AI study companion (Neon AI Gateway, signed-in users) ----
export const ai = {
  // history: [{ role: 'user'|'assistant', content }], ending with the user's question.
  // Resolves to { reply, model }.
  studyChat: (studyId, lessonId, history) => request('POST', '/ai/study-chat', { studyId, lessonId, messages: history }),
};

// ---- Google Calendar ----
export const calendar = {
  // Opens the consent flow in a popup; the callback page closes it.
  connectUrl: '/api/calendar/connect',
  disconnect: () => request('POST', '/calendar/disconnect'),
};
