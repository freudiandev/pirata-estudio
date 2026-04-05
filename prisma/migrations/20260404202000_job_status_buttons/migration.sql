-- Redefine job statuses with clearer business wording.
ALTER TYPE "JobStatus" RENAME TO "JobStatus_old";

CREATE TYPE "JobStatus" AS ENUM (
  'PENDING',
  'STARTING',
  'ADVANCING',
  'COMPLETED',
  'CANCELLED'
);

ALTER TABLE "Job"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Job"
ALTER COLUMN "status" TYPE "JobStatus"
USING (
  CASE
    WHEN "status"::text = 'PENDING' THEN 'PENDING'
    WHEN "status"::text = 'IN_PROGRESS' THEN 'STARTING'
    WHEN "status"::text = 'READY' THEN 'ADVANCING'
    WHEN "status"::text = 'DELIVERED' THEN 'COMPLETED'
    WHEN "status"::text = 'CANCELLED' THEN 'CANCELLED'
    ELSE 'PENDING'
  END
)::"JobStatus";

ALTER TABLE "Job"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "JobStatus_old";
