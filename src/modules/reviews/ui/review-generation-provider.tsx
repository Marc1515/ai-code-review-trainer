"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import type { ReviewResult } from "@/modules/reviews/domain/types";
import { reviewAction, type ReviewActionState } from "@/server/actions/review.action";
import { useToast } from "@/shared/hooks/use-toast";

const STORAGE_KEY = "ai-code-review-trainer-review-generation";
const REVIEW_TOAST_ID = "ai-code-review-trainer-review-generation-toast";

type ReviewErrorCode = Extract<ReviewActionState, { status: "error" }>["code"];

type ReviewGenerationStatus = "idle" | "pending" | "success" | "error";

interface ReviewGenerationState {
  status: ReviewGenerationStatus;
  code: string;
  language: string;
  reviewType: ReviewType;
  result?: ReviewResult;
  saved?: boolean;
  errorCode?: ReviewErrorCode;
  requestId?: string;
}

interface ReviewGenerationContextValue {
  state: ReviewGenerationState;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setReviewType: (reviewType: ReviewType) => void;
  submitReview: (options?: { skipSave?: boolean }) => void;
  clearDraft: () => void;
}

const initialState: ReviewGenerationState = {
  status: "idle",
  code: "",
  language: "",
  reviewType: "general",
};

const ReviewGenerationContext = createContext<ReviewGenerationContextValue | null>(null);

type ReviewGenerationListener = (state: ReviewGenerationState) => void;

const listeners = new Set<ReviewGenerationListener>();
const dismissedToastKeys = new Set<string>();
let storeState: ReviewGenerationState = initialState;
let storeLoaded = false;
let activeReviewPromise: Promise<void> | null = null;

function isReviewType(value: unknown): value is ReviewType {
  return typeof value === "string" && (REVIEW_TYPES as readonly string[]).includes(value);
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toFormData(state: ReviewGenerationState, skipSave: boolean): FormData {
  const formData = new FormData();
  formData.set("code", state.code);
  formData.set("reviewType", state.reviewType);
  if (state.language.trim()) formData.set("language", state.language.trim());
  if (skipSave) formData.set("skipSave", "true");
  return formData;
}

function restoreStoredState(): ReviewGenerationState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ReviewGenerationState>;
    if (!isReviewType(parsed.reviewType)) return null;

    // A browser request cannot survive a fully closed tab. If a previous tab
    // closed while pending, restore the draft instead of showing a stale spinner.
    const status =
      parsed.status === "success" || parsed.status === "error" ? parsed.status : "idle";

    return {
      status,
      code: typeof parsed.code === "string" ? parsed.code : "",
      language: typeof parsed.language === "string" ? parsed.language : "",
      reviewType: parsed.reviewType,
      result: status === "success" ? parsed.result : undefined,
      saved: status === "success" ? parsed.saved : undefined,
      errorCode: status === "error" ? parsed.errorCode : undefined,
      requestId: typeof parsed.requestId === "string" ? parsed.requestId : undefined,
    };
  } catch {
    return null;
  }
}

function persistState(state: ReviewGenerationState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        status: state.status,
        code: state.code,
        language: state.language,
        reviewType: state.reviewType,
        result: state.status === "success" ? state.result : undefined,
        saved: state.status === "success" ? state.saved : undefined,
        errorCode: state.status === "error" ? state.errorCode : undefined,
        requestId: state.requestId,
      }),
    );
  } catch {
    // localStorage unavailable — the module store still keeps SPA navigation safe.
  }
}

function ensureStoreLoaded() {
  if (storeLoaded) return;
  storeLoaded = true;
  storeState = restoreStoredState() ?? initialState;
}

function getStoreState(): ReviewGenerationState {
  ensureStoreLoaded();
  return storeState;
}

function setStoreState(
  nextState: ReviewGenerationState | ((current: ReviewGenerationState) => ReviewGenerationState),
) {
  ensureStoreLoaded();
  storeState = typeof nextState === "function" ? nextState(storeState) : nextState;
  persistState(storeState);
  listeners.forEach((listener) => listener(storeState));
}

