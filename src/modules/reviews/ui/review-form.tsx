"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import { MAX_CODE_LENGTH } from "@/modules/reviews/schemas/review.schema";
import { reviewAction } from "@/server/actions/review.action";
import type { ReviewActionState } from "@/server/actions/review.action";
import { ReviewResult } from "@/modules/reviews/ui/review-result";

const initialState: ReviewActionState = { status: "idle" };

export function ReviewForm() {
  const t = useTranslations("review");
  const [state, formAction, isPending] = useActionState(reviewAction, initialState);

  const typeLabels: Record<ReviewType, string> = {
    general: t("types.general"),
    "clean-code": t("types.cleanCode"),
    bugs: t("types.bugs"),
    security: t("types.security"),
    performance: t("types.performance"),
    architecture: t("types.architecture"),
    testing: t("types.testing"),
  };

  return (
    <div>
      <form action={formAction} className="space-y-6">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-zinc-700">
            {t("form.codeLabel")}
          </label>
          <textarea
            id="code"
            name="code"
            rows={14}
            required
            maxLength={MAX_CODE_LENGTH}
            placeholder={t("form.codePlaceholder")}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-zinc-400">{t("form.codeHint")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="language" className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("form.languageLabel")}
            </label>
            <input
              id="language"
              name="language"
              type="text"
              placeholder={t("form.languagePlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="reviewType" className="mb-1.5 block text-sm font-medium text-zinc-700">
              {t("form.reviewTypeLabel")}
            </label>
            <select
              id="reviewType"
              name="reviewType"
              defaultValue="general"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none"
            >
              {REVIEW_TYPES.map((type) => (
                <option key={type} value={type}>
                  {typeLabels[type]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {state.status === "error" && (
          <p role="alert" className="text-sm text-red-600">
            {state.code === "validation"
              ? t("error.validation")
              : state.code === "rate-limit"
                ? t("error.rateLimit")
                : t("error.generic")}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? t("form.submitting") : t("form.submit")}
        </button>
      </form>

      {state.status === "success" && <ReviewResult result={state.result} />}
    </div>
  );
}
