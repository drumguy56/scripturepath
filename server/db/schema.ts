import { boolean, index, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

// App-side account rows. Sign-in is handled by Neon Auth; `id` is the Neon Auth user id
// (the JWT `sub`), and each row is created or refreshed on the user's first verified request.
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  full_name: text('full_name').notNull().default(''),
  role: text('role').notNull().default('user'),
  verified: boolean('verified').notNull().default(true),
  created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
  updated_date: timestamp('updated_date', { withTimezone: true }).notNull().defaultNow(),
});

// Every app record (studies, lessons, groups, progress, journal, chat...) lives here.
// Base columns are real columns; the entity's own fields live in `data`.
export const records = pgTable(
  'records',
  {
    id: text('id').primaryKey(),
    entity: text('entity').notNull(),
    created_by_id: text('created_by_id'),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
    created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
    updated_date: timestamp('updated_date', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('records_entity_idx').on(t.entity, t.created_date),
    index('records_owner_idx').on(t.entity, t.created_by_id),
  ]
);

// Google Calendar link per user (one connection per account).
export const calendarConnections = pgTable(
  'calendar_connections',
  {
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('google'),
    access_token: text('access_token').notNull(),
    refresh_token: text('refresh_token').notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.provider] })]
);

// OAuth clients are created by an operator with server/scripts/oauth-client.ts. Only the
// SHA-256 of a confidential client's secret is stored; public (PKCE-only) clients have none.
export const oauthClients = pgTable('oauth_clients', {
  client_id: text('client_id').primaryKey(),
  name: text('name').notNull(),
  secret_hash: text('secret_hash'),
  redirect_uris: jsonb('redirect_uris').$type<string[]>().notNull().default([]),
  created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
});

// Single-use authorization codes (hashed), valid for a few minutes, bound to PKCE.
export const oauthCodes = pgTable('oauth_codes', {
  code_hash: text('code_hash').primaryKey(),
  client_id: text('client_id').notNull().references(() => oauthClients.client_id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  redirect_uri: text('redirect_uri').notNull(),
  scope: text('scope').notNull(),
  code_challenge: text('code_challenge').notNull(),
  expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
});

// Access tokens (hashed). Expire after an hour; revoked when their client is deleted.
export const oauthTokens = pgTable(
  'oauth_tokens',
  {
    token_hash: text('token_hash').primaryKey(),
    client_id: text('client_id').notNull().references(() => oauthClients.client_id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    scope: text('scope').notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('oauth_tokens_user_idx').on(t.user_id)]
);
