import { getTranslations } from "next-intl/server";
import NextLink from "next/link";

import { auth } from "@/auth";
import { MAX_SAVED_REVIEWS, REVIEWS_PER_PAGE } from "@/modules/reviews/domain/constants";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import { listReviewsByUser } from "@/modules/reviews/infrastructure/db/review-repository";
import { DashboardReviewList } from "@/modules/reviews/ui/dashboard-review-list";
import { PageShell } from "@/shared/ui/page-shell";

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string | string[];
    type?: string | string[];
  }>;
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseReviewType(value: string | undefined): ReviewType | undefined {
  return REVIEW_TYPES.includes(value as ReviewType) ? (value as ReviewType) : undefined;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const t = await getTranslations("dashboard");
  const query = await searchParams;
  const requestedPage = parsePage(firstSearchParam(query.page));
  const reviewType = parseReviewType(firstSearchParam(query.type));

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

  const result = await listReviewsByUser(session.user.id, {
    page: requestedPage,
    pageSize: REVIEWS_PER_PAGE,
    reviewType,
  });

  return (
    <PageShell>
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      </header>
      <DashboardReviewList
        reviews={result.reviews}
        totalReviews={result.totalReviews}
        filteredReviews={result.filteredReviews}
        maxReviews={MAX_SAVED_REVIEWS}
        currentPage={result.page}
        totalPages={result.totalPages}
        activeFilter={reviewType ?? "all"}
      />
    </PageShell>
  );
}
