import { getTranslations } from "next-intl/server";
import NextLink from "next/link";
import { auth } from "@/auth";
import { listReviewsByUser } from "@/modules/reviews/infrastructure/db/review-repository";
import { DashboardReviewList } from "@/modules/reviews/ui/dashboard-review-list";

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
      <div className="flex flex-1 flex-col bg-zinc-50">
        <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
          <p className="text-zinc-600">{t("signInPrompt")}</p>
          <NextLink
            href="/api/auth/signin"
            className="mt-4 inline-block text-sm text-zinc-900 underline underline-offset-2"
          >
            {t("signInLink")}
          </NextLink>
        </main>
      </div>
    );
  }

  const reviews = await listReviewsByUser(session.user.id);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-3xl flex-1 px-8 py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{t("title")}</h1>
          <p className="mt-2 text-zinc-600">{t("subtitle")}</p>
        </header>
        <DashboardReviewList reviews={reviews} />
      </main>
    </div>
  );
}
