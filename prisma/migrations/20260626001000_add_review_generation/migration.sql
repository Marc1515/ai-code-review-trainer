-- Stores the short-lived server-side state of an AI review generation so the
-- browser can recover the result after a tab/window is closed mid-request.
CREATE TABLE "ReviewGeneration" (
    "id" TEXT NOT NULL,
    "clientRequestId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "language" TEXT,
    "code" TEXT NOT NULL,
    "summary" TEXT,
    "findings" JSONB,
    "errorCode" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "savedReviewId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewGeneration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReviewGeneration_clientRequestId_key" ON "ReviewGeneration"("clientRequestId");
CREATE INDEX "ReviewGeneration_expiresAt_idx" ON "ReviewGeneration"("expiresAt");
