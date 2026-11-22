// Creates the next SQL migration file and registers it in the journal.
// Usage: bun server/db/new-migration.ts <short_name>
// Then write the SQL in the new file. Separate statements with `--> statement-breakpoint`.
// Apply with `npm run db:migrate`.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const name = process.argv[2]?.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
if (!name) throw new Error('Usage: bun server/db/new-migration.ts <short_name>');

const dir = new URL('./migrations/', import.meta.url).pathname;
const journalPath = `${dir}meta/_journal.json`;
const journal = JSON.parse(readFileSync(journalPath, 'utf8'));
const idx = journal.entries.length;
const tag = `${String(idx).padStart(4, '0')}_${name}`;
const file = `${dir}${tag}.sql`;
if (existsSync(file)) throw new Error(`${file} already exists`);

const when = Math.max(Date.now(), (journal.entries.at(-1)?.when ?? 0) + 1);
journal.entries.push({ idx, version: '7', when, tag, breakpoints: true });
writeFileSync(file, `-- ${name}\n`);
writeFileSync(journalPath, JSON.stringify(journal, null, 2));
console.log(`created ${file}`);
