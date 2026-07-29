ALTER TABLE "daily_games" DROP CONSTRAINT "daily_games_daily_number_unique";--> statement-breakpoint
ALTER TABLE "game_attempts" DROP CONSTRAINT "attempt_player_identity";--> statement-breakpoint
DROP INDEX "attempt_active_guest_uq";--> statement-breakpoint
ALTER TABLE "daily_games" DROP COLUMN "daily_number";--> statement-breakpoint
ALTER TABLE "game_attempts" DROP COLUMN "guest_id";--> statement-breakpoint
ALTER TABLE "game_attempts" DROP COLUMN "attempt_number";