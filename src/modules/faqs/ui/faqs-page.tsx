import { ArrowRight, HelpCircle, KeyRound, LockKeyhole, Server, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const FAQ_ITEM_KEYS = ["signIn", "savedCode", "apiKey", "execution", "docker"] as const;

const FAQ_ICONS = [HelpCircle, LockKeyhole, KeyRound, ShieldCheck, Server] as const;

type FaqItem = {
  question: string;
  answer: string;
};

export async function FaqsPage() {
  const t = await getTranslations("faqs");

  const faqItems: FaqItem[] = FAQ_ITEM_KEYS.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <section className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-[0.85fr_1.15fr] md:items-end lg:px-8">
          <div>
            <span className="inline-flex items-center rounded border border-teal-200 bg-teal-50 px-2 py-0.5 font-mono text-xs text-teal-700 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
              {t("eyebrow")}
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {t("title")}
            </h1>
          </div>

          <p className="max-w-xl text-sm leading-7 text-zinc-500 md:justify-self-end dark:text-zinc-400">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 lg:grid-cols-[1.4fr_0.6fr] lg:px-8">
          <div className="divide-y divide-zinc-100 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {faqItems.map((item, index) => {
              const Icon = FAQ_ICONS[index] ?? HelpCircle;

              return (
                <article
                  key={item.question}
                  className="grid gap-4 p-6 sm:grid-cols-[auto_1fr] sm:p-8"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300">
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.question}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                      {item.answer}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-3xl border border-zinc-200 bg-zinc-900 p-6 text-white shadow-sm dark:border-zinc-800">
            <p className="font-mono text-xs tracking-[0.24em] text-teal-300 uppercase">
              {t("cta.eyebrow")}
            </p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">{t("cta.title")}</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">{t("cta.description")}</p>
            <Link
              href="/review"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-teal-100"
            >
              {t("cta.link")}
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
