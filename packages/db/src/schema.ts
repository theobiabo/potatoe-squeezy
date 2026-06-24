import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email"),
  name: text("name"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  twitterUrl: text("twitter_url"),
  tippersPublic: boolean("tippers_public").notNull().default(false),
  leaderboardOptIn: boolean("leaderboard_opt_in").notNull().default(false),
  notificationsClearedAt: timestamp("notifications_cleared_at"),
  network: text("network"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable(
  "wallets",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    chain: text("chain").notNull(),
    address: text("address").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userChainUnique: uniqueIndex("wallets_user_chain_unique").on(
      table.userId,
      table.chain,
    ),
  }),
);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    chain: text("chain").notNull(),
    address: text("address").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userChainUnique: uniqueIndex("addresses_user_chain_unique").on(
      table.userId,
      table.chain,
    ),
  }),
);

export const sponsorshipTiers = pgTable("sponsorship_tiers", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  label: text("label").notNull(),
  description: text("description").notNull(),
  perk: text("perk"),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull().default("SOL"),
  rail: text("rail").notNull().default("solana"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactionRecords = pgTable("transaction_records", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  senderAddress: text("sender_address").notNull(),
  senderId: integer("sender_id").references(() => users.id),
  senderType: text("sender_type"),
  senderName: text("sender_name"),
  senderAvatarUrl: text("sender_avatar_url"),
  paymentProtocol: text("payment_protocol"),
  recipientAddress: text("recipient_address").notNull(),
  recipientId: integer("recipient_id").references(() => users.id),
  tierId: integer("tier_id").references(() => sponsorshipTiers.id),
  rail: text("rail").notNull().default("solana"),
  currency: text("currency").notNull().default("SOL"),
  txHash: text("tx_hash"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tipReceipts = pgTable(
  "tip_receipts",
  {
    id: text("id").primaryKey(),
    transactionRecordId: integer("transaction_record_id")
      .notNull()
      .references(() => transactionRecords.id),
    rail: text("rail").notNull(),
    receiptType: text("receipt_type").notNull(),
    receiptRef: text("receipt_ref"),
    receiptData: jsonb("receipt_data").$type<Record<string, unknown>>(),
    payerAddress: text("payer_address").notNull(),
    recipientAddress: text("recipient_address").notNull(),
    amount: numeric("amount").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull().default("recorded"),
    mintedAt: timestamp("minted_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    transactionReceiptUnique: uniqueIndex(
      "tip_receipts_transaction_record_unique",
    ).on(table.transactionRecordId),
  }),
);

export const recurringSubscriptions = pgTable("recurring_subscriptions", {
  id: text("id").primaryKey(),
  supporterId: integer("supporter_id").references(() => users.id),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  tierId: integer("tier_id").references(() => sponsorshipTiers.id),
  rail: text("rail").notNull(),
  provider: text("provider").notNull(),
  providerRef: text("provider_ref"),
  status: text("status").notNull().default("pending"),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  interval: text("interval").notNull().default("month"),
  payerAddress: text("payer_address").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  nextBillingAt: timestamp("next_billing_at"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const widgetEvents = pgTable("widget_events", {
  id: text("id").primaryKey(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  eventType: text("event_type").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gatedContents = pgTable("gated_contents", {
  id: text("id").primaryKey(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  resourceType: text("resource_type").notNull().default("link"),
  resourceUrl: text("resource_url").notNull(),
  minAmount: numeric("min_amount").notNull(),
  currency: text("currency").notNull().default("SOL"),
  rail: text("rail").notNull().default("solana"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gatedContentAccesses = pgTable("gated_content_accesses", {
  id: text("id").primaryKey(),
  contentId: text("content_id")
    .notNull()
    .references(() => gatedContents.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  transactionRecordId: integer("transaction_record_id").references(
    () => transactionRecords.id,
  ),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const githubActionEvents = pgTable("github_action_events", {
  id: text("id").primaryKey(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  repo: text("repo").notNull(),
  releaseTag: text("release_tag"),
  releaseName: text("release_name"),
  releaseUrl: text("release_url"),
  actionRunUrl: text("action_run_url"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tips = pgTable("tips", {
  id: text("id").primaryKey(),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  receiverId: integer("receiver_id")
    .notNull()
    .references(() => users.id),
  amount: numeric("amount").notNull(),
  token: text("token").notNull(),
  network: text("network").notNull(),
  txHash: text("tx_hash").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bounties = pgTable(
  "bounties",
  {
    id: text("id").primaryKey(),
    repo: text("repo").notNull(),
    issueNumber: integer("issue_number").notNull(),
    creatorId: integer("creator_id")
      .notNull()
      .references(() => users.id),
    amount: numeric("amount").notNull(),
    token: text("token").notNull(),
    network: text("network").notNull(),
    status: text("status").notNull(),
    escrowTxHash: text("escrow_tx_hash").notNull(),
    payoutTxHash: text("payout_tx_hash"),
    refundTxHash: text("refund_tx_hash"),
    isVerified: boolean("is_verified").notNull().default(false),
    verificationSource: text("verification_source"),
    verifiedAt: timestamp("verified_at"),
    botActorLogin: text("bot_actor_login"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    repoIssueUnique: uniqueIndex("bounties_repo_issue_unique").on(
      table.repo,
      table.issueNumber,
    ),
  }),
);

export const contributions = pgTable(
  "contributions",
  {
    id: text("id").primaryKey(),
    bountyId: text("bounty_id")
      .notNull()
      .references(() => bounties.id),
    contributorId: integer("contributor_id")
      .notNull()
      .references(() => users.id),
    prNumber: integer("pr_number").notNull(),
    merged: boolean("merged").notNull().default(false),
    difficulty: integer("difficulty").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    mergedAt: timestamp("merged_at"),
  },
  (table) => ({
    uniqueBountyPr: uniqueIndex("contributions_bounty_pr_unique").on(
      table.bountyId,
      table.prNumber,
    ),
  }),
);

export const developerStats = pgTable("developer_stats", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  totalEarnedUSD: numeric("total_earned_usd").notNull().default("0"),
  totalTipsUSD: numeric("total_tips_usd").notNull().default("0"),
  bountiesCompleted: integer("bounties_completed").notNull().default(0),
  consecutiveDays: integer("consecutive_days").notNull().default(0),
  totalPoints: numeric("total_points").notNull().default("0"),
  lastContributionDate: timestamp("last_contribution_date"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp("earned_at").defaultNow(),
  },
  (table) => ({
    userBadgeUnique: uniqueIndex("user_badges_user_badge_unique").on(
      table.userId,
      table.badgeId,
    ),
  }),
);

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  deliveryId: text("delivery_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  status: text("status").notNull(),
  payloadHash: text("payload_hash"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  wallets: many(wallets),
  addresses: many(addresses),
  sponsorshipTiers: many(sponsorshipTiers),
  tipsSent: many(tips, { relationName: "sent_tips" }),
  tipsReceived: many(tips, { relationName: "received_tips" }),
  bountiesCreated: many(bounties),
  contributions: many(contributions),
  stats: one(developerStats),
  badges: many(userBadges),
  subscriptionsCreated: many(recurringSubscriptions, {
    relationName: "creator_subscriptions",
  }),
  subscriptionsSupported: many(recurringSubscriptions, {
    relationName: "supporter_subscriptions",
  }),
  gatedContents: many(gatedContents),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const transactionRecordsRelations = relations(
  transactionRecords,
  ({ one, many }) => ({
    sender: one(users, {
      fields: [transactionRecords.senderId],
      references: [users.id],
    }),
    recipient: one(users, {
      fields: [transactionRecords.recipientId],
      references: [users.id],
    }),
    tier: one(sponsorshipTiers, {
      fields: [transactionRecords.tierId],
      references: [sponsorshipTiers.id],
    }),
    receipts: many(tipReceipts),
  }),
);

export const sponsorshipTiersRelations = relations(
  sponsorshipTiers,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [sponsorshipTiers.creatorId],
      references: [users.id],
    }),
    transactionRecords: many(transactionRecords),
    subscriptions: many(recurringSubscriptions),
  }),
);

export const tipReceiptsRelations = relations(tipReceipts, ({ one }) => ({
  transactionRecord: one(transactionRecords, {
    fields: [tipReceipts.transactionRecordId],
    references: [transactionRecords.id],
  }),
}));

export const recurringSubscriptionsRelations = relations(
  recurringSubscriptions,
  ({ one }) => ({
    creator: one(users, {
      relationName: "creator_subscriptions",
      fields: [recurringSubscriptions.creatorId],
      references: [users.id],
    }),
    supporter: one(users, {
      relationName: "supporter_subscriptions",
      fields: [recurringSubscriptions.supporterId],
      references: [users.id],
    }),
    tier: one(sponsorshipTiers, {
      fields: [recurringSubscriptions.tierId],
      references: [sponsorshipTiers.id],
    }),
  }),
);

export const widgetEventsRelations = relations(widgetEvents, ({ one }) => ({
  creator: one(users, {
    fields: [widgetEvents.creatorId],
    references: [users.id],
  }),
}));

export const gatedContentsRelations = relations(
  gatedContents,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [gatedContents.creatorId],
      references: [users.id],
    }),
    accesses: many(gatedContentAccesses),
  }),
);

export const gatedContentAccessesRelations = relations(
  gatedContentAccesses,
  ({ one }) => ({
    content: one(gatedContents, {
      fields: [gatedContentAccesses.contentId],
      references: [gatedContents.id],
    }),
    user: one(users, {
      fields: [gatedContentAccesses.userId],
      references: [users.id],
    }),
    transactionRecord: one(transactionRecords, {
      fields: [gatedContentAccesses.transactionRecordId],
      references: [transactionRecords.id],
    }),
  }),
);

export const githubActionEventsRelations = relations(
  githubActionEvents,
  ({ one }) => ({
    creator: one(users, {
      fields: [githubActionEvents.creatorId],
      references: [users.id],
    }),
  }),
);

export const tipsRelations = relations(tips, ({ one }) => ({
  sender: one(users, {
    relationName: "sent_tips",
    fields: [tips.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    relationName: "received_tips",
    fields: [tips.receiverId],
    references: [users.id],
  }),
}));

export const bountiesRelations = relations(bounties, ({ one, many }) => ({
  creator: one(users, {
    fields: [bounties.creatorId],
    references: [users.id],
  }),
  contributions: many(contributions),
}));

export const contributionsRelations = relations(contributions, ({ one }) => ({
  bounty: one(bounties, {
    fields: [contributions.bountyId],
    references: [bounties.id],
  }),
  contributor: one(users, {
    fields: [contributions.contributorId],
    references: [users.id],
  }),
}));

export const developerStatsRelations = relations(developerStats, ({ one }) => ({
  user: one(users, {
    fields: [developerStats.userId],
    references: [users.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));
