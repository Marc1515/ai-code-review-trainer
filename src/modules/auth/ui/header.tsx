import { getTranslations } from "next-intl/server";

import { auth, signOut } from "@/auth";
import { Link } from "@/i18n/navigation";

export async function AuthHeader() {
  const t = await getTranslations("auth");

  let session = null;
  try {
    session = await auth();
  } catch {
    // AUTH_SECRET or DATABASE_URL not configured; render unauthenticated state.
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-8">
        <Link href="/" className="text-sm font-semibold text-zinc-900">
          AI Code Review Trainer
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <span className="text-sm text-zinc-600">
                {t("greeting", { name: session.user.name ?? session.user.email ?? "" })}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                >
                  {t("signOut")}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/api/auth/signin"
              className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
