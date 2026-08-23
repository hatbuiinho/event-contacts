ALTER TABLE "memberships" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0;

WITH ordered_memberships AS (
	SELECT
		"id",
		row_number() OVER (
			PARTITION BY "department_id"
			ORDER BY "created_at", "id"
		) - 1 AS "position"
	FROM "memberships"
)
UPDATE "memberships"
SET "sort_order" = ordered_memberships."position"
FROM ordered_memberships
WHERE "memberships"."id" = ordered_memberships."id";

CREATE INDEX "memberships_department_sort_idx"
	ON "memberships" USING btree ("department_id", "sort_order");
