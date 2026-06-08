import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { ReviewForm } from "@/modules/reviews/ui/review-form";

export default async function ReviewPage() {
  const t = await getTranslations("review.page");

  let isAuthenticated = false;
  try {
    const session = await auth();
    isAuthenticated = !!session?.user?.id;
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; treat as anonymous.
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{t("title")}</h1>
          <p className="mt-2 text-zinc-600">{t("subtitle")}</p>
        </header>
        <ReviewForm isAuthenticated={isAuthenticated} />
      </main>
    </div>
  );
}
