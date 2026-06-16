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
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <img
            src="/ai-code-review-trainer-icon.svg"
            alt=""
            aria-hidden
            className="size-7 shrink-0"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/review"
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {t("reviewerAi")}
          </Link>
          <Link
            href="/settings"
            className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
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
