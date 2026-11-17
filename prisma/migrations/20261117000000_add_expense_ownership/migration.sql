-- Add creator ownership and edit metadata without changing historical expense data.
ALTER TABLE "Member"
ADD COLUMN "isGroupCreator" BOOLEAN NOT NULL DEFAULT FALSE;

-- Existing groups were created with their creator as the first member.
-- Backfill that first member as the group creator.
WITH first_members AS (
  SELECT DISTINCT ON ("groupId") "id"
  FROM "Member"
  ORDER BY "groupId", "createdAt" ASC, "id" ASC
)
UPDATE "Member"
SET "isGroupCreator" = TRUE
WHERE "id" IN (SELECT "id" FROM first_members);

ALTER TABLE "Expense"
ADD COLUMN "createdById" TEXT,
ADD COLUMN "editedAt" TIMESTAMP(3);

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "Member"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Expense_createdById_idx" ON "Expense"("createdById");
