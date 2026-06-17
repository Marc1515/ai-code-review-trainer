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
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
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
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/review"
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
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
