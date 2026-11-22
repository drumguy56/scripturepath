ALTER TABLE "auth_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "auth_tokens" CASCADE;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verified" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";