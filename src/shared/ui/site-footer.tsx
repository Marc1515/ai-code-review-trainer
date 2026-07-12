import { getTranslations } from "next-intl/server";
import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

const GITHUB_REPOSITORY_URL = "https://github.com/Marc1515/ai-code-review-trainer";
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/marc-espa%C3%B1a-833924141/";
const GITHUB_PROFILE_URL = "https://github.com/Marc1515";
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/marc_espp/";

const socialLinkClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:text-zinc-400 dark:hover:bg-teal-950/60 dark:hover:text-teal-300";

function GithubIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5a12 12 0 0 0-3.794 23.385c.6.111.819-.26.819-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.808 1.304 3.492.997.108-.775.419-1.304.762-1.603-2.665-.303-5.467-1.333-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.523.117-3.176 0 0 1.008-.323 3.3 1.23A11.47 11.47 0 0 1 12 6.499c1.02.005 2.047.138 3.007.404 2.29-1.553 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.625-5.479 5.921.43.371.814 1.102.814 2.222v3.293c0 .32.216.694.825.576A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.452 20.452h-3.554v-5.568c0-1.328-.027-3.037-1.852-3.037-1.854 0-2.137 1.446-2.137 2.939v5.666H9.355V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
    </svg>
  );
}

function InstagramIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="4.75" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-auto border-t border-zinc-200 bg-zinc-100/[0.98] dark:border-zinc-800 dark:bg-zinc-900/[0.95]">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
        <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between md:gap-12">
          <div className="max-w-sm">
            <span aria-hidden className="mb-3 block h-px w-8 bg-teal-500 dark:bg-teal-400" />
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              AI Code Review Trainer
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {t("description")}
            </p>
          </div>

          <nav
            aria-label={t("navigationLabel")}
            className="flex flex-wrap gap-x-5 gap-y-3 md:justify-end"
          >
            <Link
              href="/review"
              className="text-sm text-zinc-600 transition-colors hover:text-teal-700 dark:text-zinc-400 dark:hover:text-teal-300"
            >
              {t("links.reviewer")}
            </Link>
            <Link
              href="/faqs"
              className="text-sm text-zinc-600 transition-colors hover:text-teal-700 dark:text-zinc-400 dark:hover:text-teal-300"
            >
              {t("links.faqs")}
            </Link>
            <Link
              href="/settings"
              className="text-sm text-zinc-600 transition-colors hover:text-teal-700 dark:text-zinc-400 dark:hover:text-teal-300"
            >
              {t("links.settings")}
            </Link>
            <a
              href={GITHUB_REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-zinc-600 transition-colors hover:text-teal-700 dark:text-zinc-400 dark:hover:text-teal-300"
            >
              {t("links.repository")}
            </a>
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-zinc-200 pt-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:text-zinc-500">
          <p>{t("copyright", { year })}</p>
          <nav aria-label={t("socialsLabel")} className="flex items-center gap-1">
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t("socials.linkedin")}
              className={socialLinkClassName}
            >
              <LinkedinIcon className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t("socials.github")}
              className={socialLinkClassName}
            >
              <GithubIcon className="h-4 w-4" aria-hidden />
            </a>
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={t("socials.instagram")}
              className={socialLinkClassName}
            >
              <InstagramIcon className="h-4 w-4" aria-hidden />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
