import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-8 py-24 text-center">
        <Image
          src="/ai-code-review-trainer-icon.svg"
          alt=""
          aria-hidden
          width={80}
          height={80}
          className="shrink-0 dark:hidden"
        />
        <Image
          src="/ai-code-review-trainer-icon-dark.svg"
          alt=""
          aria-hidden
          width={80}
          height={80}
          className="hidden shrink-0 dark:block"
        />
        <h1 className="text-4xl font-semibold tracking-tight">
          <span className="text-brand-navy dark:text-blue-300">AI Code Review </span>
          <span className="text-brand-accent">Trainer</span>
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <Link
          href="/review"
          className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {t("cta")}
        </Link>
      </main>
    </div>
  );
}
