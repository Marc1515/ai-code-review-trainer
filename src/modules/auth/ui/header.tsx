import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";

import { UserDropdown } from "./user-dropdown";

export async function AuthHeader() {
  const t = await getTranslations("auth");
  const tSettings = await getTranslations("settings");

  let session = null;
  try {
    session = await auth();
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; render unauthenticated state.
  }

  const firstName =
    session?.user?.name?.split(" ")[0] ?? session?.user?.email?.split("@")[0] ?? "—";

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          <Image
            src="/ai-code-review-trainer-icon.svg"
            alt=""
            aria-hidden
            width={28}
            height={28}
            className="shrink-0 dark:hidden"
          />
          <Image
            src="/ai-code-review-trainer-icon-dark.svg"
            alt=""
            aria-hidden
            width={28}
            height={28}
            className="hidden shrink-0 dark:block"
          />
          <span className="text-brand-accent hidden sm:inline">AI Code Review Trainer</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/review"
            className="inline-flex items-center rounded border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-950"
          >
            {t("reviewerAi")}
          </Link>
          <Link
            href="/settings"
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {tSettings("navLink")}
          </Link>
          {session?.user ? (
            <UserDropdown
              isAuthenticated
              displayName={firstName}
              greetingText={t("greeting", { name: firstName })}
              myReviewsLabel={t("myReviews")}
              signOutLabel={t("signOut")}
            />
          ) : (
            <UserDropdown isAuthenticated={false} signInLabel={t("signIn")} />
          )}
        </div>
      </div>
    </header>
  );
}
