ALTER TABLE "Request"
ADD COLUMN "subscriptionEndsAt" TIMESTAMP(3),
ADD COLUMN "subscriptionEndingNotifiedAt" TIMESTAMP(3),
ADD COLUMN "subscriptionEndedAt" TIMESTAMP(3),
ADD COLUMN "notes" TEXT;

CREATE INDEX "Request_subscriptionEndsAt_idx" ON "Request"("subscriptionEndsAt");
