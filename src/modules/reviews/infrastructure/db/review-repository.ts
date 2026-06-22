import type { Prisma } from "@prisma/client";
import { prisma } from "@/shared/db/client";
import type {
  Finding,
  ReviewInput,
  ReviewResult,
  ReviewType,
} from "@/modules/reviews/domain/types";
import { getPagination } from "@/modules/reviews/domain/pagination";

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
      findings: result.findings as unknown as Prisma.InputJsonValue,
    },
  });
}

export interface ReviewSummary {
  id: string;
  reviewType: string;
  language: string | null;
  summary: string;
  createdAt: Date;
}

export interface PaginatedReviewSummaries {
  reviews: ReviewSummary[];
  totalReviews: number;
  filteredReviews: number;
  page: number;
  totalPages: number;
}

interface ListReviewsByUserOptions {
  page: number;
  pageSize: number;
  reviewType?: ReviewType;
}

export async function listReviewsByUser(
  userId: string,
  { page, pageSize, reviewType }: ListReviewsByUserOptions,
): Promise<PaginatedReviewSummaries> {
  const where: Prisma.ReviewWhereInput = {
    userId,
    ...(reviewType ? { reviewType } : {}),
  };

  return prisma.$transaction(async (transaction) => {
    const [totalReviews, filteredReviews] = await Promise.all([
      transaction.review.count({ where: { userId } }),
      transaction.review.count({ where }),
    ]);
    const pagination = getPagination(page, filteredReviews, pageSize);

    const reviews = await transaction.review.findMany({
      where,
      select: {
        id: true,
        reviewType: true,
        language: true,
        summary: true,
        createdAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: pagination.offset,
      take: pagination.limit,
    });

    return {
      reviews,
      totalReviews,
      filteredReviews,
      page: pagination.page,
      totalPages: pagination.totalPages,
    };
  });
}

export interface ReviewDetail extends ReviewSummary {
  code: string;
  findings: Finding[];
}

export async function getReviewByIdAndUser(
  id: string,
  userId: string,
): Promise<ReviewDetail | null> {
  const row = await prisma.review.findFirst({
    where: { id, userId },
    select: {
      id: true,
      reviewType: true,
      language: true,
      summary: true,
      createdAt: true,
      code: true,
      findings: true,
    },
  });

  if (!row) return null;

  return {
    ...row,
    findings: row.findings as unknown as Finding[],
  };
}

export async function countByUserId(userId: string): Promise<number> {
  return prisma.review.count({ where: { userId } });
}

export async function deleteByIdForUser(reviewId: string, userId: string): Promise<void> {
  await prisma.review.deleteMany({ where: { id: reviewId, userId } });
}

export async function deleteManyForUser(reviewIds: string[], userId: string): Promise<number> {
  const { count } = await prisma.review.deleteMany({
    where: { id: { in: reviewIds }, userId },
  });
  return count;
}
