"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import type { ReviewSummary } from "@/modules/reviews/infrastructure/db/review-repository";
import { deleteReviewAction, deleteManyReviewsAction } from "@/server/actions/dashboard.action";

interface Props {
  reviews: ReviewSummary[];
  maxReviews: number;
}

export function DashboardReviewList({ reviews, maxReviews }: Props) {
  const t = useTranslations("dashboard");
  const tReview = useTranslations("review");
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeLabels: Record<ReviewType, string> = {
    general: tReview("types.general"),
    "clean-code": tReview("types.cleanCode"),
    bugs: tReview("types.bugs"),
    security: tReview("types.security"),
    performance: tReview("types.performance"),
    architecture: tReview("types.architecture"),
    testing: tReview("types.testing"),
  };

  const localizedType = (raw: string): string =>
    REVIEW_TYPES.includes(raw as ReviewType) ? typeLabels[raw as ReviewType] : raw;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === reviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reviews.map((r) => r.id)));
    }
  }

  async function handleDeleteOne(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteReviewAction(id);
    setIsDeleting(false);
    if (result.status === "error") {
      setError(result.code);
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    router.refresh();
  }

  async function handleDeleteMany() {
    const ids = Array.from(selectedIds);
    if (!window.confirm(t("confirmDeleteMany", { count: ids.length }))) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteManyReviewsAction(ids);
    setIsDeleting(false);
    if (result.status === "error") {
      setError(result.code);
      return;
    }
    setSelectedIds(new Set());
    router.refresh();
  }

  const allSelected = reviews.length > 0 && selectedIds.size === reviews.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-zinc-500">
          {t("count", { current: reviews.length, max: maxReviews })}
        </span>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              disabled={isDeleting}
              className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allSelected ? t("deselectAll") : t("selectAll")}
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleDeleteMany}
                disabled={isDeleting}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("deleteSelected", { count: selectedIds.size })}
              </button>
            )}
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("empty")}</p>
      ) : (
        <ul
          className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white"
          aria-busy={isDeleting}
        >
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(review.id)}
                onChange={() => toggleSelect(review.id)}
                disabled={isDeleting}
                aria-label={t("delete")}
                className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-zinc-300 accent-zinc-900 disabled:cursor-not-allowed"
              />
              <Link
                href={`/dashboard/reviews/${review.id}`}
                className="flex flex-1 flex-col gap-1 py-1"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                    {localizedType(review.reviewType)}
                  </span>
                  {review.language && (
                    <span className="text-xs text-zinc-500">{review.language}</span>
                  )}
                  <span className="ml-auto text-xs text-zinc-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-zinc-700">{review.summary}</p>
              </Link>
              <button
                type="button"
                onClick={() => handleDeleteOne(review.id)}
                disabled={isDeleting}
                aria-label={t("delete")}
                className="flex-shrink-0 rounded p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 3.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error === "unauthorized" ? tReview("error.validation") : tReview("error.generic")}
        </p>
      )}
    </div>
  );
}
