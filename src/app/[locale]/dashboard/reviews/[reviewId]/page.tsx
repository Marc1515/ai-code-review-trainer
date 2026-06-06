import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getReviewByIdAndUser } from "@/modules/reviews/infrastructure/db/review-repository";
import { ReviewResult } from "@/modules/reviews/ui/review-result";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = await params;
  const t = await getTranslations("reviewDetail");

  let session = null;
  try {
    session = await auth();
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured.
  }

  if (!session?.user?.id) {
    return (
      <div className="flex flex-1 flex-col bg-zinc-50">
        <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
          <p className="text-zinc-600">{t("notFound")}</p>
        </main>
      </div>
    );
  }

  const review = await getReviewByIdAndUser(reviewId, session.user.id);

  if (!review) {
    notFound();
  }

  const result = {
    reviewType: review.reviewType as import("@/modules/reviews/domain/types").ReviewType,
    summary: review.summary,
    findings: review.findings,
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
        <Link
          href="/dashboard"
          className="mb-8 inline-block text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          ← {t("back")}
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
            {review.reviewType}
          </span>
          {review.language && <span className="text-xs text-zinc-500">{review.language}</span>}
          <span className="text-xs text-zinc-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>

        <section className="mb-10">
          <h2 className="mb-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
            {t("submittedCode")}
          </h2>
          <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-800">
            {review.code}
          </pre>
        </section>

        <ReviewResult result={result} />
      </main>
    </div>
  );
}
