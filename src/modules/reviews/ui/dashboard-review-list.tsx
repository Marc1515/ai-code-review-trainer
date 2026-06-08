import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { REVIEW_TYPES, type ReviewType } from "@/modules/reviews/domain/types";
import type { ReviewSummary } from "@/modules/reviews/infrastructure/db/review-repository";

interface Props {
  reviews: ReviewSummary[];
}

export function DashboardReviewList({ reviews }: Props) {
  const t = useTranslations("dashboard");
  const tReview = useTranslations("review");

  const typeLabels: Record<ReviewType, string> = {
    general: tReview("types.general"),
    "clean-code": tReview("types.cleanCode"),
    bugs: tReview("types.bugs"),
    security: tReview("types.security"),
    performance: tReview("types.performance"),
    architecture: tReview("types.architecture"),
    testing: tReview("types.testing"),
  };

  const localizedType = (raw: string): string =>
    REVIEW_TYPES.includes(raw as ReviewType) ? typeLabels[raw as ReviewType] : raw;

  if (reviews.length === 0) {
    return <p className="text-sm text-zinc-500">{t("empty")}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
      {reviews.map((review) => (
        <li key={review.id} className="transition-colors hover:bg-zinc-50">
          <Link href={`/dashboard/reviews/${review.id}`} className="flex flex-col gap-1 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                {localizedType(review.reviewType)}
              </span>
              {review.language && <span className="text-xs text-zinc-500">{review.language}</span>}
              <span className="ml-auto text-xs text-zinc-400">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-zinc-700">{review.summary}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
