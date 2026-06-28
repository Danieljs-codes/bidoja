ALTER TABLE "bid_retractions" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "bids" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "journals" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "ledger_entries" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "paystack_webhook_events" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "strikes" DROP COLUMN "updated_at";