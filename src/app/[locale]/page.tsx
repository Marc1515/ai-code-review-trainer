import { getTranslations } from "next-intl/server";
import { KeyRound, ShieldCheck, Server, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { ReviewPreview } from "@/modules/home/ui/review-preview";
import { AnimatedDotBackground } from "@/shared/ui/animated-dot-background";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-12 px-6 py-16 md:flex-row md:items-center md:gap-16 md:py-24 lg:px-8">
        <AnimatedDotBackground />
        {/* Left: copy */}
        <div className="relative flex flex-col items-start gap-6 md:flex-1">
          {/* Eyebrow */}
          <span className="inline-flex items-center rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            {t("eyebrow")}
          </span>

          {/* Headline */}
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="block text-zinc-900 dark:text-zinc-50">{t("headlineMain")}</span>
            <span className="text-brand-accent">{t("headlineAccent")}</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-sm text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/review"
              className="rounded-full bg-zinc-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t("cta")}
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              {t("ctaSecondary")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Trust micro-copy */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
            <span>✓ {t("trust.noKey")}</span>
            <span>✓ {t("trust.noExec")}</span>
            <span>✓ {t("trust.local")}</span>
          </div>
        </div>

        {/* Right: product preview */}
        <div className="relative w-full md:flex-1">
          <ReviewPreview localAiLabel={t("features.local.title")} />
        </div>
      </section>

      {/* Features strip */}
      <section className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <div className="flex flex-col gap-2 py-8 sm:py-10 sm:pr-8">
              <KeyRound className="h-4 w-4 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("features.noKey.title")}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t("features.noKey.description")}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-zinc-100 py-8 sm:border-t-0 sm:border-l sm:px-8 sm:py-10 dark:border-zinc-800">
              <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("features.private.title")}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t("features.private.description")}
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-zinc-100 py-8 sm:border-t-0 sm:border-l sm:py-10 sm:pl-8 dark:border-zinc-800">
              <Server className="h-4 w-4 text-teal-600 dark:text-teal-400" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("features.local.title")}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {t("features.local.description")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
