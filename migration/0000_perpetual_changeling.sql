CREATE TYPE "public"."area_status_enum" AS ENUM('unassigned', 'newly_assigned', 'ongoing_survey', 'revision', 'asked_for_completion', 'asked_for_revision_completion', 'asked_for_withdrawl');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('enumerator', 'supervisor', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "areas" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"code" integer NOT NULL,
	"ward" integer NOT NULL,
	"geometry" geometry(Polygon,4326),
	"assigned_to" varchar(21),
	"area_status" "area_status_enum" DEFAULT 'unassigned'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"role" "roles" DEFAULT 'enumerator',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wards" (
	"ward_number" integer PRIMARY KEY NOT NULL,
	"ward_area_code" integer NOT NULL,
	"geometry" geometry(Polygon,4326) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_ward_wards_ward_number_fk" FOREIGN KEY ("ward") REFERENCES "public"."wards"("ward_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "areas" ADD CONSTRAINT "areas_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ward_number_idx" ON "wards" USING btree ("ward_number");