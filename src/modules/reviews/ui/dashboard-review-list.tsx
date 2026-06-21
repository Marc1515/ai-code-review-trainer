"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import type { ReviewSummary } from "@/modules/reviews/infrastructure/db/review-repository";
import { deleteReviewAction, deleteManyReviewsAction } from "@/server/actions/dashboard.action";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { useToast } from "@/shared/hooks/use-toast";

interface Props {
  reviews: ReviewSummary[];
  maxReviews: number;
}

type ConfirmState = { kind: "none" } | { kind: "one"; id: string } | { kind: "many" };

export function DashboardReviewList({ reviews, maxReviews }: Props) {
  const t = useTranslations("dashboard");
  const tReview = useTranslations("review");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const { showToast } = useToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ReviewType | "all">("all");
  const [confirmState, setConfirmState] = useState<ConfirmState>({ kind: "none" });

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

  const filteredReviews =
    activeFilter === "all" ? reviews : reviews.filter((r) => r.reviewType === activeFilter);

  const allSelected =
    filteredReviews.length > 0 && filteredReviews.every((r) => selectedIds.has(r.id));

  const availableTypes = REVIEW_TYPES.filter((type) => reviews.some((r) => r.reviewType === type));

  function toggleMultiSelectMode() {
    if (isMultiSelectMode) {
      setSelectedIds(new Set());
    }
    setIsMultiSelectMode((prev) => !prev);
  }

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
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredReviews.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredReviews.forEach((r) => next.add(r.id));
        return next;
      });
    }
  }

  // Opens the confirmation modal for a single review deletion
  function requestDeleteOne(id: string) {
    setConfirmState({ kind: "one", id });
  }

  // Opens the confirmation modal for bulk deletion
  function requestDeleteMany() {
    setConfirmState({ kind: "many" });
  }

  function cancelConfirm() {
    setConfirmState({ kind: "none" });
  }

  async function executeDeleteOne() {
    if (confirmState.kind !== "one") return;
    const { id } = confirmState;
    setIsDeleting(true);
    setError(null);
    const result = await deleteReviewAction(id);
    setIsDeleting(false);
    setConfirmState({ kind: "none" });
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
    showToast(tToast("reviewDeleted"));
  }

  async function executeDeleteMany() {
    const ids = Array.from(selectedIds);
    setIsDeleting(true);
    setError(null);
    const result = await deleteManyReviewsAction(ids);
    setIsDeleting(false);
    setConfirmState({ kind: "none" });
    if (result.status === "error") {
      setError(result.code);
      return;
    }
    const deletedCount = ids.length;
    setSelectedIds(new Set());
    router.refresh();
    showToast(tToast("reviewsDeleted", { count: deletedCount }));
  }

  const isModalOpen = confirmState.kind !== "none";
  const isMany = confirmState.kind === "many";

  return (
    <div>
      {/* Controls bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("count", { current: reviews.length, max: maxReviews })}
        </span>

        {reviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by review type */}
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as ReviewType | "all")}
              aria-label={t("filterLabel")}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:focus:border-teal-500"
            >
              <option value="all">{t("filterAll")}</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {localizedType(type)}
                </option>
              ))}
            </select>

            {/* Multi-select mode toggle — always visible */}
            <button
              type="button"
              onClick={toggleMultiSelectMode}
              disabled={isDeleting}
              aria-pressed={isMultiSelectMode}
              className={[
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                isMultiSelectMode
                  ? "border-teal-400 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-500/50 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
                  : "border-zinc-300 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200",
              ].join(" ")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A2.75 2.75 0 0 1 4.75 2h6.5A2.75 2.75 0 0 1 14 4.75v6.5A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5Zm8.03 2.97a.75.75 0 0 0-1.06 0L7.5 9.44l-.72-.72a.75.75 0 0 0-1.06 1.06l1.25 1.25a.75.75 0 0 0 1.06 0l2-2a.75.75 0 0 0 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
              {t("multiselect")}
            </button>

            {/*
             * Animated group: Select all + Delete selected.
             * CSS grid 0fr→1fr animates to the natural content width
             * without requiring a hardcoded max-width guess.
             */}
            <div
              className={[
                "grid overflow-hidden transition-all duration-200 ease-out",
                isMultiSelectMode ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    disabled={isDeleting || filteredReviews.length === 0}
                    tabIndex={isMultiSelectMode ? 0 : -1}
                    className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm whitespace-nowrap text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                  >
                    {allSelected ? t("deselectAll") : t("selectAll")}
                  </button>

                  {/* Delete selected — second-level animation within the group */}
                  <div
                    className={[
                      "grid overflow-hidden transition-all duration-150 ease-out",
                      isMultiSelectMode && selectedIds.size > 0
                        ? "grid-cols-[1fr] opacity-100"
                        : "grid-cols-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden">
                      <button
                        type="button"
                        onClick={requestDeleteMany}
                        disabled={isDeleting}
                        tabIndex={isMultiSelectMode && selectedIds.size > 0 ? 0 : -1}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                      >
                        {t("deleteSelected", { count: selectedIds.size })}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* List / empty states */}
      {reviews.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
      ) : filteredReviews.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("emptyFilter")}</p>
      ) : (
        <ul
          className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-700/60 dark:border-zinc-700/60 dark:bg-zinc-800/60"
          aria-busy={isDeleting}
        >
          {filteredReviews.map((review) => (
            <li
              key={review.id}
              className="flex items-center px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/40"
            >
              {/*
               * Checkbox slot — always in the DOM.
               * Animates width (0→1rem) and margin-right (0→0.75rem) together
               * with opacity, so the row content shifts smoothly without a pop.
               */}
              <div
                className={[
                  "flex-shrink-0 overflow-hidden transition-all duration-200 ease-out",
                  isMultiSelectMode
                    ? "mr-3 w-4 opacity-100"
                    : "pointer-events-none mr-0 w-0 opacity-0",
                ].join(" ")}
                aria-hidden={!isMultiSelectMode || undefined}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(review.id)}
                  onChange={() => toggleSelect(review.id)}
                  disabled={isDeleting}
                  tabIndex={isMultiSelectMode ? 0 : -1}
                  aria-label={t("checkboxLabel")}
                  className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-teal-600 disabled:cursor-not-allowed"
                />
              </div>

              {/* Clickable content area — navigates to review detail */}
              <Link
                href={`/dashboard/reviews/${review.id}`}
                className="flex min-w-0 flex-1 flex-col gap-0.5 py-0.5"
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                    {localizedType(review.reviewType)}
                  </span>
                  {review.language && (
                    <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                      {review.language}
                    </span>
                  )}
                </div>
                <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {review.summary}
                </p>
              </Link>

              {/* Right-side action area — date and trash always together */}
              <div className="ml-3 flex flex-shrink-0 items-center gap-1.5">
                <span className="text-xs text-zinc-400 tabular-nums dark:text-zinc-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => requestDeleteOne(review.id)}
                  disabled={isDeleting}
                  aria-label={t("delete")}
                  className="flex-shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:bg-red-950/60 dark:hover:text-red-400"
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
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error === "unauthorized" ? tReview("error.validation") : tReview("error.generic")}
        </p>
      )}

      {/* Confirmation modal — shared for single and bulk deletion */}
      <ConfirmDialog
        open={isModalOpen}
        title={isMany ? t("deleteModal.titleMany") : t("deleteModal.titleOne")}
        description={
          isMany ? t("deleteModal.bodyMany", { count: selectedIds.size }) : t("deleteModal.bodyOne")
        }
        confirmLabel={isMany ? t("deleteModal.confirmMany") : t("deleteModal.confirmOne")}
        cancelLabel={t("deleteModal.cancelLabel")}
        onConfirm={isMany ? executeDeleteMany : executeDeleteOne}
        onCancel={cancelConfirm}
        isPending={isDeleting}
      />
    </div>
  );
}
