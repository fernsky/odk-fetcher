ALTER TABLE "wards" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "wards" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "wards" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "wards" ADD COLUMN "sync_status" text DEFAULT 'pending';