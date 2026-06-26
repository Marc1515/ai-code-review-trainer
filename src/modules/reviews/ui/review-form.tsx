"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import { MAX_CODE_LENGTH } from "@/modules/reviews/schemas/review.schema";
import { useEditorTheme } from "@/shared/hooks/use-editor-theme";
import { ReviewResult } from "@/modules/reviews/ui/review-result";
import { CODE_SAMPLES } from "@/modules/reviews/ui/review-examples";
import { useReviewGeneration } from "@/modules/reviews/ui/review-generation-provider";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

// Load CodeMirror client-side only to avoid server-side browser API errors.
const CodeEditor = dynamic(
  () => import("@/modules/reviews/ui/code-editor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full animate-pulse rounded-lg border border-zinc-300 bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800" />
    ),
  },
);

const ICON_BTN =
  "rounded-md border border-zinc-200 bg-transparent p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:disabled:opacity-30";

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
  const { state, setCode, setLanguage, setReviewType, submitReview, clearDraft } =
    useReviewGeneration();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const { theme } = useEditorTheme();
  const resultRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const skipSaveRef = useRef(false);

  const isAtLimit = isAuthenticated && savedCount >= maxSavedReviews;
  const isPending = state.status === "pending";
  const { code, language, reviewType } = state;
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
        : "text-zinc-400 dark:text-zinc-500";

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code.trim()) return;

    setShouldPulse(false);

    if (isAtLimit && !skipSaveRef.current) {
      setShowLimitModal(true);
      return;
    }

    submitReview({ skipSave: skipSaveRef.current });
    skipSaveRef.current = false;
  }

  function handleContinueWithoutSaving() {
    setShowLimitModal(false);
    setShouldPulse(false);
    submitReview({ skipSave: true });
  }

  // Scroll so the submit button is as close to the vertical center as possible.
  // Falls back to the maximum scroll position when there isn't enough content below.
  function scrollToSubmit() {
    const el = submitRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollDelta = rect.top + rect.height / 2 - window.innerHeight / 2;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: Math.min(Math.max(window.scrollY + scrollDelta, 0), maxScroll),
      behavior: "smooth",
    });
  }

  function handleLoadExample(type: ReviewType) {
    if (isPending) return;
    setCode(CODE_SAMPLES[type] ?? "");
    setReviewType(type);
    setShouldPulse(true);
    // Wait one rAF so React has committed the new code to the DOM before
    // we measure the submit button's position for the scroll calculation.
    requestAnimationFrame(scrollToSubmit);
  }

  async function handleCopyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      // clipboard API unavailable — fail silently
    }
  }

  function handleClearCode() {
    if (!code || isPending) return;
    setShowClearModal(true);
  }

  function handleConfirmClear() {
    clearDraft();
    setShouldPulse(false);
    setShowClearModal(false);
  }

  const sampleButtons: { type: ReviewType; label: string; aria: string }[] = [
    { type: "bugs", label: t("form.samples.bugs"), aria: t("form.samples.bugsAria") },
    { type: "security", label: t("form.samples.security"), aria: t("form.samples.securityAria") },
    {
      type: "architecture",
      label: t("form.samples.architecture"),
      aria: t("form.samples.architectureAria"),
    },
  ];

  const pulseActive = shouldPulse && !isPending;

  return (
    <div>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {sampleButtons.map(({ type, label, aria }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleLoadExample(type)}
                  disabled={isPending}
                  aria-label={aria}
                  className="rounded-md border border-zinc-200 bg-transparent px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:border-teal-400/60 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-teal-500/50 dark:hover:text-teal-400 dark:disabled:opacity-30"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleCopyCode}
                disabled={!code}
                aria-label={copiedCode ? t("form.codeCopied") : t("form.copyCode")}
                title={copiedCode ? t("form.codeCopied") : t("form.copyCode")}
                className={`${ICON_BTN} text-zinc-400 hover:border-teal-400/60 hover:text-teal-700 dark:text-zinc-500 dark:hover:border-teal-500/50 dark:hover:text-teal-400`}
              >
                {copiedCode ? (
                  <Check
                    className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={handleClearCode}
                disabled={!code || isPending}
                aria-label={t("form.clearCode")}
                title={t("form.clearCode")}
                className={`${ICON_BTN} text-zinc-400 hover:border-zinc-400/60 hover:text-zinc-600 dark:text-zinc-500 dark:hover:border-zinc-500 dark:hover:text-zinc-300`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <CodeEditor
            value={code}
            onChange={setCode}
            theme={theme}
            placeholder={t("form.codePlaceholder")}
            maxLength={MAX_CODE_LENGTH}
            readOnly={isPending}
            ariaLabel={t("form.codeLabel")}
          />
          <p className={`mt-1.5 text-xs ${charCountColor}`}>
            {t("form.charCount", { current: codeLength, max: MAX_CODE_LENGTH })}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="language"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t("form.languageLabel")}
            </label>
            <input
              id="language"
              name="language"
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isPending}
              placeholder={t("form.languagePlaceholder")}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="reviewType"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {t("form.reviewTypeLabel")}
            </label>
            <select
              id="reviewType"
              name="reviewType"
              value={reviewType}
              disabled={isPending}
              onChange={(e) => setReviewType(e.target.value as ReviewType)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-400/20 disabled:cursor-not-allowed disabled:opacity-50"
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
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.errorCode === "validation"
              ? t("error.validation")
              : state.errorCode === "rate-limit"
                ? t("error.rateLimit")
                : state.errorCode === "provider-busy"
                  ? t("error.providerBusy")
                  : state.errorCode === "provider-timeout"
                    ? t("error.providerTimeout")
                    : state.errorCode === "provider-unavailable"
                      ? t("error.providerUnavailable")
                      : t("error.generic")}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {/* data-pulse-active drives the animation via a CSS attribute selector,
              avoiding Tailwind class-sorter interference with conditional class strings. */}
          <button
            ref={submitRef}
            type="submit"
            disabled={isPending}
            data-pulse-active={pulseActive ? "true" : undefined}
            className="flex w-fit items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:opacity-50"
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
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{t("form.trustNotice")}</p>
        </div>
      </form>

      {state.status === "success" && state.result && (
        <div ref={resultRef} className="scroll-mt-8">
          {isAuthenticated && !state.saved && (
            <p
              role="status"
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
            >
              {t("notSaved", { max: maxSavedReviews })}
            </p>
          )}
          <ReviewResult result={state.result} />
          {!isAuthenticated && (
            <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">{t("form.saveHint")}</p>
          )}
        </div>
      )}

      {showLimitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={() => setShowLimitModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t("limitModal.title")}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {t("limitModal.description", { current: savedCount, max: maxSavedReviews })}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                onClick={() => setShowLimitModal(false)}
              >
                {t("limitModal.goToDashboard")}
              </Link>
              <button
                type="button"
                onClick={handleContinueWithoutSaving}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {t("limitModal.continueWithoutSaving")}
              </button>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                {t("limitModal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showClearModal}
        title={t("clearModal.title")}
        description={t("clearModal.description")}
        confirmLabel={t("clearModal.confirm")}
        cancelLabel={t("clearModal.cancel")}
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
}
