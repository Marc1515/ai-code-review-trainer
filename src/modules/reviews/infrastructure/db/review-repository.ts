import { prisma } from "@/shared/db/client";
import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";

export interface SaveReviewParams {
  userId: string;
  input: ReviewInput;
  result: ReviewResult;
}

export async function saveReview({ userId, input, result }: SaveReviewParams): Promise<void> {
  await prisma.review.create({
    data: {
      userId,
      reviewType: result.reviewType,
      language: input.language ?? null,
      code: input.code,
      summary: result.summary,
      findings: result.findings as unknown as import("@prisma/client").Prisma.InputJsonValue,
    },
  });
}
