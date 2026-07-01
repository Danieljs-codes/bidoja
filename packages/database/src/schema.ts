import { sql } from "drizzle-orm";
import * as d from "drizzle-orm/pg-core";
import {
  banType,
  dvaAssignmentStatus,
  disputeOutcome,
  disputeReason,
  disputeStatus,
  journalType,
  ledgerAccountCode,
  ledgerAccountScope,
  ledgerAccountType,
  listingCondition,
  listingStatus,
  notificationType,
  paystackCustomerIdentificationStatus,
  paystackTransferStatus,
  paystackTransferType,
  retractionReason,
  reportStatus,
  reportType,
  transactionStatus,
  userRole,
  userStatus,
  walletStatus,
} from "#/enums";
import type { Brand } from "effect/Brand";

const tsvector = d.customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const timestamptz = (name: string) => d.timestamp(name, { precision: 6, withTimezone: true });

// ── Users ──────────────────────────────────────────────────────────────────\

type UserId = string & Brand<"UserId">;
type TwoFactorId = string & Brand<"TwoFactorId">;
type SessionId = string & Brand<"SessionId">;
type AccountId = string & Brand<"AccountId">;
type VerificationId = string & Brand<"VerificationId">;
type WalletId = string & Brand<"WalletId">;
type LedgerAccountId = string & Brand<"LedgerAccountId">;
type JournalId = string & Brand<"JournalId">;
type LedgerEntryId = string & Brand<"LedgerEntryId">;
type PaystackWebhookEventId = string & Brand<"PaystackWebhookEventId">;
type CategoryId = string & Brand<"CategoryId">;
type ListingId = string & Brand<"ListingId">;
type ListingImageId = string & Brand<"ListingImageId">;
type BidId = string & Brand<"BidId">;
type TransactionId = string & Brand<"TransactionId">;
type PaystackTransferId = string & Brand<"PaystackTransferId">;
type ReceiptId = string & Brand<"ReceiptId">;
type DisputeId = string & Brand<"DisputeId">;
type MessageId = string & Brand<"MessageId">;
type RatingId = string & Brand<"RatingId">;
type ReportId = string & Brand<"ReportId">;
type StrikeId = string & Brand<"StrikeId">;
type NotificationId = string & Brand<"NotificationId">;

// UserId and other branded IDs are not assignable to each other even though all wrap `string`

export const users = d.snakeCase.table(
  "users",
  {
    id: d
      .uuid()
      .$type<UserId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    name: d.text().notNull(),
    image: d.text(),
    email: d.text().notNull().unique(),
    phone: d.text().notNull().unique(),
    emailVerified: d.boolean().default(false).notNull(),
    isPhoneVerified: d.boolean().default(false).notNull(),
    isIdentityVerified: d.boolean().default(false).notNull(),
    strikeCount: d.integer().default(0).notNull(),
    sellingLimit: d.bigint({ mode: "bigint" }),
    status: userStatus().default("active").notNull(),
    banType: banType(),
    banReason: d.text(),
    suspendedUntil: timestamptz("suspended_until"),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
    twoFactorEnabled: d.boolean("two_factor_enabled").default(false).notNull(),

    role: userRole().default("buyer").notNull(),
  },
  () => [],
);

// ── Two-Factor Auth ─────────────────────────────────────────────────────────

