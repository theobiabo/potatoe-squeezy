CREATE TABLE "sponsorship_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"perk" text,
	"amount" numeric NOT NULL,
	"currency" text DEFAULT 'SOL' NOT NULL,
	"rail" text DEFAULT 'solana' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "leaderboard_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_records" ADD COLUMN "tier_id" integer;--> statement-breakpoint
ALTER TABLE "transaction_records" ADD COLUMN "rail" text DEFAULT 'solana' NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_records" ADD COLUMN "currency" text DEFAULT 'SOL' NOT NULL;--> statement-breakpoint
CREATE TABLE "tip_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_record_id" integer NOT NULL,
	"rail" text NOT NULL,
	"receipt_type" text NOT NULL,
	"receipt_ref" text,
	"receipt_data" jsonb,
	"payer_address" text NOT NULL,
	"recipient_address" text NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text NOT NULL,
	"status" text DEFAULT 'recorded' NOT NULL,
	"minted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"supporter_id" integer,
	"creator_id" integer NOT NULL,
	"tier_id" integer,
	"rail" text NOT NULL,
	"provider" text NOT NULL,
	"provider_ref" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount" numeric NOT NULL,
	"currency" text NOT NULL,
	"interval" text DEFAULT 'month' NOT NULL,
	"payer_address" text NOT NULL,
	"recipient_address" text NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"next_billing_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "widget_events" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gated_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"resource_type" text DEFAULT 'link' NOT NULL,
	"resource_url" text NOT NULL,
	"min_amount" numeric NOT NULL,
	"currency" text DEFAULT 'SOL' NOT NULL,
	"rail" text DEFAULT 'solana' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gated_content_accesses" (
	"id" text PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"user_id" integer NOT NULL,
	"transaction_record_id" integer,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "github_action_events" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" integer NOT NULL,
	"repo" text NOT NULL,
	"release_tag" text,
	"release_name" text,
	"release_url" text,
	"action_run_url" text,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sponsorship_tiers" ADD CONSTRAINT "sponsorship_tiers_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_records" ADD CONSTRAINT "transaction_records_tier_id_sponsorship_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."sponsorship_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tip_receipts" ADD CONSTRAINT "tip_receipts_transaction_record_id_transaction_records_id_fk" FOREIGN KEY ("transaction_record_id") REFERENCES "public"."transaction_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_subscriptions" ADD CONSTRAINT "recurring_subscriptions_supporter_id_users_id_fk" FOREIGN KEY ("supporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_subscriptions" ADD CONSTRAINT "recurring_subscriptions_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_subscriptions" ADD CONSTRAINT "recurring_subscriptions_tier_id_sponsorship_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."sponsorship_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_events" ADD CONSTRAINT "widget_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gated_contents" ADD CONSTRAINT "gated_contents_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gated_content_accesses" ADD CONSTRAINT "gated_content_accesses_content_id_gated_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."gated_contents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gated_content_accesses" ADD CONSTRAINT "gated_content_accesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gated_content_accesses" ADD CONSTRAINT "gated_content_accesses_transaction_record_id_transaction_records_id_fk" FOREIGN KEY ("transaction_record_id") REFERENCES "public"."transaction_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_action_events" ADD CONSTRAINT "github_action_events_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tip_receipts_transaction_record_unique" ON "tip_receipts" USING btree ("transaction_record_id");
