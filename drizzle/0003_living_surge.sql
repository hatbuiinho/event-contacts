CREATE TABLE "department_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD COLUMN "group_id" uuid;--> statement-breakpoint
-- Preserve headings parsed from earlier imports as first-class groups before
-- membership rows begin using group_id.
INSERT INTO "department_groups" ("department_id", "name", "normalized_name", "sort_order")
SELECT
	"department_id",
	"group_name",
	lower("group_name"),
	row_number() OVER (PARTITION BY "department_id" ORDER BY min("sort_order")) - 1
FROM (
	SELECT "department_id", btrim("role") AS "group_name", "sort_order"
	FROM "memberships"
	WHERE btrim("role") <> ''
) AS "legacy_groups"
GROUP BY "department_id", "group_name";--> statement-breakpoint
UPDATE "memberships" AS "membership"
SET "group_id" = "group"."id"
FROM "department_groups" AS "group"
WHERE "membership"."department_id" = "group"."department_id"
	AND btrim("membership"."role") = "group"."name";--> statement-breakpoint
ALTER TABLE "department_groups" ADD CONSTRAINT "department_groups_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "department_groups_department_idx" ON "department_groups" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "department_groups_department_sort_idx" ON "department_groups" USING btree ("department_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "department_groups_department_name_unique" ON "department_groups" USING btree ("department_id","normalized_name");--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_group_id_department_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."department_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memberships_group_idx" ON "memberships" USING btree ("group_id");
