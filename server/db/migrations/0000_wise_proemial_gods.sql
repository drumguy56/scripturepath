CREATE TABLE "auth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"purpose" text NOT NULL,
	"token_hash" text NOT NULL,
	"attempts" text DEFAULT '0' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_connections" (
	"user_id" text NOT NULL,
	"provider" text DEFAULT 'google' NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calendar_connections_user_id_provider_pk" PRIMARY KEY("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE "records" (
	"id" text PRIMARY KEY NOT NULL,
	"entity" text NOT NULL,
	"created_by_id" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text DEFAULT '' NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_date" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_date" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calendar_connections" ADD CONSTRAINT "calendar_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_tokens_email_idx" ON "auth_tokens" USING btree ("email","purpose");--> statement-breakpoint
CREATE INDEX "records_entity_idx" ON "records" USING btree ("entity","created_date");--> statement-breakpoint
CREATE INDEX "records_owner_idx" ON "records" USING btree ("entity","created_by_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");