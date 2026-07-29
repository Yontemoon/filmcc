DROP INDEX "attempt_ranked_user_uq";--> statement-breakpoint
DROP INDEX "attempt_ranked_guest_uq";--> statement-breakpoint
DROP INDEX "attempt_game_ranked_idx";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_anonymous" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "game_attempts" DROP COLUMN "is_ranked";--> statement-breakpoint
ALTER TABLE "daily_games" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;--> statement-breakpoint
ALTER TABLE "daily_games" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "daily_games" ALTER COLUMN "par_moves" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "game_attempts" ALTER COLUMN "game_id" SET DATA TYPE integer USING "game_id"::integer;--> statement-breakpoint
DROP INDEX "attempt_active_user_uq";--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_active_user_uq" ON "game_attempts" ("game_id","user_id") WHERE "status" = 'started' and "user_id" is not null;--> statement-breakpoint
DROP INDEX "attempt_active_guest_uq";--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_active_guest_uq" ON "game_attempts" ("game_id","guest_id") WHERE "status" = 'started' and "guest_id" is not null;--> statement-breakpoint
ALTER TABLE "daily_games" ADD CONSTRAINT "daily_games_id_key" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "game_attempts" DROP CONSTRAINT "attempt_player_identity", ADD CONSTRAINT "attempt_player_identity" CHECK (("user_id" is null) <> ("guest_id" is null));