import {
  ArrowRight,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  ClipboardPaste,
  Code2,
  Database,
  Gauge,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Network,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/lib/utils";

export type HomeStep = {
  title: string;
  description: string;
};

export type ReviewTypeCard = {
  key: "general" | "cleanCode" | "bugs" | "security" | "performance" | "architecture" | "testing";
  title: string;
  description: string;
};

export type HomeInfoItem = {
  title: string;
  description: string;
};

const STEP_ICONS: LucideIcon[] = [ClipboardPaste, SlidersHorizontal, GraduationCap];

const REVIEW_TYPE_ICONS: Record<ReviewTypeCard["key"], LucideIcon> = {
  general: Sparkles,
  cleanCode: Code2,
  bugs: Bug,
  security: ShieldCheck,
  performance: Gauge,
  architecture: Network,
  testing: TestTube2,
};

const LEARNING_ICONS: LucideIcon[] = [BookOpenCheck, CheckCircle2, Sparkles];
const SECURITY_ICONS: LucideIcon[] = [LockKeyhole, ShieldCheck, Database, KeyRound];

export function HowItWorksSection({
  eyebrow,
  title,
  description,
  steps,
}: {
  eyebrow: string;
  title: string;
  description: string;
  steps: HomeStep[];
}) {
  return (
    <section className="relative z-20 bg-zinc-50 py-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? ClipboardPaste;

            return (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/[0.95] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/[0.95] dark:hover:border-teal-700"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                    0{index + 1}
                  </span>
                  <span className="rounded-xl border border-teal-200 bg-teal-50 p-2 text-teal-700 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300">
                    <Icon className="h-4 w-4" strokeWidth={1.6} />
                  </span>
                </div>

                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ReviewTypesSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ReviewTypeCard[];
}) {
  return (
    <section className="relative z-20 bg-white py-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="rounded-3xl border border-zinc-200 bg-white/[0.95] p-6 shadow-sm sm:p-8 lg:grid lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-10 lg:p-10 dark:border-zinc-800 dark:bg-zinc-900/[0.95]">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-0">
            {items.map((item) => {
              const Icon = REVIEW_TYPE_ICONS[item.key];

              return (
                <article
                  key={item.key}
                  className={cn(
                    "rounded-2xl border border-zinc-200 bg-zinc-50/[0.95] p-5 transition hover:border-teal-300 hover:bg-teal-50/[0.95] dark:border-zinc-800 dark:bg-zinc-900/[0.95] dark:hover:border-teal-800 dark:hover:bg-zinc-800/[0.95]",
                    item.key === "general" && "sm:col-span-2",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-lg border border-zinc-200 bg-white p-2 text-teal-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-teal-300">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LearningFeedbackSection({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: HomeInfoItem[];
}) {
  return (
    <section className="relative z-20 bg-zinc-50 py-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/[0.95] shadow-sm dark:border-zinc-800 dark:bg-zinc-900/[0.95]">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-zinc-100 p-8 sm:p-10 lg:border-r lg:border-b-0 dark:border-zinc-800">
              <p className="font-mono text-xs tracking-[0.24em] text-teal-600 uppercase dark:text-teal-400">
                {eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((item, index) => {
                const Icon = LEARNING_ICONS[index] ?? BookOpenCheck;

                return (
                  <article key={item.title} className="flex gap-4 p-6 sm:p-8">
                    <span className="h-fit rounded-xl border border-teal-200 bg-teal-50 p-2 text-teal-700 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrivacySection({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: HomeInfoItem[];
}) {
  return (
    <section className="relative z-20 bg-zinc-950/85 py-20 text-white dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="font-mono text-xs tracking-[0.24em] text-teal-300 uppercase">{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => {
              const Icon = SECURITY_ICONS[index] ?? ShieldCheck;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/[0.95] p-5"
                >
                  <Icon className="h-5 w-5 text-teal-300" strokeWidth={1.6} />
                  <h3 className="mt-5 text-sm font-semibold text-zinc-100">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeFinalCta({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <section className="relative z-20 bg-zinc-50 px-6 pb-20 lg:px-8 dark:bg-transparent">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900/[0.95] p-8 text-white shadow-xl sm:p-10 dark:border-zinc-800">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.24em] text-teal-300 uppercase">{eyebrow}</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">{description}</p>
          </div>

          <Link
            href="/review"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-teal-100"
          >
            {cta}
            <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-[0.24em] text-teal-600 uppercase dark:text-teal-400">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}
