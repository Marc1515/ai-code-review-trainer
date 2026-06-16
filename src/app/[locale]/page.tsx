import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50">
      <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-8 py-24 text-center">
        <img
          src="/ai-code-review-trainer-icon.svg"
          alt=""
          aria-hidden
          className="size-20 shrink-0"
        />
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{t("title")}</h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600">{t("subtitle")}</p>
        <Link
          href="/review"
          className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          {t("cta")}
        </Link>
      </main>
    </div>
  );
}
