import * as SecureStore from 'expo-secure-store';

// Talks to the same backend as the web app. Auth is a Bearer JWT; the long-lived session value
// (Neon's session cookie, relayed by /api/mobile) is kept in the device's secure storage.
export const API_BASE = 'https://scripturepathstudio.com/api';
export const WEB_BASE = 'https://scripturepathstudio.com';

const SESSION_KEY = 'scripturepath.session';

let cachedToken: string | null = null;
let cachedExp = 0;

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function decodeExp(jwt: string): number {
  try {
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return (JSON.parse(atob(payload)) as { exp?: number }).exp ?? 0;
  } catch {
    return 0;
  }
}

export async function getStoredSession() {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function storeSession(session: string) {
  await SecureStore.setItemAsync(SESSION_KEY, session);
}

export async function clearSession() {
  cachedToken = null;
  cachedExp = 0;
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

// Returns a JWT that is valid for at least another minute, renewing it from the stored session.
async function freshToken(): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedExp - 60 > now) return cachedToken;
  const session = await getStoredSession();
  if (!session) return null;
  const res = await fetch(`${API_BASE}/mobile/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ session }),
  }).catch(() => null);
  if (!res) return null; // offline: keep the session, try again later
  if (res.status === 401) {
    await clearSession();
    return null;
  }
  if (!res.ok) return null;
  const data = (await res.json()) as { token: string; session?: string };
  if (data.session && data.session !== session) await storeSession(data.session);
  cachedToken = data.token;
  cachedExp = decodeExp(data.token);
  return data.token;
}

export function setToken(token: string) {
  cachedToken = token;
  cachedExp = decodeExp(token);
}

async function parse(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  const token = await freshToken();
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parse(res);
  if (!res.ok) {
    const message = (data && typeof data === 'object' && (data as any).error) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

// ---- Auth ----

export type User = { id: string; email: string; name?: string | null };

type SessionReply = { token: string; session: string; user: User | null };

async function establish(path: string, body: unknown): Promise<User | null> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await parse(res)) as SessionReply | { error?: string } | null;
  if (!res.ok || !data || !('token' in data)) {
    throw new ApiError((data as any)?.error || 'Something went wrong. Try again.', res.status, data);
  }
  await storeSession(data.session);
  setToken(data.token);
  return data.user;
}

export const auth = {
  signIn: (email: string, password: string) => establish('/mobile/sign-in', { email, password }),
  signUp: (name: string, email: string, password: string) =>
    establish('/mobile/sign-up', { name, email, password }),

  // Resolves to the signed-in user, or null when there is no valid session.
  restore: async (): Promise<User | null> => {
    const token = await freshToken();
    if (!token) return null;
    try {
      const data = await request<{ user: User }>('GET', '/auth/me');
      return data.user;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) await clearSession();
      return null;
    }
  },

  signOut: async () => {
    const session = await getStoredSession();
    if (session) {
      await fetch(`${API_BASE}/mobile/sign-out`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session }),
      }).catch(() => null);
    }
    await clearSession();
  },

  // Neon emails the reset link; it opens on the web, which owns the reset form.
  requestPasswordReset: (email: string) =>
    request('POST', '/auth/request-password-reset', { email, redirectTo: `${WEB_BASE}/reset-password` }),
};

// ---- Entities (same shapes as the web client) ----

export type Row = { id: string; created_date?: string; updated_date?: string; [key: string]: any };
type Page = { items: Row[] };
type Opts = { sort?: string; limit?: number };

function entity(name: string) {
  const base = `/entities/${name}`;
  return {
    list: (opts: Opts = {}) => request<Page>('POST', `${base}/query`, { ...opts }),
    filter: (query: Record<string, unknown> = {}, opts: Opts = {}) =>
      request<Page>('POST', `${base}/query`, { filter: query, ...opts }),
    get: (id: string) => request<Row>('GET', `${base}/${encodeURIComponent(id)}`),
    count: (query: Record<string, unknown> = {}) =>
      request<{ count: number }>('POST', `${base}/count`, { filter: query }).then((r) => r.count),
    create: (data: Record<string, unknown>) => request<Row>('POST', base, data),
    update: (id: string, patch: Record<string, unknown>) =>
      request<Row>('PATCH', `${base}/${encodeURIComponent(id)}`, patch),
    delete: (id: string) => request<unknown>('DELETE', `${base}/${encodeURIComponent(id)}`),
  };
}

export const entities = {
  Study: entity('Study'),
  Lesson: entity('Lesson'),
  StudyProgress: entity('StudyProgress'),
  JournalEntry: entity('JournalEntry'),
  StudyGroup: entity('StudyGroup'),
};

// ---- Server functions ----

export const functions = {
  invoke: async <T = any>(name: string, body: Record<string, unknown> = {}) => ({
    data: await request<T>('POST', `/functions/${encodeURIComponent(name)}`, body),
  }),
};