function subscribeToReviewGeneration(listener: ReviewGenerationListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function updateDraft(patch: Partial<ReviewGenerationState>) {
  setStoreState((current) => {
    if (current.status === "pending") return current;
    return {
      ...current,
      ...patch,
      status: "idle",
      result: undefined,
      saved: undefined,
      errorCode: undefined,
      requestId: undefined,
    };
  });
}

function submitReviewGeneration(options: { skipSave?: boolean } = {}) {
  const current = getStoreState();
  const code = current.code.trim();
  if (!code || current.status === "pending" || activeReviewPromise) return;

  const requestId = createRequestId();
  const pendingState: ReviewGenerationState = {
    ...current,
    status: "pending",
    result: undefined,
    saved: undefined,
    errorCode: undefined,
    requestId,
  };

  setStoreState(pendingState);

  activeReviewPromise = reviewAction(
    { status: "idle" },
    toFormData(pendingState, options.skipSave ?? false),
  )
    .then((result) => {
      if (result.status === "success") {
        setStoreState((latest) => {
          if (latest.requestId !== requestId) return latest;
          return {
            ...pendingState,
            status: "success",
            result: result.result,
            saved: result.saved,
            requestId,
          };
        });
        return;
      }

      const errorCode = result.status === "error" ? result.code : "provider";

      setStoreState((latest) => {
        if (latest.requestId !== requestId) return latest;
        return {
          ...pendingState,
          status: "error",
          errorCode,
          requestId,
        };
      });
    })
    .catch(() => {
      setStoreState((latest) => {
        if (latest.requestId !== requestId) return latest;
        return {
          ...pendingState,
          status: "error",
          errorCode: "provider",
          requestId,
        };
      });
    })
    .finally(() => {
      activeReviewPromise = null;
    });
}

export function ReviewGenerationProvider({ children }: { children: ReactNode }) {
  const tToast = useTranslations("toast");
  const tReview = useTranslations("review");
  const router = useRouter();
  const { showToast } = useToast();
  const [state, setState] = useState(getStoreState);
  const lastToastKeyRef = useRef<string | null>(null);
  const previousStatusRef = useRef<ReviewGenerationStatus>(state.status);

  useEffect(() => subscribeToReviewGeneration(setState), []);

  const setCode = useCallback((code: string) => updateDraft({ code }), []);

  const setLanguage = useCallback((language: string) => updateDraft({ language }), []);

  const setReviewType = useCallback((reviewType: ReviewType) => updateDraft({ reviewType }), []);

  const submitReview = useCallback((options: { skipSave?: boolean } = {}) => {
    submitReviewGeneration(options);
  }, []);

  const clearDraft = useCallback(() => {
    const current = getStoreState();
    setStoreState({
      ...initialState,
      reviewType: current.reviewType,
    });
  }, []);

  const goToReview = useCallback(() => {
    router.push("/review");
  }, [router]);

  const getErrorMessage = useCallback(
    (code: ReviewErrorCode | undefined) => {
      if (code === "validation") return tReview("error.validation");
      if (code === "rate-limit") return tReview("error.rateLimit");
      if (code === "provider-busy") return tReview("error.providerBusy");
      if (code === "provider-timeout") return tReview("error.providerTimeout");
      if (code === "provider-unavailable") return tReview("error.providerUnavailable");
      return tReview("error.generic");
    },
    [tReview],
  );

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const justFinishedInCurrentRuntime = previousStatus === "pending" && state.status !== "pending";
    const requestKey = state.requestId ?? "restored";
    const showReviewToast = (
      key: string,
      message: string,
      variant: "success" | "info" | "error",
    ) => {
      if (dismissedToastKeys.has(key)) return;
      if (lastToastKeyRef.current === key) return;
      lastToastKeyRef.current = key;
      showToast(message, variant, {
        id: REVIEW_TOAST_ID,
        durationMs: null,
        onClick: goToReview,
        onDismiss: () => dismissedToastKeys.add(key),
      });
    };

    if (state.status === "pending") {
      const key = `pending:${requestKey}`;
      showReviewToast(key, tToast("reviewStarted"), "info");
      previousStatusRef.current = state.status;
      return;
    }

    if (state.status === "success") {
      const key = `success:${requestKey}`;
      showReviewToast(key, tToast("reviewCompleted"), "success");
      if (justFinishedInCurrentRuntime) router.refresh();
      previousStatusRef.current = state.status;
      return;
    }

    if (state.status === "error") {
      const key = `error:${requestKey}:${state.errorCode ?? "provider"}`;
      showReviewToast(key, getErrorMessage(state.errorCode), "error");
    }

    previousStatusRef.current = state.status;
  }, [getErrorMessage, goToReview, router, showToast, state, tToast]);

  const value = useMemo<ReviewGenerationContextValue>(
    () => ({
      state,
      setCode,
      setLanguage,
      setReviewType,
      submitReview,
      clearDraft,
    }),
    [clearDraft, setCode, setLanguage, setReviewType, state, submitReview],
  );

  return (
    <ReviewGenerationContext.Provider value={value}>{children}</ReviewGenerationContext.Provider>
  );
}

export function useReviewGeneration(): ReviewGenerationContextValue {
  const context = useContext(ReviewGenerationContext);
  if (!context) {
    throw new Error("useReviewGeneration must be used within ReviewGenerationProvider");
  }

  return context;
}
