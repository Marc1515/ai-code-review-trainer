import { Prisma } from "@prisma/client";

import type { Finding, ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";
import { prisma } from "@/shared/db/client";

const GENERATION_TTL_MS = 24 * 60 * 60 * 1000;

export type ReviewGenerationStatus = "pending" | "success" | "error";

export interface ReviewGenerationRecord {
  clientRequestId: string;
  status: ReviewGenerationStatus;
  input: ReviewInput;
  result?: ReviewResult;
  saved: boolean;
  errorCode?: string;
  createdAt: Date;
  completedAt: Date | null;
}

export interface StartReviewGenerationParams {
  clientRequestId: string;
  input: ReviewInput;
  userId?: string;
}

export async function cleanupExpiredReviewGenerations(now = new Date()): Promise<void> {
  await prisma.reviewGeneration.deleteMany({
    where: { expiresAt: { lt: now } },
  });
}

export async function startReviewGeneration({
  clientRequestId,
  input,
  userId,
}: StartReviewGenerationParams): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + GENERATION_TTL_MS);

  await prisma.reviewGeneration.upsert({
    where: { clientRequestId },
    create: {
      clientRequestId,
      status: "pending",
      userId,
      reviewType: input.reviewType,
      language: input.language ?? null,
      code: input.code,
      expiresAt,
    },
    update: {
      status: "pending",
      userId,
      reviewType: input.reviewType,
      language: input.language ?? null,
      code: input.code,
      summary: null,
      findings: Prisma.JsonNull,
      errorCode: null,
      saved: false,
      savedReviewId: null,
      completedAt: null,
      expiresAt,
    },
  });
}

export interface CompleteReviewGenerationParams {
  clientRequestId: string;
  result: ReviewResult;
  saved: boolean;
  savedReviewId?: string;
}

export async function completeReviewGeneration({
  clientRequestId,
  result,
  saved,
  savedReviewId,
}: CompleteReviewGenerationParams): Promise<void> {
  await prisma.reviewGeneration.updateMany({
    where: { clientRequestId },
    data: {
      status: "success",
      summary: result.summary,
      findings: result.findings as unknown as Prisma.InputJsonValue,
      errorCode: null,
      saved,
      savedReviewId,
      completedAt: new Date(),
    },
  });
}

export async function failReviewGeneration(
  clientRequestId: string,
  errorCode: string,
): Promise<void> {
  await prisma.reviewGeneration.updateMany({
    where: { clientRequestId },
    data: {
      status: "error",
      errorCode,
      completedAt: new Date(),
    },
  });
}

export async function getReviewGenerationByClientRequestId(
  clientRequestId: string,
): Promise<ReviewGenerationRecord | null> {
  const row = await prisma.reviewGeneration.findUnique({
    where: { clientRequestId },
    select: {
      clientRequestId: true,
      status: true,
      reviewType: true,
      language: true,
      code: true,
      summary: true,
      findings: true,
      saved: true,
      errorCode: true,
      createdAt: true,
      completedAt: true,
    },
  });

  if (!row) return null;

  const result =
    row.status === "success" && row.summary && row.findings
      ? {
          reviewType: row.reviewType as ReviewResult["reviewType"],
          summary: row.summary,
          findings: row.findings as unknown as Finding[],
        }
      : undefined;

  return {
    clientRequestId: row.clientRequestId,
    status: row.status as ReviewGenerationStatus,
    input: {
      code: row.code,
      language: row.language ?? undefined,
      reviewType: row.reviewType as ReviewInput["reviewType"],
    },
    result,
    saved: row.saved,
    errorCode: row.errorCode ?? undefined,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
  };
}
