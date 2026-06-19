import { getTranslations } from "next-intl/server";
import { KeyRound, Server } from "lucide-react";

import { auth } from "@/auth";
import { MAX_SAVED_REVIEWS } from "@/modules/reviews/domain/constants";
import { countByUserId } from "@/modules/reviews/infrastructure/db/review-repository";
import { ReviewForm } from "@/modules/reviews/ui/review-form";
import { EditorThemeBadge } from "@/shared/ui/editor-theme-badge";
import { PageShell } from "@/shared/ui/page-shell";

export default async function ReviewPage() {
  const t = await getTranslations("review.page");

  let isAuthenticated = false;
  let savedCount = 0;
  try {
    const session = await auth();
    if (session?.user?.id) {
      isAuthenticated = true;
      savedCount = await countByUserId(session.user.id);
    }
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; treat as anonymous.
  }

  return (
    <PageShell>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <Server className="h-3 w-3" aria-hidden />
            {t("trust.local")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            <KeyRound className="h-3 w-3" aria-hidden />
            {t("trust.noKey")}
          </span>
          <EditorThemeBadge />
        </div>
      </header>
      <ReviewForm
        isAuthenticated={isAuthenticated}
        savedCount={savedCount}
        maxSavedReviews={MAX_SAVED_REVIEWS}
      />
    </PageShell>
  );
}
