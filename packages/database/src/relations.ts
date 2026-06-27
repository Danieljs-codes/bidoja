import { defineRelations } from "drizzle-orm";
import * as schema from "#/schema";
export const relations = defineRelations(schema, (r) => ({
  users: {
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
    accounts: r.many.accounts({
      from: r.users.id,
      to: r.accounts.userId,
    }),
    wallets: r.many.wallets({
      from: r.users.id,
      to: r.wallets.userId,
    }),
    listings: r.many.listings({
      from: r.users.id,
      to: r.listings.sellerId,
    }),
    bids: r.many.bids({
      from: r.users.id,
      to: r.bids.bidderId,
    }),
    notifications: r.many.notifications({
      from: r.users.id,
      to: r.notifications.userId,
    }),
  },

  twoFactors: {
    user: r.one.users({
      from: r.twoFactors.userId,
      to: r.users.id,
    }),
  },

  sessions: {
    impersonator: r.one.users({
      from: r.sessions.impersonatedBy,
      optional: true,
      to: r.users.id,
    }),
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },

  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },

  wallets: {
    ledgerAccounts: r.many.ledgerAccounts(),
    paystackTransfers: r.many.paystackTransfers(),
    user: r.one.users({
      from: r.wallets.userId,
      to: r.users.id,
    }),
  },

  ledgerAccountTemplates: {},

  ledgerAccounts: {
    ledgerEntries: r.many.ledgerEntries(),
    template: r.one.ledgerAccountTemplates({
      from: [r.ledgerAccounts.code, r.ledgerAccounts.scope],
      to: [r.ledgerAccountTemplates.code, r.ledgerAccountTemplates.scope],
    }),
    wallet: r.one.wallets({
      from: r.ledgerAccounts.walletId,
      optional: true,
      to: r.wallets.id,
    }),
  },

  journals: {
    ledgerEntries: r.many.ledgerEntries(),
    paystackTransfers: r.many.paystackTransfers(),
    triggeredByUser: r.one.users({
      from: r.journals.triggeredByUserId,
      optional: true,
      to: r.users.id,
    }),
  },

  ledgerEntries: {
    account: r.one.ledgerAccounts({
      from: r.ledgerEntries.accountId,
      to: r.ledgerAccounts.id,
    }),
    journal: r.one.journals({
      from: r.ledgerEntries.journalId,
      to: r.journals.id,
    }),
  },

  categories: {
    listings: r.many.listings(),
  },

  listings: {
    bidState: r.one.listingBidState({ optional: true }),
    bids: r.many.bids(),
    category: r.one.categories({
      from: r.listings.categoryId,
      to: r.categories.id,
    }),
    images: r.many.listingImages(),
    reviewedBy: r.one.users({
      from: r.listings.reviewedById,
      optional: true,
      to: r.users.id,
    }),
    seller: r.one.users({
      from: r.listings.sellerId,
      to: r.users.id,
    }),
    transaction: r.one.transactions({ optional: true }),
  },

  listingImages: {
    listing: r.one.listings({
      from: r.listingImages.listingId,
      to: r.listings.id,
    }),
  },

  bids: {
    bidder: r.one.users({
      from: r.bids.bidderId,
      to: r.users.id,
    }),
    listing: r.one.listings({
      from: r.bids.listingId,
      to: r.listings.id,
    }),
  },

  listingBidState: {
    currentHighestBid: r.one.bids({
      from: [r.listingBidState.listingId, r.listingBidState.currentHighestBidId],
      optional: true,
      to: [r.bids.listingId, r.bids.id],
    }),
    listing: r.one.listings({
      from: r.listingBidState.listingId,
      to: r.listings.id,
    }),
  },

  bidRetractions: {
    bid: r.one.bids({
      from: [r.bidRetractions.bidId, r.bidRetractions.listingId, r.bidRetractions.bidderId],
      to: [r.bids.id, r.bids.listingId, r.bids.bidderId],
    }),
  },

  transactions: {
    buyer: r.one.users({
      from: r.transactions.buyerId,
      to: r.users.id,
    }),
    disputes: r.many.disputes(),
    listing: r.one.listings({
      from: r.transactions.listingId,
      to: r.listings.id,
    }),
    messages: r.many.messages(),
    rating: r.one.ratings({ optional: true }),
    receipt: r.one.receipts({ optional: true }),
    seller: r.one.users({
      from: r.transactions.sellerId,
      to: r.users.id,
    }),
    winningBid: r.one.bids({
      from: r.transactions.winningBidId,
      to: r.bids.id,
    }),
  },

  paystackTransfers: {
    journal: r.one.journals({
      from: r.paystackTransfers.journalId,
      optional: true,
      to: r.journals.id,
    }),
    wallet: r.one.wallets({
      from: r.paystackTransfers.walletId,
      to: r.wallets.id,
    }),
  },

  receipts: {
    transaction: r.one.transactions({
      from: r.receipts.transactionId,
      to: r.transactions.id,
    }),
  },

  disputes: {
    raisedBy: r.one.users({
      from: r.disputes.raisedById,
      to: r.users.id,
    }),
    resolvedBy: r.one.users({
      from: r.disputes.resolvedById,
      optional: true,
      to: r.users.id,
    }),
    transaction: r.one.transactions({
      from: r.disputes.transactionId,
      to: r.transactions.id,
    }),
  },

  messages: {
    receiver: r.one.users({
      from: r.messages.receiverId,
      to: r.users.id,
    }),
    sender: r.one.users({
      from: r.messages.senderId,
      to: r.users.id,
    }),
    transaction: r.one.transactions({
      from: r.messages.transactionId,
      to: r.transactions.id,
    }),
  },

  ratings: {
    reviewer: r.one.users({
      from: r.ratings.reviewerId,
      to: r.users.id,
    }),
    seller: r.one.users({
      from: r.ratings.sellerId,
      to: r.users.id,
    }),
    transaction: r.one.transactions({
      from: r.ratings.transactionId,
      to: r.transactions.id,
    }),
  },

  reports: {
    reportedListing: r.one.listings({
      from: r.reports.reportedListingId,
      optional: true,
      to: r.listings.id,
    }),
    reportedMessage: r.one.messages({
      from: r.reports.reportedMessageId,
      optional: true,
      to: r.messages.id,
    }),
    reportedUser: r.one.users({
      from: r.reports.reportedUserId,
      optional: true,
      to: r.users.id,
    }),
    reporter: r.one.users({
      from: r.reports.reporterId,
      to: r.users.id,
    }),
    reviewedBy: r.one.users({
      from: r.reports.reviewedById,
      optional: true,
      to: r.users.id,
    }),
  },

  strikes: {
    issuedBy: r.one.users({
      from: r.strikes.issuedById,
      optional: true,
      to: r.users.id,
    }),
    user: r.one.users({
      from: r.strikes.userId,
      to: r.users.id,
    }),
  },

  notifications: {
    user: r.one.users({
      from: r.notifications.userId,
      to: r.users.id,
    }),
  },
}));
