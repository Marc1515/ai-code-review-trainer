import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import { getReviewByIdAndUser } from "@/modules/reviews/infrastructure/db/review-repository";
import { ReviewResult } from "@/modules/reviews/ui/review-result";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;
  const t = await getTranslations("reviewDetail");
  const tReview = await getTranslations("review");

  let session = null;
  try {
    session = await auth();
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured.
  }

  if (!session?.user?.id) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
        <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
          <p className="text-zinc-600 dark:text-zinc-400">{t("notFound")}</p>
        </main>
      </div>
    );
  }

  const review = await getReviewByIdAndUser(reviewId, session.user.id);

  if (!review) {
    notFound();
  }

  const reviewType = review.reviewType as ReviewType;

  const typeLabels: Record<ReviewType, string> = {
    general: tReview("types.general"),
    "clean-code": tReview("types.cleanCode"),
    bugs: tReview("types.bugs"),
    security: tReview("types.security"),
    performance: tReview("types.performance"),
    architecture: tReview("types.architecture"),
    testing: tReview("types.testing"),
  };

  const localizedType = REVIEW_TYPES.includes(reviewType)
    ? typeLabels[reviewType]
    : review.reviewType;

  const result = {
    reviewType,
    summary: review.summary,
    findings: review.findings,
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
        <Link
          href="/dashboard"
          className="mb-8 inline-block text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← {t("back")}
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
            {localizedType}
          </span>
          {review.language && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{review.language}</span>
          )}
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>

        <section className="mb-10">
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
            {t("submittedCode")}
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {review.code}
          </pre>
        </section>

        <ReviewResult result={result} />
      </main>
    </div>
  );
}
