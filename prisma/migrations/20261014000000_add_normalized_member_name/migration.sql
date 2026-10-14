-- Add normalized member names if not already present.
ALTER TABLE "Member"
ADD COLUMN IF NOT EXISTS "normalizedName" TEXT;

-- Backfill existing records.
UPDATE "Member"
SET "normalizedName" = LOWER(
    REGEXP_REPLACE(
        BTRIM("name"),
        '\s+',
        ' ',
        'g'
    )
)
WHERE "normalizedName" IS NULL;

-- Refuse to continue if names collide within a group.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "Member"
        GROUP BY "groupId", "normalizedName"
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Duplicate normalized names exist within a group.';
    END IF;
END $$;

-- Enforce required values and uniqueness.
ALTER TABLE "Member"
ALTER COLUMN "normalizedName" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
"Member_groupId_normalizedName_key"
ON "Member" ("groupId", "normalizedName");