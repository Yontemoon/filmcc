CREATE TYPE "public"."gameStatus" AS ENUM('started', 'completed', 'failed', 'game_up', 'error');--> statement-breakpoint
CREATE TABLE "games" (
	"userId" text,
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" "gameStatus",
	"metadata" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;