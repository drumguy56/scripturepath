import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './index';

// Applies the SQL migrations in server/db/migrations (create them with `bun server/db/new-migration.ts`).
await migrate(db, { migrationsFolder: new URL('./migrations', import.meta.url).pathname });
console.log('migrations applied');
await client.end();
