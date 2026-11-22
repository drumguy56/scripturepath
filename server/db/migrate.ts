import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, client } from './index';

// Applies the SQL migrations in server/db/migrations (generate them with `npm run db:generate`).
await migrate(db, { migrationsFolder: new URL('./migrations', import.meta.url).pathname });
console.log('migrations applied');
await client.end();
