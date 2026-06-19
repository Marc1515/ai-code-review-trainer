import { getTranslations } from "next-intl/server";
import NextLink from "next/link";

import { auth } from "@/auth";
import { MAX_SAVED_REVIEWS } from "@/modules/reviews/domain/constants";
import { listReviewsByUser } from "@/modules/reviews/infrastructure/db/review-repository";
import { DashboardReviewList } from "@/modules/reviews/ui/dashboard-review-list";
import { PageShell } from "@/shared/ui/page-shell";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  let session = null;
  try {
    session = await auth();
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured.
  }

  if (!session?.user?.id) {
    return (
      <PageShell>
        <p className="text-zinc-600 dark:text-zinc-400">{t("signInPrompt")}</p>
        <NextLink
          href="/api/auth/signin"
          className="mt-4 inline-block text-sm text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
        >
          {t("signInLink")}
        </NextLink>
      </PageShell>
    );
  }

  const reviews = await listReviewsByUser(session.user.id);

  return (
    <PageShell>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </header>
      <DashboardReviewList reviews={reviews} maxReviews={MAX_SAVED_REVIEWS} />
    </PageShell>
  );
}
