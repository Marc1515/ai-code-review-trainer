"use server";

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { auth } from "@/auth";
import { MAX_SAVED_REVIEWS } from "@/modules/reviews/domain/constants";
import {
  deleteByIdForUser,
  deleteManyForUser,
} from "@/modules/reviews/infrastructure/db/review-repository";

export type DashboardActionState =
  | { status: "success" }
  | { status: "error"; code: "unauthorized" | "validation" };

const deleteOneSchema = z.object({
  reviewId: z.string().cuid(),
});

const deleteManySchema = z.object({
  reviewIds: z.array(z.string().cuid()).min(1).max(MAX_SAVED_REVIEWS),
});

export async function deleteReviewAction(reviewId: string): Promise<DashboardActionState> {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured.
  }
  if (!userId) return { status: "error", code: "unauthorized" };

  const parsed = deleteOneSchema.safeParse({ reviewId });
  if (!parsed.success) return { status: "error", code: "validation" };

  try {
    await deleteByIdForUser(parsed.data.reviewId, userId);
    return { status: "success" };
  } catch (err) {
    Sentry.captureException(err);
    return { status: "error", code: "validation" };
  }
}

export async function deleteManyReviewsAction(reviewIds: string[]): Promise<DashboardActionState> {
  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id ?? undefined;
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured.
  }
  if (!userId) return { status: "error", code: "unauthorized" };

  const parsed = deleteManySchema.safeParse({ reviewIds });
  if (!parsed.success) return { status: "error", code: "validation" };

  try {
    await deleteManyForUser(parsed.data.reviewIds, userId);
    return { status: "success" };
  } catch (err) {
    Sentry.captureException(err);
    return { status: "error", code: "validation" };
  }
}