export const twoFactors = d.snakeCase.table(
  "two_factors",
  {
    id: d
      .uuid()
      .$type<TwoFactorId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    secret: d.text().notNull(),
    backupCodes: d.text("backup_codes").notNull(),
    userId: d
      .uuid("user_id")
      .$type<UserId>()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verified: d.boolean().default(true).notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [d.index("two_factors_user_id_idx").on(t.userId)],
);

// ── Sessions ───────────────────────────────────────────────────────────────

export const sessions = d.snakeCase.table(
  "sessions",
  {
    id: d
      .uuid()
      .$type<SessionId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    expiresAt: timestamptz("expires_at").notNull(),
    token: d.text().notNull().unique(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
    ipAddress: d.text(),
    userAgent: d.text(),
    userId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
  },
  (t) => [d.index("sessions_user_id_idx").on(t.userId)],
);

// ── Accounts ───────────────────────────────────────────────────────────────

export const accounts = d.snakeCase.table(
  "accounts",
  {
    id: d
      .uuid()
      .$type<AccountId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    accountId: d.text().notNull(),
    providerId: d.text().notNull(),
    userId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: d.text(),
    refreshToken: d.text(),
    idToken: d.text(),
    accessTokenExpiresAt: timestamptz("access_token_expires_at"),
    refreshTokenExpiresAt: timestamptz("refresh_token_expires_at"),
    scope: d.text(),
    password: d.text(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  () => [],
);

// ── Verifications ──────────────────────────────────────────────────────────

export const verifications = d.snakeCase.table(
  "verifications",
  {
    id: d
      .uuid()
      .$type<VerificationId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    identifier: d.text().notNull(),
    value: d.text().notNull(),
    expiresAt: timestamptz("expires_at").notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [d.index("verifications_identifier_idx").on(t.identifier)],
);

// ── Wallets ────────────────────────────────────────────────────────────────

export const wallets = d.snakeCase.table(
  "wallets",
  {
    id: d
      .uuid()
      .$type<WalletId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    userId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    paystackCustomerCode: d.text(),
    paystackDedicatedAccountId: d.bigint({
      mode: "bigint",
    }),
    dvaAccountName: d.text(),
    dvaAccountNumber: d.text(),
    dvaBankName: d.text(),
    bankAccountNumber: d.text(),
    bankAccountName: d.text(),
    bankCode: d.text(),
    bankAccountVerified: d.boolean().default(false).notNull(),
    status: walletStatus("status").default("pending").notNull(),
    customerIdentificationStatus: paystackCustomerIdentificationStatus(
      "customer_identification_status",
    )
      .default("not_started")
      .notNull(),
    dvaAssignmentStatus: dvaAssignmentStatus("dva_assignment_status")
      .default("not_started")
      .notNull(),
    assignmentRequestedAt: timestamptz("assignment_requested_at"),
    assignedAt: timestamptz("assigned_at"),
    failureReason: d.text(),
    availableBalance: d.bigint({ mode: "bigint" }).default(0n).notNull(),
    lockedBalance: d.bigint({ mode: "bigint" }).default(0n).notNull(),
    escrowBalance: d.bigint({ mode: "bigint" }).default(0n).notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d
      .uniqueIndex("wallets_paystack_customer_code_unique")
      .on(t.paystackCustomerCode)
      .where(sql`${t.paystackCustomerCode} IS NOT NULL`),
    d
      .uniqueIndex("wallets_dva_account_number_unique")
      .on(t.dvaAccountNumber)
      .where(sql`${t.dvaAccountNumber} IS NOT NULL`),
    d
      .uniqueIndex("wallets_paystack_dedicated_account_id_unique")
      .on(t.paystackDedicatedAccountId)
      .where(sql`${t.paystackDedicatedAccountId} IS NOT NULL`),
    d.check("wallets_available_balance_check", sql`${t.availableBalance} >= 0`),
    d.check("wallets_locked_balance_check", sql`${t.lockedBalance} >= 0`),
    d.check("wallets_escrow_balance_check", sql`${t.escrowBalance} >= 0`),
  ],
);

// ── Ledger Account Templates ───────────────────────────────────────────────

export const ledgerAccountTemplates = d.snakeCase.table(
  "ledger_account_templates",
  {
    code: ledgerAccountCode("code").primaryKey(),
    name: d.text("name").notNull().unique(),
    type: ledgerAccountType("type").notNull(),
    scope: ledgerAccountScope("scope").notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.unique("ledger_account_templates_code_scope_unique").on(t.code, t.scope),
    d.check(
      "ledger_account_templates_code_definition_check",
      sql`(${t.code} = 'cash' AND ${t.name} = 'Cash' AND ${t.type} = 'asset' AND ${t.scope} = 'system') OR (${t.code} = 'platform_revenue' AND ${t.name} = 'Platform Revenue' AND ${t.type} = 'revenue' AND ${t.scope} = 'system') OR (${t.code} = 'payment_processing_expense' AND ${t.name} = 'Payment Processing Expense' AND ${t.type} = 'expense' AND ${t.scope} = 'system') OR (${t.code} = 'user_available' AND ${t.name} = 'User Available' AND ${t.type} = 'liability' AND ${t.scope} = 'wallet') OR (${t.code} = 'user_locked' AND ${t.name} = 'User Locked' AND ${t.type} = 'liability' AND ${t.scope} = 'wallet') OR (${t.code} = 'escrow' AND ${t.name} = 'Escrow' AND ${t.type} = 'liability' AND ${t.scope} = 'wallet') OR (${t.code} = 'seller_payable' AND ${t.name} = 'Seller Payable' AND ${t.type} = 'liability' AND ${t.scope} = 'wallet')`,
    ),
  ],
);

// ── Ledger Accounts ────────────────────────────────────────────────────────

export const ledgerAccounts = d.snakeCase.table(
  "ledger_accounts",
  {
    id: d
      .uuid()
      .$type<LedgerAccountId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    code: ledgerAccountCode("code").notNull(),
    scope: ledgerAccountScope("scope").notNull(),
    walletId: d
      .uuid()
      .$type<WalletId>()
      .references(() => wallets.id, {
        onDelete: "restrict",
      }),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d
      .foreignKey({
        columns: [t.code, t.scope],
        foreignColumns: [ledgerAccountTemplates.code, ledgerAccountTemplates.scope],
        name: "ledger_accounts_template_fkey",
      })
      .onDelete("restrict"),
    d
      .uniqueIndex("ledger_accounts_system_code_unique")
      .on(t.code)
      .where(sql`${t.scope} = 'system'`),
    d
      .uniqueIndex("ledger_accounts_wallet_code_unique")
      .on(t.walletId, t.code)
      .where(sql`${t.scope} = 'wallet'`),
    d.index("ledger_accounts_wallet_id_idx").on(t.walletId),
    d.check(
      "ledger_accounts_scope_wallet_check",
      sql`(${t.scope} = 'system' AND ${t.walletId} IS NULL) OR (${t.scope} = 'wallet' AND ${t.walletId} IS NOT NULL)`,
    ),
  ],
);

// ── Journals ───────────────────────────────────────────────────────────────

export const journals = d.snakeCase.table(
  "journals",
  {
    id: d
      .uuid("id")
      .$type<JournalId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    type: journalType("type").notNull(),
    description: d.text().notNull(),
    reference: d.text().notNull().unique(),
    triggeredByUserId: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
    paystackReference: d.text(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [
    d.index("journals_type_idx").on(t.type),
    d.index("journals_triggered_by_user_id_idx").on(t.triggeredByUserId),
    d
      .uniqueIndex("journals_paystack_reference_unique")
      .on(t.paystackReference)
      .where(sql`${t.paystackReference} IS NOT NULL`),
  ],
);

// ── Ledger Entries ─────────────────────────────────────────────────────────

export const ledgerEntries = d.snakeCase.table(
  "ledger_entries",
  {
    id: d
      .uuid()
      .$type<LedgerEntryId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    journalId: d
      .uuid()
      .$type<JournalId>()
      .notNull()
      .references(() => journals.id, { onDelete: "restrict" }),
    accountId: d
      .uuid()
      .$type<LedgerAccountId>()
      .notNull()
      .references(() => ledgerAccounts.id, { onDelete: "restrict" }),
    debit: d.bigint({ mode: "bigint" }),
    credit: d.bigint({ mode: "bigint" }),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [
    d.index("ledger_entries_journal_id_idx").on(t.journalId),
    d.index("ledger_entries_account_id_idx").on(t.accountId),
    d.check(
      "ledger_entries_single_side_check",
      sql`(${t.debit} IS NOT NULL AND ${t.debit} > 0 AND ${t.credit} IS NULL) OR (${t.credit} IS NOT NULL AND ${t.credit} > 0 AND ${t.debit} IS NULL)`,
    ),
  ],
);

// ── Paystack Webhook Events ────────────────────────────────────────────────

export const paystackWebhookEvents = d.snakeCase.table(
  "paystack_webhook_events",
  {
    id: d
      .uuid()
      .$type<PaystackWebhookEventId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    event: d.text().notNull(),
    paystackReference: d.text(),
    paystackCustomerCode: d.text(),
    dvaAccountNumber: d.text(),
    payload: d.jsonb().notNull(),
    processedAt: timestamptz("processed_at"),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [
    d.index("paystack_webhook_events_event_idx").on(t.event),
    d.index("paystack_webhook_events_paystack_customer_code_idx").on(t.paystackCustomerCode),
    d.index("paystack_webhook_events_dva_account_number_idx").on(t.dvaAccountNumber),
    d
      .uniqueIndex("paystack_webhook_events_paystack_reference_unique")
      .on(t.paystackReference)
      .where(sql`${t.paystackReference} IS NOT NULL`),
    d
      .uniqueIndex("paystack_webhook_events_event_paystack_reference_unique")
      .on(t.event, t.paystackReference)
      .where(sql`${t.paystackReference} IS NOT NULL`),
  ],
);

// ── Categories ─────────────────────────────────────────────────────────────

export const categories = d.snakeCase.table(
  "categories",
  {
    id: d
      .uuid()
      .$type<CategoryId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    name: d.text().notNull().unique(),
    slug: d.text().notNull().unique(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  () => [],
);

// ── Listings ───────────────────────────────────────────────────────────────

export const listings = d.snakeCase.table(
  "listings",
  {
    id: d
      .uuid()
      .$type<ListingId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    sellerId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    title: d.text().notNull(),
    description: d.text().notNull(),
    condition: listingCondition("condition").notNull(),
    categoryId: d
      .uuid()
      .$type<CategoryId>()
      .notNull()
      .references(() => categories.id),
    startingBid: d.bigint({ mode: "bigint" }).notNull(),
    buyNowPrice: d.bigint({ mode: "bigint" }),
    searchVector: tsvector("search_vector")
      .notNull()
      .generatedAlwaysAs(
        sql`setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', description), 'B')`,
      ),
    status: listingStatus("status").default("draft").notNull(),
    auctionStart: timestamptz("auction_start").notNull(),
    auctionEnd: timestamptz("auction_end").notNull(),
    extensionCount: d.integer().default(0).notNull(),
    isReplica: d.boolean().default(false).notNull(),
    sellerDepositHeld: d.boolean().default(false).notNull(),
    reviewedById: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
    reviewedAt: timestamptz("reviewed_at"),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("listings_seller_id_idx").on(t.sellerId),
    d.index("listings_category_id_idx").on(t.categoryId),
    d.index("listings_status_idx").on(t.status),
    d.index("listings_search_vector_idx").using("gin", t.searchVector),
    d.unique("listings_id_seller_unique").on(t.id, t.sellerId),
    d.check("listings_auction_time_check", sql`${t.auctionEnd} > ${t.auctionStart}`),
    d.check(
      "listings_auction_duration_check",
      sql`${t.auctionEnd} >= ${t.auctionStart} + interval '5 minutes' AND ${t.auctionEnd} <= ${t.auctionStart} + interval '7 days'`,
    ),
    d.check("listings_starting_bid_check", sql`${t.startingBid} > 0`),
    d.check(
      "listings_buy_now_price_check",
      sql`${t.buyNowPrice} IS NULL OR ${t.buyNowPrice} >= ${t.startingBid}`,
    ),
    d.check("listings_extension_count_check", sql`${t.extensionCount} >= 0`),
  ],
);

// ── Listing Images ─────────────────────────────────────────────────────────

export const listingImages = d.snakeCase.table(
  "listing_images",
  {
    id: d
      .uuid()
      .$type<ListingImageId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    listingId: d
      .uuid()
      .$type<ListingId>()
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    url: d.text().notNull(),
    order: d.integer().notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("listing_images_listing_id_idx").on(t.listingId),
    d.uniqueIndex("listing_images_listing_order_unique").on(t.listingId, t.order),
    d.check("listing_images_order_check", sql`${t.order} BETWEEN 1 AND 20`),
  ],
);

// ── Bids ───────────────────────────────────────────────────────────────────

export const bids = d.snakeCase.table(
  "bids",
  {
    id: d
      .uuid()
      .$type<BidId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    listingId: d
      .uuid()
      .$type<ListingId>()
      .notNull()
      .references(() => listings.id, { onDelete: "restrict" }),
    bidderId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    amount: d.bigint({ mode: "bigint" }).notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [
    d.index("bids_listing_id_idx").on(t.listingId),
    d.index("bids_bidder_id_idx").on(t.bidderId),
    d.unique("bids_id_listing_bidder_unique").on(t.id, t.listingId, t.bidderId),
    d.unique("bids_id_amount_unique").on(t.id, t.amount),
    d.unique("bids_listing_id_id_unique").on(t.listingId, t.id),
    d.check("bids_amount_check", sql`${t.amount} > 0`),
  ],
);

// ── Listing Bid State ──────────────────────────────────────────────────────

export const listingBidState = d.snakeCase.table(
  "listing_bid_state",
  {
    listingId: d
      .uuid()
      .$type<ListingId>()
      .primaryKey()
      .references(() => listings.id, { onDelete: "cascade" }),
    currentHighestBidId: d.uuid().$type<BidId>(),
    bidCount: d.integer().default(0).notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d
      .index("listing_bid_state_current_highest_bid_id_idx")
      .on(t.currentHighestBidId)
      .where(sql`${t.currentHighestBidId} IS NOT NULL`),
    d
      .foreignKey({
        columns: [t.listingId, t.currentHighestBidId],
        foreignColumns: [bids.listingId, bids.id],
        name: "listing_bid_state_current_highest_bid_fkey",
      })
      .onDelete("restrict"),
    d.check("listing_bid_state_bid_count_check", sql`${t.bidCount} >= 0`),
    d.check(
      "listing_bid_state_current_bid_requires_bid_count_check",
      sql`${t.currentHighestBidId} IS NULL OR ${t.bidCount} > 0`,
    ),
  ],
);

// ── Bid Retractions ────────────────────────────────────────────────────────

export const bidRetractions = d.snakeCase.table(
  "bid_retractions",
  {
    bidId: d.uuid().$type<BidId>().primaryKey(),
    listingId: d.uuid().$type<ListingId>().notNull(),
    bidderId: d.uuid().$type<UserId>().notNull(),
    reason: retractionReason("reason").notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [
    d
      .foreignKey({
        columns: [t.bidId, t.listingId, t.bidderId],
        foreignColumns: [bids.id, bids.listingId, bids.bidderId],
        name: "bid_retractions_bid_fkey",
      })
      .onDelete("cascade"),
    d.unique("bid_retractions_one_per_listing_bidder_unique").on(t.listingId, t.bidderId),
    d.index("bid_retractions_bidder_id_idx").on(t.bidderId),
  ],
);

// ── Transactions ───────────────────────────────────────────────────────────

export const transactions = d.snakeCase.table(
  "transactions",
  {
    id: d
      .uuid()
      .$type<TransactionId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    listingId: d
      .uuid()
      .$type<ListingId>()
      .notNull()
      .unique()
      .references(() => listings.id),
    buyerId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    sellerId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    winningBidId: d
      .uuid()
      .$type<BidId>()
      .notNull()
      .unique()
      .references(() => bids.id),
    winningBidAmount: d.bigint({ mode: "bigint" }).notNull(),
    platformFee: d.bigint({ mode: "bigint" }).notNull(),
    sellerPayout: d.bigint({ mode: "bigint" }).notNull(),
    status: transactionStatus("status").default("pending").notNull(),
    shippedAt: timestamptz("shipped_at"),
    confirmedAt: timestamptz("confirmed_at"),
    disputeWindowClosesAt: timestamptz("dispute_window_closes_at"),
    payoutReleasedAt: timestamptz("payout_released_at"),
    refundReleasedAt: timestamptz("refund_released_at"),
    chatReadOnly: d.boolean().default(false).notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("transactions_buyer_id_idx").on(t.buyerId),
    d.index("transactions_seller_id_idx").on(t.sellerId),
    d.index("transactions_status_idx").on(t.status),
    d
      .foreignKey({
        columns: [t.listingId, t.sellerId],
        foreignColumns: [listings.id, listings.sellerId],
        name: "transactions_listing_seller_fkey",
      })
      .onDelete("restrict"),
    d
      .foreignKey({
        columns: [t.winningBidId, t.listingId, t.buyerId],
        foreignColumns: [bids.id, bids.listingId, bids.bidderId],
        name: "transactions_winning_bid_listing_buyer_fkey",
      })
      .onDelete("restrict"),
    d
      .foreignKey({
        columns: [t.winningBidId, t.winningBidAmount],
        foreignColumns: [bids.id, bids.amount],
        name: "transactions_winning_bid_amount_fkey",
      })
      .onDelete("restrict"),
    d.check("transactions_buyer_seller_distinct_check", sql`${t.buyerId} <> ${t.sellerId}`),
    d.check("transactions_winning_bid_amount_check", sql`${t.winningBidAmount} > 0`),
    d.check("transactions_platform_fee_check", sql`${t.platformFee} >= 0`),
    d.check("transactions_seller_payout_check", sql`${t.sellerPayout} >= 0`),
    d.check(
      "transactions_fee_split_check",
      sql`${t.platformFee} + ${t.sellerPayout} = ${t.winningBidAmount}`,
    ),
    d.check(
      "transactions_confirmed_requires_shipped_check",
      sql`${t.confirmedAt} IS NULL OR ${t.shippedAt} IS NOT NULL`,
    ),
    d.check(
      "transactions_confirmed_after_shipped_check",
      sql`${t.confirmedAt} IS NULL OR ${t.confirmedAt} >= ${t.shippedAt}`,
    ),
    d.check(
      "transactions_dispute_window_requires_shipped_check",
      sql`${t.disputeWindowClosesAt} IS NULL OR ${t.shippedAt} IS NOT NULL`,
    ),
    d.check(
      "transactions_dispute_window_after_shipped_check",
      sql`${t.disputeWindowClosesAt} IS NULL OR ${t.disputeWindowClosesAt} >= ${t.shippedAt}`,
    ),
    d.check(
      "transactions_released_requires_payout_check",
      sql`${t.status} <> 'released' OR ${t.payoutReleasedAt} IS NOT NULL`,
    ),
    d.check(
      "transactions_refunded_requires_refund_check",
      sql`${t.status} <> 'refunded' OR ${t.refundReleasedAt} IS NOT NULL`,
    ),
    d.check(
      "transactions_disputed_not_finalized_check",
      sql`${t.status} <> 'disputed' OR (${t.payoutReleasedAt} IS NULL AND ${t.refundReleasedAt} IS NULL)`,
    ),
  ],
);

// ── Paystack Transfers ─────────────────────────────────────────────────────

export const paystackTransfers = d.snakeCase.table(
  "paystack_transfers",
  {
    id: d
      .uuid()
      .$type<PaystackTransferId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    walletId: d
      .uuid()
      .$type<WalletId>()
      .notNull()
      .references(() => wallets.id, { onDelete: "restrict" }),
    journalId: d
      .uuid()
      .$type<JournalId>()
      .unique()
      .references(() => journals.id, { onDelete: "restrict" }),
    type: paystackTransferType("type").notNull(),
    status: paystackTransferStatus("status").default("pending").notNull(),
    amount: d.bigint({ mode: "bigint" }).notNull(),
    paystackReference: d.text().unique(),
    paystackTransferCode: d.text().unique(),
    failureReason: d.text(),
    requestedAt: timestamptz("requested_at")
      .default(sql`now()`)
      .notNull(),
    completedAt: timestamptz("completed_at"),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("paystack_transfers_wallet_id_idx").on(t.walletId),
    d.index("paystack_transfers_status_idx").on(t.status),
    d.check("paystack_transfers_amount_check", sql`${t.amount} > 0`),
    d.check(
      "paystack_transfers_min_withdrawal_check",
      sql`${t.type} <> 'withdrawal' OR ${t.amount} >= 1000`,
    ),
  ],
);

// ── Receipts ───────────────────────────────────────────────────────────────

export const receipts = d.snakeCase.table(
  "receipts",
  {
    id: d
      .uuid()
      .$type<ReceiptId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    transactionId: d
      .uuid()
      .$type<TransactionId>()
      .notNull()
      .unique()
      .references(() => transactions.id, { onDelete: "cascade" }),
    url: d.text().notNull(),
    generatedAt: timestamptz("generated_at")
      .default(sql`now()`)
      .notNull(),
    emailedAt: timestamptz("emailed_at"),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  () => [],
);

// ── Disputes ───────────────────────────────────────────────────────────────

export const disputes = d.snakeCase.table(
  "disputes",
  {
    id: d
      .uuid()
      .$type<DisputeId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    transactionId: d
      .uuid()
      .$type<TransactionId>()
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    raisedById: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    reason: disputeReason("reason").notNull(),
    description: d.text().notNull(),
    evidenceUrls: d.jsonb().notNull().default([]).$type<string[]>(),
    status: disputeStatus("status").default("open").notNull(),
    outcome: disputeOutcome("outcome"),
    resolvedById: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    resolvedAt: timestamptz("resolved_at"),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("disputes_transaction_id_idx").on(t.transactionId),
    d.index("disputes_status_idx").on(t.status),
  ],
);

// ── Messages ───────────────────────────────────────────────────────────────

export const messages = d.snakeCase.table(
  "messages",
  {
    id: d
      .uuid()
      .$type<MessageId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    transactionId: d
      .uuid()
      .$type<TransactionId>()
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    senderId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    receiverId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    body: d.text().notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [d.index("messages_transaction_id_idx").on(t.transactionId)],
);

// ── Ratings ────────────────────────────────────────────────────────────────

export const ratings = d.snakeCase.table(
  "ratings",
  {
    id: d
      .uuid()
      .$type<RatingId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    transactionId: d
      .uuid()
      .$type<TransactionId>()
      .notNull()
      .unique()
      .references(() => transactions.id, { onDelete: "cascade" }),
    reviewerId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    sellerId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    score: d.integer().notNull(),
    comment: d.text(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [d.check("ratings_score_check", sql`${t.score} BETWEEN 1 AND 5`)],
);

// ── Reports ────────────────────────────────────────────────────────────────

export const reports = d.snakeCase.table(
  "reports",
  {
    id: d
      .uuid()
      .$type<ReportId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    reporterId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    reportedUserId: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
    reportedListingId: d
      .uuid()
      .$type<ListingId>()
      .references(() => listings.id),
    reportedMessageId: d
      .uuid()
      .$type<MessageId>()
      .references(() => messages.id),
    type: reportType("type").notNull(),
    reason: d.text().notNull(),
    status: reportStatus("status").default("pending").notNull(),
    reviewedById: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("reports_reporter_id_idx").on(t.reporterId),
    d.index("reports_status_idx").on(t.status),
    d.index("reports_reported_message_id_idx").on(t.reportedMessageId),
    d.check(
      "reports_type_target_check",
      sql`(${t.type} = 'user' AND ${t.reportedUserId} IS NOT NULL AND ${t.reportedListingId} IS NULL AND ${t.reportedMessageId} IS NULL) OR (${t.type} = 'listing' AND ${t.reportedListingId} IS NOT NULL AND ${t.reportedUserId} IS NULL AND ${t.reportedMessageId} IS NULL) OR (${t.type} = 'message' AND ${t.reportedMessageId} IS NOT NULL AND ${t.reportedUserId} IS NULL AND ${t.reportedListingId} IS NULL)`,
    ),
  ],
);

// ── Strikes ────────────────────────────────────────────────────────────────

export const strikes = d.snakeCase.table(
  "strikes",
  {
    id: d
      .uuid()
      .$type<StrikeId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    userId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id),
    reason: d.text().notNull(),
    issuedById: d
      .uuid()
      .$type<UserId>()
      .references(() => users.id),
    issuedBySystem: d.boolean().default(false).notNull(),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [
    d.index("strikes_user_id_idx").on(t.userId),
    d.check(
      "strikes_issuer_check",
      sql`(${t.issuedById} IS NOT NULL AND ${t.issuedBySystem} = FALSE) OR (${t.issuedById} IS NULL AND ${t.issuedBySystem} = TRUE)`,
    ),
  ],
);

// ── Notifications ──────────────────────────────────────────────────────────

export const notifications = d.snakeCase.table(
  "notifications",
  {
    id: d
      .uuid()
      .$type<NotificationId>()
      .default(sql`uuidv7()`)
      .primaryKey(),
    userId: d
      .uuid()
      .$type<UserId>()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull(),
    title: d.text().notNull(),
    body: d.text().notNull(),
    data: d.jsonb().notNull().default({}).$type<Record<string, unknown>>(),
    sendPush: d.boolean().default(false).notNull(),
    sendEmail: d.boolean().default(false).notNull(),
    sendInApp: d.boolean().default(true).notNull(),
    readAt: timestamptz("read_at"),
    createdAt: timestamptz("created_at")
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamptz("updated_at")
      .default(sql`now()`)
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (t) => [
    d.index("notifications_user_id_idx").on(t.userId),
    d.index("notifications_type_idx").on(t.type),
    d
      .uniqueIndex("notifications_unread_idx")
      .on(t.userId, t.createdAt)
      .where(sql`${t.readAt} IS NULL`),
  ],
);
