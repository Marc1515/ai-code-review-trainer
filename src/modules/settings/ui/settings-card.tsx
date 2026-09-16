import type { ReactNode } from "react";

interface SettingsCardProps {
  children: ReactNode;
  helper: ReactNode;
}

export function SettingsCard({ children, helper }: SettingsCardProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-0">
        <div className="min-w-0 lg:col-span-2 lg:pr-8">{children}</div>
        <aside className="min-w-0 border-t border-zinc-200 pt-5 text-sm text-zinc-500 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-zinc-700 dark:text-zinc-400">
          {helper}
        </aside>
      </div>
    </section>
  );
}
