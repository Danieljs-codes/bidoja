import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["buyer", "seller", "admin"]);

export const userStatus = pgEnum("user_status", ["active", "flagged", "suspended", "banned"]);

export const banType = pgEnum("ban_type", ["temporary", "permanent"]);

export const listingCondition = pgEnum("listing_condition", [
  "new",
  "like_new",
  "good",
  "fair",
  "poor",
]);

export const listingStatus = pgEnum("listing_status", [
  "draft",
  "pending_review",
  "active",
  "closed",
  "cancelled",
  "sold",
]);

export const walletStatus = pgEnum("wallet_status", ["pending", "active", "failed", "deactivated"]);

export const paystackCustomerIdentificationStatus = pgEnum(
  "paystack_customer_identification_status",
  ["not_started", "pending", "verified", "failed"],
);

export const dvaAssignmentStatus = pgEnum("dva_assignment_status", [
  "not_started",
  "pending",
  "assigned",
  "failed",
]);

export const ledgerAccountType = pgEnum("ledger_account_type", [
  "asset",
  "liability",
  "revenue",
  "expense",
]);

export const ledgerAccountScope = pgEnum("ledger_account_scope", ["system", "wallet"]);

export const ledgerAccountCode = pgEnum("ledger_account_code", [
  "cash",
  "user_available",
  "user_locked",
  "escrow",
  "seller_payable",
  "platform_revenue",
  "payment_processing_expense",
]);

export const journalType = pgEnum("journal_type", [
  "deposit",
  "deposit_reversal",
  "bid_lock",
  "bid_unlock",
  "lock_to_escrow",
  "escrow_release",
  "refund",
  "withdrawal",
  "withdrawal_reversal",
  "seller_payout",
  "seller_payout_reversal",
  "platform_fee",
  "processing_fee",
  "correction",
]);

export const retractionReason = pgEnum("retraction_reason", ["wrong_amount", "listing_changed"]);

export const transactionStatus = pgEnum("transaction_status", [
  "pending",
  "held",
  "released",
  "refunded",
  "disputed",
]);

export const paystackTransferType = pgEnum("paystack_transfer_type", [
  "withdrawal",
  "seller_payout",
]);

export const paystackTransferStatus = pgEnum("paystack_transfer_status", [
  "pending",
  "success",
  "failed",
  "reversed",
]);

export const disputeReason = pgEnum("dispute_reason", [
  "never_arrived",
  "not_as_described",
  "arrived_damaged",
  "wrong_item_sent",
]);

export const disputeStatus = pgEnum("dispute_status", ["open", "resolved", "rejected"]);

export const disputeOutcome = pgEnum("dispute_outcome", [
  "full_refund",
  "partial_refund",
  "released_to_seller",
]);

export const reportType = pgEnum("report_type", ["listing", "user", "message"]);

export const reportStatus = pgEnum("report_status", ["pending", "reviewed", "dismissed"]);

export const notificationType = pgEnum("notification_type", [
  "outbid",
  "auction_ending_soon",
  "anti_snipe_extension",
  "auction_won",
  "auction_lost",
  "new_message",
  "seller_marked_shipped",
  "dispute_opened",
  "dispute_resolved",
  "payout_released",
  "wallet_funded",
  "strike_issued",
]);
