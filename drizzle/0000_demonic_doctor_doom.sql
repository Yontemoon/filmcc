CREATE TYPE "public"."gameStatus" AS ENUM('started', 'completed', 'failed', 'gave_up');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_games" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"display_date" date NOT NULL,
	"daily_number" integer NOT NULL,
	"start" jsonb NOT NULL,
	"end" jsonb NOT NULL,
	"start_id" integer NOT NULL,
	"end_id" integer NOT NULL,
	"par_moves" integer NOT NULL,
	"solution_path" jsonb,
	CONSTRAINT "daily_games_display_date_unique" UNIQUE("display_date"),
	CONSTRAINT "daily_games_daily_number_unique" UNIQUE("daily_number")
);
--> statement-breakpoint
CREATE TABLE "game_attempts" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_id" text,
	"attempt_number" integer NOT NULL,
	"is_ranked" boolean NOT NULL,
	"status" "gameStatus" DEFAULT 'started' NOT NULL,
	"moves" integer DEFAULT 0 NOT NULL,
	"elapsed_ms" integer,
	"path" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempt_player_identity" CHECK (("game_attempts"."user_id" is null) <> ("game_attempts"."guest_id" is null))
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"username" text,
	"display_username" text,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_game_id_daily_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."daily_games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_ranked_user_uq" ON "game_attempts" USING btree ("game_id","user_id") WHERE "game_attempts"."is_ranked" and "game_attempts"."user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_ranked_guest_uq" ON "game_attempts" USING btree ("game_id","guest_id") WHERE "game_attempts"."is_ranked" and "game_attempts"."guest_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_active_user_uq" ON "game_attempts" USING btree ("game_id","user_id") WHERE "game_attempts"."status" = 'started' and "game_attempts"."user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_active_guest_uq" ON "game_attempts" USING btree ("game_id","guest_id") WHERE "game_attempts"."status" = 'started' and "game_attempts"."guest_id" is not null;--> statement-breakpoint
CREATE INDEX "attempt_game_ranked_idx" ON "game_attempts" USING btree ("game_id") WHERE "game_attempts"."is_ranked";--> statement-breakpoint
CREATE INDEX "attempt_user_created_idx" ON "game_attempts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");