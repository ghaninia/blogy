ALTER TABLE "posts"
ADD COLUMN "canonicalUrl" VARCHAR(2048),
ADD COLUMN "socialImageMediaId" TEXT;

CREATE INDEX "posts_socialImageMediaId_idx" ON "posts"("socialImageMediaId");

ALTER TABLE "posts"
ADD CONSTRAINT "posts_socialImageMediaId_fkey"
FOREIGN KEY ("socialImageMediaId") REFERENCES "media"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
