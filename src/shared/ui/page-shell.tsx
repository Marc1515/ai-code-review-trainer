export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 lg:px-8">{children}</main>
    </div>
  );
}
