-- Groups created before source-order support were numbered only by their
-- ordinal among groups. Rebase them on the first assignment in each group so
-- ungrouped assignments and group headings retain the order of the import.
WITH group_first_assignment AS (
	SELECT "group_id", min("sort_order") AS "sort_order"
	FROM "memberships"
	WHERE "group_id" IS NOT NULL
	GROUP BY "group_id"
)
UPDATE "department_groups" AS "group"
SET "sort_order" = "first_assignment"."sort_order",
	"updated_at" = now()
FROM group_first_assignment AS "first_assignment"
WHERE "group"."id" = "first_assignment"."group_id";
