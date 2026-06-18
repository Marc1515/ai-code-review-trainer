const CODE_LINES: { n: number; text: string; bug?: true }[] = [
  { n: 1, text: "function getTotal(items) {" },
  { n: 2, text: "  let sum = 0;" },
  { n: 3, text: "  for (let i = 0; i <= items.length; i++) {", bug: true },
  { n: 4, text: "    sum += items[i].price;" },
  { n: 5, text: "  }" },
  { n: 6, text: "  return sum;" },
  { n: 7, text: "}" },
];

const FINDINGS: {
  severity: "critical" | "major" | "info";
  title: string;
  explanation: string;
  line?: number;
}[] = [
  {
    severity: "critical",
    title: "Off-by-one in loop bound",
    explanation: "<= items.length reads past the array. The last iteration accesses undefined.",
    line: 3,
  },
  {
    severity: "major",
    title: "Unsafe property access",
    explanation:
      "items[i].price throws if any item is missing the price field. Validate inputs first.",
  },
  {
    severity: "info",
    title: "Prefer Array.reduce",
    explanation: "items.reduce((s, x) => s + x.price, 0) expresses the intent more clearly.",
  },
];

const SEVERITY_BADGE: Record<"critical" | "major" | "info", string> = {
  critical:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-950/60 dark:text-red-400",
  major:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/60 dark:text-orange-400",
  info: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/60 dark:text-blue-400",
};

const SEVERITY_LABEL: Record<"critical" | "major" | "info", string> = {
  critical: "Critical",
  major: "Major",
  info: "Info",
};

export function ReviewPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
            getTotal.js
          </span>
          <span className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/60 dark:text-orange-400">
            Bugs
          </span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-teal-600 dark:text-teal-400">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500"
          />
          IA local
        </span>
      </div>

      {/* Code block */}
      <div className="overflow-x-auto bg-zinc-950 py-3">
        {CODE_LINES.map(({ n, text, bug }) => (
          <div key={n} className={`flex gap-4 px-4 py-0.5${bug ? "bg-red-500/10" : ""}`}>
            <span className="w-3.5 shrink-0 text-right font-mono text-[11px] leading-5 text-zinc-600 select-none">
              {n}
            </span>
            <code className="font-mono text-[11px] leading-5 whitespace-pre text-zinc-300">
              {text}
            </code>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p className="text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">
          Two logic errors found. The loop reads past the end of the array.
        </p>
      </div>

      {/* Findings */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {FINDINGS.map((f, i) => (
          <div key={i} className="px-4 py-3">
            <div className="mb-1.5 flex items-start justify-between gap-3">
              <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200">
                {f.title}
              </span>
              <span
                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${SEVERITY_BADGE[f.severity]}`}
              >
                {SEVERITY_LABEL[f.severity]}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {f.explanation}
            </p>
            {f.line !== undefined && (
              <span className="mt-1 block text-[10px] text-zinc-400 dark:text-zinc-600">
                Line {f.line}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
