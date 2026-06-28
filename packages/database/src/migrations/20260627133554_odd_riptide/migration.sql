CREATE TYPE "ban_type" AS ENUM('temporary', 'permanent');--> statement-breakpoint
CREATE TYPE "dispute_outcome" AS ENUM('full_refund', 'partial_refund', 'released_to_seller');--> statement-breakpoint
CREATE TYPE "dispute_reason" AS ENUM('never_arrived', 'not_as_described', 'arrived_damaged', 'wrong_item_sent');--> statement-breakpoint
CREATE TYPE "dispute_status" AS ENUM('open', 'resolved', 'rejected');--> statement-breakpoint
CREATE TYPE "dva_assignment_status" AS ENUM('not_started', 'pending', 'assigned', 'failed');--> statement-breakpoint
CREATE TYPE "journal_type" AS ENUM('deposit', 'deposit_reversal', 'bid_lock', 'bid_unlock', 'lock_to_escrow', 'escrow_release', 'refund', 'withdrawal', 'withdrawal_reversal', 'seller_payout', 'seller_payout_reversal', 'platform_fee', 'processing_fee', 'correction');--> statement-breakpoint
CREATE TYPE "ledger_account_code" AS ENUM('cash', 'user_available', 'user_locked', 'escrow', 'seller_payable', 'platform_revenue', 'payment_processing_expense');--> statement-breakpoint
CREATE TYPE "ledger_account_scope" AS ENUM('system', 'wallet');--> statement-breakpoint
CREATE TYPE "ledger_account_type" AS ENUM('asset', 'liability', 'revenue', 'expense');--> statement-breakpoint
CREATE TYPE "listing_condition" AS ENUM('new', 'like_new', 'good', 'fair', 'poor');--> statement-breakpoint
CREATE TYPE "listing_status" AS ENUM('draft', 'pending_review', 'active', 'closed', 'cancelled', 'sold');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('outbid', 'auction_ending_soon', 'anti_snipe_extension', 'auction_won', 'auction_lost', 'new_message', 'seller_marked_shipped', 'dispute_opened', 'dispute_resolved', 'payout_released', 'wallet_funded', 'strike_issued');--> statement-breakpoint
CREATE TYPE "paystack_customer_identification_status" AS ENUM('not_started', 'pending', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "paystack_transfer_status" AS ENUM('pending', 'success', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "paystack_transfer_type" AS ENUM('withdrawal', 'seller_payout');--> statement-breakpoint
CREATE TYPE "report_status" AS ENUM('pending', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TYPE "report_type" AS ENUM('listing', 'user', 'message');--> statement-breakpoint
CREATE TYPE "retraction_reason" AS ENUM('wrong_amount', 'listing_changed');--> statement-breakpoint
CREATE TYPE "transaction_status" AS ENUM('pending', 'held', 'released', 'refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('buyer', 'seller', 'admin');--> statement-breakpoint
CREATE TYPE "user_status" AS ENUM('active', 'flagged', 'suspended', 'banned');--> statement-breakpoint
CREATE TYPE "wallet_status" AS ENUM('pending', 'active', 'failed', 'deactivated');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp(6) with time zone,
	"refresh_token_expires_at" timestamp(6) with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bid_retractions" (
	"bid_id" uuid PRIMARY KEY,
	"listing_id" uuid NOT NULL,
	"bidder_id" uuid NOT NULL,
	"reason" "retraction_reason" NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bid_retractions_one_per_listing_bidder_unique" UNIQUE("listing_id","bidder_id")
);
--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"listing_id" uuid NOT NULL,
	"bidder_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bids_id_listing_bidder_unique" UNIQUE("id","listing_id","bidder_id"),
	CONSTRAINT "bids_id_amount_unique" UNIQUE("id","amount"),
	CONSTRAINT "bids_listing_id_id_unique" UNIQUE("listing_id","id"),
	CONSTRAINT "bids_amount_check" CHECK ("amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"transaction_id" uuid NOT NULL,
	"raised_by_id" uuid NOT NULL,
	"reason" "dispute_reason" NOT NULL,
	"description" text NOT NULL,
	"evidence_urls" jsonb DEFAULT '[]' NOT NULL,
	"status" "dispute_status" DEFAULT 'open'::"dispute_status" NOT NULL,
	"outcome" "dispute_outcome",
	"resolved_by_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp(6) with time zone,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journals" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"type" "journal_type" NOT NULL,
	"description" text NOT NULL,
	"reference" text NOT NULL UNIQUE,
	"triggered_by_user_id" uuid,
	"paystack_reference" text,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_account_templates" (
	"code" "ledger_account_code" PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"type" "ledger_account_type" NOT NULL,
	"scope" "ledger_account_scope" NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_account_templates_code_scope_unique" UNIQUE("code","scope"),
	CONSTRAINT "ledger_account_templates_code_definition_check" CHECK (("code" = 'cash' AND "name" = 'Cash' AND "type" = 'asset' AND "scope" = 'system') OR ("code" = 'platform_revenue' AND "name" = 'Platform Revenue' AND "type" = 'revenue' AND "scope" = 'system') OR ("code" = 'payment_processing_expense' AND "name" = 'Payment Processing Expense' AND "type" = 'expense' AND "scope" = 'system') OR ("code" = 'user_available' AND "name" = 'User Available' AND "type" = 'liability' AND "scope" = 'wallet') OR ("code" = 'user_locked' AND "name" = 'User Locked' AND "type" = 'liability' AND "scope" = 'wallet') OR ("code" = 'escrow' AND "name" = 'Escrow' AND "type" = 'liability' AND "scope" = 'wallet') OR ("code" = 'seller_payable' AND "name" = 'Seller Payable' AND "type" = 'liability' AND "scope" = 'wallet'))
);
--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"code" "ledger_account_code" NOT NULL,
	"scope" "ledger_account_scope" NOT NULL,
	"wallet_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_accounts_scope_wallet_check" CHECK (("scope" = 'system' AND "wallet_id" IS NULL) OR ("scope" = 'wallet' AND "wallet_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"journal_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"debit" bigint,
	"credit" bigint,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_entries_single_side_check" CHECK (("debit" IS NOT NULL AND "debit" > 0 AND "credit" IS NULL) OR ("credit" IS NOT NULL AND "credit" > 0 AND "debit" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "listing_bid_state" (
	"listing_id" uuid PRIMARY KEY,
	"current_highest_bid_id" uuid,
	"bid_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listing_bid_state_bid_count_check" CHECK ("bid_count" >= 0),
	CONSTRAINT "listing_bid_state_current_bid_requires_bid_count_check" CHECK ("current_highest_bid_id" IS NULL OR "bid_count" > 0)
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"listing_id" uuid NOT NULL,
	"url" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listing_images_order_check" CHECK ("order" BETWEEN 1 AND 20)
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"seller_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"condition" "listing_condition" NOT NULL,
	"category_id" uuid NOT NULL,
	"starting_bid" bigint NOT NULL,
	"buy_now_price" bigint,
	"search_vector" tsvector GENERATED ALWAYS AS (setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', description), 'B')) STORED NOT NULL,
	"status" "listing_status" DEFAULT 'draft'::"listing_status" NOT NULL,
	"auction_start" timestamp(6) with time zone NOT NULL,
	"auction_end" timestamp(6) with time zone NOT NULL,
	"extension_count" integer DEFAULT 0 NOT NULL,
	"is_replica" boolean DEFAULT false NOT NULL,
	"seller_deposit_held" boolean DEFAULT false NOT NULL,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp(6) with time zone,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listings_id_seller_unique" UNIQUE("id","seller_id"),
	CONSTRAINT "listings_auction_time_check" CHECK ("auction_end" > "auction_start"),
	CONSTRAINT "listings_auction_duration_check" CHECK ("auction_end" >= "auction_start" + interval '5 minutes' AND "auction_end" <= "auction_start" + interval '7 days'),
	CONSTRAINT "listings_starting_bid_check" CHECK ("starting_bid" > 0),
	CONSTRAINT "listings_buy_now_price_check" CHECK ("buy_now_price" IS NULL OR "buy_now_price" >= "starting_bid"),
	CONSTRAINT "listings_extension_count_check" CHECK ("extension_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"transaction_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"send_push" boolean DEFAULT false NOT NULL,
	"send_email" boolean DEFAULT false NOT NULL,
	"send_in_app" boolean DEFAULT true NOT NULL,
	"read_at" timestamp(6) with time zone,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paystack_transfers" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"wallet_id" uuid NOT NULL,
	"journal_id" uuid UNIQUE,
	"type" "paystack_transfer_type" NOT NULL,
	"status" "paystack_transfer_status" DEFAULT 'pending'::"paystack_transfer_status" NOT NULL,
	"amount" bigint NOT NULL,
	"paystack_reference" text UNIQUE,
	"paystack_transfer_code" text UNIQUE,
	"failure_reason" text,
	"requested_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp(6) with time zone,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paystack_transfers_amount_check" CHECK ("amount" > 0),
	CONSTRAINT "paystack_transfers_min_withdrawal_check" CHECK ("type" <> 'withdrawal' OR "amount" >= 1000)
);
--> statement-breakpoint
CREATE TABLE "paystack_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"event" text NOT NULL,
	"paystack_reference" text,
	"paystack_customer_code" text,
	"dva_account_number" text,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp(6) with time zone,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"transaction_id" uuid NOT NULL UNIQUE,
	"reviewer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"comment" text,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ratings_score_check" CHECK ("score" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"transaction_id" uuid NOT NULL UNIQUE,
	"url" text NOT NULL,
	"generated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"emailed_at" timestamp(6) with time zone,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"reporter_id" uuid NOT NULL,
	"reported_user_id" uuid,
	"reported_listing_id" uuid,
	"reported_message_id" uuid,
	"type" "report_type" NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'pending'::"report_status" NOT NULL,
	"reviewed_by_id" uuid,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_type_target_check" CHECK (("type" = 'user' AND "reported_user_id" IS NOT NULL AND "reported_listing_id" IS NULL AND "reported_message_id" IS NULL) OR ("type" = 'listing' AND "reported_listing_id" IS NOT NULL AND "reported_user_id" IS NULL AND "reported_message_id" IS NULL) OR ("type" = 'message' AND "reported_message_id" IS NOT NULL AND "reported_user_id" IS NULL AND "reported_listing_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"expires_at" timestamp(6) with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"impersonated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "strikes" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"issued_by_id" uuid,
	"issued_by_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "strikes_issuer_check" CHECK (("issued_by_id" IS NOT NULL AND "issued_by_system" = FALSE) OR ("issued_by_id" IS NULL AND "issued_by_system" = TRUE))
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"listing_id" uuid NOT NULL UNIQUE,
	"buyer_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"winning_bid_id" uuid NOT NULL UNIQUE,
	"winning_bid_amount" bigint NOT NULL,
	"platform_fee" bigint NOT NULL,
	"seller_payout" bigint NOT NULL,
	"status" "transaction_status" DEFAULT 'pending'::"transaction_status" NOT NULL,
	"shipped_at" timestamp(6) with time zone,
	"confirmed_at" timestamp(6) with time zone,
	"dispute_window_closes_at" timestamp(6) with time zone,
	"payout_released_at" timestamp(6) with time zone,
	"refund_released_at" timestamp(6) with time zone,
	"chat_read_only" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_buyer_seller_distinct_check" CHECK ("buyer_id" <> "seller_id"),
	CONSTRAINT "transactions_winning_bid_amount_check" CHECK ("winning_bid_amount" > 0),
	CONSTRAINT "transactions_platform_fee_check" CHECK ("platform_fee" >= 0),
	CONSTRAINT "transactions_seller_payout_check" CHECK ("seller_payout" >= 0),
	CONSTRAINT "transactions_fee_split_check" CHECK ("platform_fee" + "seller_payout" = "winning_bid_amount"),
	CONSTRAINT "transactions_confirmed_requires_shipped_check" CHECK ("confirmed_at" IS NULL OR "shipped_at" IS NOT NULL),
	CONSTRAINT "transactions_confirmed_after_shipped_check" CHECK ("confirmed_at" IS NULL OR "confirmed_at" >= "shipped_at"),
	CONSTRAINT "transactions_dispute_window_requires_shipped_check" CHECK ("dispute_window_closes_at" IS NULL OR "shipped_at" IS NOT NULL),
	CONSTRAINT "transactions_dispute_window_after_shipped_check" CHECK ("dispute_window_closes_at" IS NULL OR "dispute_window_closes_at" >= "shipped_at"),
	CONSTRAINT "transactions_released_requires_payout_check" CHECK ("status" <> 'released' OR "payout_released_at" IS NOT NULL),
	CONSTRAINT "transactions_refunded_requires_refund_check" CHECK ("status" <> 'refunded' OR "refund_released_at" IS NOT NULL),
	CONSTRAINT "transactions_disputed_not_finalized_check" CHECK ("status" <> 'disputed' OR ("payout_released_at" IS NULL AND "refund_released_at" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "two_factors" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" uuid NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"name" text NOT NULL,
	"image" text,
	"email" text NOT NULL UNIQUE,
	"phone" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"is_phone_verified" boolean DEFAULT false NOT NULL,
	"is_identity_verified" boolean DEFAULT false NOT NULL,
	"strike_count" integer DEFAULT 0 NOT NULL,
	"selling_limit" bigint,
	"status" "user_status" DEFAULT 'active'::"user_status" NOT NULL,
	"ban_type" "ban_type",
	"ban_reason" text,
	"suspended_until" timestamp(6) with time zone,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'buyer'::"user_role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp(6) with time zone NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL UNIQUE,
	"paystack_customer_code" text,
	"paystack_dedicated_account_id" bigint,
	"dva_account_name" text,
	"dva_account_number" text,
	"dva_bank_name" text,
	"bank_account_number" text,
	"bank_account_name" text,
	"bank_code" text,
	"bank_account_verified" boolean DEFAULT false NOT NULL,
	"status" "wallet_status" DEFAULT 'pending'::"wallet_status" NOT NULL,
	"customer_identification_status" "paystack_customer_identification_status" DEFAULT 'not_started'::"paystack_customer_identification_status" NOT NULL,
	"dva_assignment_status" "dva_assignment_status" DEFAULT 'not_started'::"dva_assignment_status" NOT NULL,
	"assignment_requested_at" timestamp(6) with time zone,
	"assigned_at" timestamp(6) with time zone,
	"failure_reason" text,
	"available_balance" bigint DEFAULT 0 NOT NULL,
	"locked_balance" bigint DEFAULT 0 NOT NULL,
	"escrow_balance" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_available_balance_check" CHECK ("available_balance" >= 0),
	CONSTRAINT "wallets_locked_balance_check" CHECK ("locked_balance" >= 0),
	CONSTRAINT "wallets_escrow_balance_check" CHECK ("escrow_balance" >= 0)
);
--> statement-breakpoint
CREATE INDEX "bid_retractions_bidder_id_idx" ON "bid_retractions" ("bidder_id");--> statement-breakpoint
CREATE INDEX "bids_listing_id_idx" ON "bids" ("listing_id");--> statement-breakpoint
CREATE INDEX "bids_bidder_id_idx" ON "bids" ("bidder_id");--> statement-breakpoint
CREATE INDEX "disputes_transaction_id_idx" ON "disputes" ("transaction_id");--> statement-breakpoint
CREATE INDEX "disputes_status_idx" ON "disputes" ("status");--> statement-breakpoint
CREATE INDEX "journals_type_idx" ON "journals" ("type");--> statement-breakpoint
CREATE INDEX "journals_triggered_by_user_id_idx" ON "journals" ("triggered_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "journals_paystack_reference_unique" ON "journals" ("paystack_reference") WHERE "paystack_reference" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_accounts_system_code_unique" ON "ledger_accounts" ("code") WHERE "scope" = 'system';--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_accounts_wallet_code_unique" ON "ledger_accounts" ("wallet_id","code") WHERE "scope" = 'wallet';--> statement-breakpoint
CREATE INDEX "ledger_accounts_wallet_id_idx" ON "ledger_accounts" ("wallet_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_journal_id_idx" ON "ledger_entries" ("journal_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_account_id_idx" ON "ledger_entries" ("account_id");--> statement-breakpoint
CREATE INDEX "listing_bid_state_current_highest_bid_id_idx" ON "listing_bid_state" ("current_highest_bid_id") WHERE "current_highest_bid_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "listing_images_listing_id_idx" ON "listing_images" ("listing_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_images_listing_order_unique" ON "listing_images" ("listing_id","order");--> statement-breakpoint
CREATE INDEX "listings_seller_id_idx" ON "listings" ("seller_id");--> statement-breakpoint
CREATE INDEX "listings_category_id_idx" ON "listings" ("category_id");--> statement-breakpoint
CREATE INDEX "listings_status_idx" ON "listings" ("status");--> statement-breakpoint
CREATE INDEX "listings_search_vector_idx" ON "listings" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "messages_transaction_id_idx" ON "messages" ("transaction_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_unread_idx" ON "notifications" ("user_id","created_at") WHERE "read_at" IS NULL;--> statement-breakpoint
CREATE INDEX "paystack_transfers_wallet_id_idx" ON "paystack_transfers" ("wallet_id");--> statement-breakpoint
CREATE INDEX "paystack_transfers_status_idx" ON "paystack_transfers" ("status");--> statement-breakpoint
CREATE INDEX "paystack_webhook_events_event_idx" ON "paystack_webhook_events" ("event");--> statement-breakpoint
CREATE INDEX "paystack_webhook_events_paystack_customer_code_idx" ON "paystack_webhook_events" ("paystack_customer_code");--> statement-breakpoint
CREATE INDEX "paystack_webhook_events_dva_account_number_idx" ON "paystack_webhook_events" ("dva_account_number");--> statement-breakpoint
CREATE UNIQUE INDEX "paystack_webhook_events_paystack_reference_unique" ON "paystack_webhook_events" ("paystack_reference") WHERE "paystack_reference" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "paystack_webhook_events_event_paystack_reference_unique" ON "paystack_webhook_events" ("event","paystack_reference") WHERE "paystack_reference" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "reports_reporter_id_idx" ON "reports" ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" ("status");--> statement-breakpoint
CREATE INDEX "reports_reported_message_id_idx" ON "reports" ("reported_message_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "strikes_user_id_idx" ON "strikes" ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_buyer_id_idx" ON "transactions" ("buyer_id");--> statement-breakpoint
CREATE INDEX "transactions_seller_id_idx" ON "transactions" ("seller_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" ("status");--> statement-breakpoint
CREATE INDEX "two_factors_user_id_idx" ON "two_factors" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_paystack_customer_code_unique" ON "wallets" ("paystack_customer_code") WHERE "paystack_customer_code" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_dva_account_number_unique" ON "wallets" ("dva_account_number") WHERE "dva_account_number" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_paystack_dedicated_account_id_unique" ON "wallets" ("paystack_dedicated_account_id") WHERE "paystack_dedicated_account_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bid_retractions" ADD CONSTRAINT "bid_retractions_bid_fkey" FOREIGN KEY ("bid_id","listing_id","bidder_id") REFERENCES "bids"("id","listing_id","bidder_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_listing_id_listings_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_users_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_id_users_id_fkey" FOREIGN KEY ("raised_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_id_users_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "journals" ADD CONSTRAINT "journals_triggered_by_user_id_users_id_fkey" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_wallet_id_wallets_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_template_fkey" FOREIGN KEY ("code","scope") REFERENCES "ledger_account_templates"("code","scope") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_journal_id_journals_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_ledger_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "listing_bid_state" ADD CONSTRAINT "listing_bid_state_listing_id_listings_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "listing_bid_state" ADD CONSTRAINT "listing_bid_state_current_highest_bid_fkey" FOREIGN KEY ("listing_id","current_highest_bid_id") REFERENCES "bids"("listing_id","id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id");--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_reviewed_by_id_users_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "paystack_transfers" ADD CONSTRAINT "paystack_transfers_wallet_id_wallets_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "paystack_transfers" ADD CONSTRAINT "paystack_transfers_journal_id_journals_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_reviewer_id_users_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_seller_id_users_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_transaction_id_transactions_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_users_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_listing_id_listings_id_fkey" FOREIGN KEY ("reported_listing_id") REFERENCES "listings"("id");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_message_id_messages_id_fkey" FOREIGN KEY ("reported_message_id") REFERENCES "messages"("id");--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_id_users_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_impersonated_by_users_id_fkey" FOREIGN KEY ("impersonated_by") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "strikes" ADD CONSTRAINT "strikes_issued_by_id_users_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_id_listings_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_users_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_users_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_winning_bid_id_bids_id_fkey" FOREIGN KEY ("winning_bid_id") REFERENCES "bids"("id");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_seller_fkey" FOREIGN KEY ("listing_id","seller_id") REFERENCES "listings"("id","seller_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_winning_bid_listing_buyer_fkey" FOREIGN KEY ("winning_bid_id","listing_id","buyer_id") REFERENCES "bids"("id","listing_id","bidder_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_winning_bid_amount_fkey" FOREIGN KEY ("winning_bid_id","winning_bid_amount") REFERENCES "bids"("id","amount") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION reject_ledger_entry_update_or_delete()
RETURNS TRIGGER
AS $$
BEGIN
    RAISE EXCEPTION 'ledger entries are immutable'
        USING ERRCODE = '23514',
        CONSTRAINT = 'ledger_entries_are_append_only',
        TABLE = 'ledger_entries';
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION reject_bid_update_or_delete()
RETURNS TRIGGER
AS $$
BEGIN
    RAISE EXCEPTION 'bids are immutable'
        USING ERRCODE = '23514',
        CONSTRAINT = 'bids_are_append_only',
        TABLE = 'bids';
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION assert_ledger_journal_debits_equal_credits()
RETURNS TRIGGER
AS $$
DECLARE
    total_debits bigint;
    total_credits bigint;
BEGIN
    SELECT
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO
        total_debits,
        total_credits
    FROM
        ledger_entries
    WHERE
        journal_id = NEW.journal_id;
    IF total_debits <> total_credits THEN
        RAISE EXCEPTION 'ledger journal is unbalanced'
            USING ERRCODE = '23514',
            CONSTRAINT = 'ledger_entries_journal_debits_must_equal_credits',
            TABLE = 'ledger_entries';
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION assert_active_listing_has_required_image_count()
RETURNS TRIGGER
AS $$
DECLARE
    image_count integer;
BEGIN
    IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
        SELECT
            COUNT(*)
        INTO
            image_count
        FROM
            listing_images
        WHERE
            listing_id = NEW.id;
        IF image_count < 4 OR image_count > 20 THEN
            RAISE EXCEPTION 'active listing image count is invalid'
                USING ERRCODE = '23514',
                CONSTRAINT = 'listings_active_status_requires_4_to_20_images',
                TABLE = 'listings';
        END IF;
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION assert_bidder_is_not_listing_seller()
RETURNS TRIGGER
AS $$
DECLARE
    listing_seller_id uuid;
BEGIN
    SELECT
        seller_id
    INTO
        listing_seller_id
    FROM
        listings
    WHERE
        id = NEW.listing_id;
    IF NEW.bidder_id = listing_seller_id THEN
        RAISE EXCEPTION 'bidder cannot be listing seller'
            USING ERRCODE = '23514',
            CONSTRAINT = 'bids_bidder_must_not_be_listing_seller',
            TABLE = 'bids';
    END IF;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "prevent_ledger_entry_updates"
    BEFORE UPDATE ON "ledger_entries"
    FOR EACH ROW
    EXECUTE FUNCTION reject_ledger_entry_update_or_delete();
--> statement-breakpoint
CREATE TRIGGER "prevent_ledger_entry_deletes"
    BEFORE DELETE ON "ledger_entries"
    FOR EACH ROW
    EXECUTE FUNCTION reject_ledger_entry_update_or_delete();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER "enforce_journal_balance"
    AFTER INSERT ON "ledger_entries" DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION assert_ledger_journal_debits_equal_credits();
--> statement-breakpoint
CREATE TRIGGER "enforce_active_listing_image_count"
    BEFORE INSERT OR UPDATE OF "status" ON "listings"
    FOR EACH ROW
    EXECUTE FUNCTION assert_active_listing_has_required_image_count();
--> statement-breakpoint
CREATE TRIGGER "enforce_bidder_is_not_listing_seller"
    BEFORE INSERT ON "bids"
    FOR EACH ROW
    EXECUTE FUNCTION assert_bidder_is_not_listing_seller();
--> statement-breakpoint
CREATE TRIGGER "prevent_bid_updates"
    BEFORE UPDATE ON "bids"
    FOR EACH ROW
    EXECUTE FUNCTION reject_bid_update_or_delete();
--> statement-breakpoint
CREATE TRIGGER "prevent_bid_deletes"
    BEFORE DELETE ON "bids"
    FOR EACH ROW
    EXECUTE FUNCTION reject_bid_update_or_delete();
