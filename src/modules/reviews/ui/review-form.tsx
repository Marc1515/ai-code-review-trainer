"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import { MAX_CODE_LENGTH } from "@/modules/reviews/schemas/review.schema";
import { reviewAction } from "@/server/actions/review.action";
import type { ReviewActionState } from "@/server/actions/review.action";
import { ReviewResult } from "@/modules/reviews/ui/review-result";

const initialState: ReviewActionState = { status: "idle" };

interface Props {
  isAuthenticated?: boolean;
}

export function ReviewForm({ isAuthenticated = false }: Props) {
  const t = useTranslations("review");
  const [state, formAction, isPending] = useActionState(reviewAction, initialState);
  const [codeLength, setCodeLength] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.status]);

  const typeLabels: Record<ReviewType, string> = {
    general: t("types.general"),
    "clean-code": t("types.cleanCode"),
    bugs: t("types.bugs"),
    security: t("types.security"),
    performance: t("types.performance"),
    architecture: t("types.architecture"),
    testing: t("types.testing"),
  };

  const charCountColor =
    codeLength >= MAX_CODE_LENGTH
      ? "text-red-500"
      : codeLength >= 9_500
        ? "text-yellow-500"
        : "text-zinc-400";

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
            onChange={(e) => setCodeLength(e.target.value.length)}
          />
          <p className={`mt-1.5 text-xs ${charCountColor}`}>
            {t("form.charCount", { current: codeLength, max: MAX_CODE_LENGTH })}
          </p>
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
                : state.code === "provider-busy"
                  ? t("error.providerBusy")
                  : state.code === "provider-timeout"
                    ? t("error.providerTimeout")
                    : state.code === "provider-unavailable"
                      ? t("error.providerUnavailable")
                      : t("error.generic")}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex w-fit items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {isPending ? t("form.submitting") : t("form.submit")}
          </button>
          <p className="text-xs text-zinc-400">{t("form.trustNotice")}</p>
        </div>
      </form>

      {state.status === "success" && (
        <div ref={resultRef} className="scroll-mt-8">
          <ReviewResult result={state.result} />
          {!isAuthenticated && <p className="mt-6 text-sm text-zinc-500">{t("form.saveHint")}</p>}
        </div>
      )}
    </div>
  );
}
