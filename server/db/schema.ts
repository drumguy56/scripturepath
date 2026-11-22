import { boolean, index, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

// Accounts. Passwords are argon2id hashes (Bun.password), never stored raw.
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  full_name: text('full_name').notNull().default(''),
  password_hash: text('password_hash').notNull(),
  role: text('role').notNull().default('user'),
  verified: boolean('verified').notNull().default(false),
  created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
  updated_date: timestamp('updated_date', { withTimezone: true }).notNull().defaultNow(),
});

// Opaque session tokens. Only the SHA-256 of the token is stored.
export const sessions = pgTable(
  'sessions',
  {
    token_hash: text('token_hash').primaryKey(),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sessions_user_idx').on(t.user_id)]
);

// One-time codes: email verification (6-digit) and password reset (long token).
export const authTokens = pgTable(
  'auth_tokens',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    purpose: text('purpose').notNull(), // 'verify' | 'reset'
    token_hash: text('token_hash').notNull(),
    attempts: text('attempts').notNull().default('0'),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_date: timestamp('created_date', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('auth_tokens_email_idx').on(t.email, t.purpose)]
);

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
