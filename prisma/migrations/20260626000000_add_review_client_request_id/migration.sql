-- Add an optional client-side request id so a browser can reconcile a review
-- after closing/reopening the tab while the server-side generation continues.
ALTER TABLE "Review" ADD COLUMN "clientRequestId" TEXT;

CREATE UNIQUE INDEX "Review_clientRequestId_key" ON "Review"("clientRequestId");
