"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import { MAX_CODE_LENGTH } from "@/modules/reviews/schemas/review.schema";
import { useEditorTheme } from "@/shared/hooks/use-editor-theme";
import { reviewAction } from "@/server/actions/review.action";
import type { ReviewActionState } from "@/server/actions/review.action";
import { ReviewResult } from "@/modules/reviews/ui/review-result";

// Load CodeMirror client-side only to avoid server-side browser API errors.
const CodeEditor = dynamic(
  () => import("@/modules/reviews/ui/code-editor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full animate-pulse rounded-lg border border-zinc-300 bg-zinc-100" />
    ),
  },
);

const initialState: ReviewActionState = { status: "idle" };

interface Props {
  isAuthenticated?: boolean;
  savedCount?: number;
  maxSavedReviews?: number;
}

export function ReviewForm({
  isAuthenticated = false,
  savedCount = 0,
  maxSavedReviews = 10,
}: Props) {
  const t = useTranslations("review");
  const [state, setState] = useState<ReviewActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { theme } = useEditorTheme();
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const skipSaveRef = useRef(false);

  const isAtLimit = isAuthenticated && savedCount >= maxSavedReviews;
  const codeLength = code.length;

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

  function buildFormData(skipSave = false): FormData | null {
    if (!formRef.current) return null;
    const fd = new FormData(formRef.current);
    fd.set("code", code);
    if (skipSave) fd.set("skipSave", "true");
    return fd;
  }

  function submitFormData(fd: FormData) {
    startTransition(async () => {
      const result = await reviewAction(initialState, fd);
      setState(result);
    });
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;

    if (isAtLimit && !skipSaveRef.current) {
      setShowLimitModal(true);
      return;
    }

    const fd = buildFormData(skipSaveRef.current);
    skipSaveRef.current = false;
    if (fd) submitFormData(fd);
  }

  function handleContinueWithoutSaving() {
    setShowLimitModal(false);
    const fd = buildFormData(true);
    if (fd) submitFormData(fd);
  }

  return (
    <div>
      <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <label htmlFor="cm-code" className="mb-1.5 block text-sm font-medium text-zinc-700">
            {t("form.codeLabel")}
          </label>
          <CodeEditor
            value={code}
            onChange={setCode}
            theme={theme}
            placeholder={t("form.codePlaceholder")}
            maxLength={MAX_CODE_LENGTH}
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
          {isAuthenticated && !state.saved && (
            <p
              role="status"
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {t("notSaved", { max: maxSavedReviews })}
            </p>
          )}
          <ReviewResult result={state.result} />
          {!isAuthenticated && <p className="mt-6 text-sm text-zinc-500">{t("form.saveHint")}</p>}
        </div>
      )}

      {showLimitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLimitModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-900">{t("limitModal.title")}</h2>
            <p className="mt-2 text-sm text-zinc-600">
              {t("limitModal.description", { current: savedCount, max: maxSavedReviews })}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                onClick={() => setShowLimitModal(false)}
              >
                {t("limitModal.goToDashboard")}
              </Link>
              <button
                type="button"
                onClick={handleContinueWithoutSaving}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                {t("limitModal.continueWithoutSaving")}
              </button>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50"
              >
                {t("limitModal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
