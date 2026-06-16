"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/lib/utils";
import type { FindingSeverity, ReviewResult, ReviewType } from "@/modules/reviews/domain/types";

const SEVERITY_STYLES: Record<FindingSeverity, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-700",
  minor: "border-yellow-200 bg-yellow-50 text-yellow-700",
  major: "border-orange-200 bg-orange-50 text-orange-700",
  critical: "border-red-200 bg-red-50 text-red-700",
};

export function ReviewResult({ result }: { result: ReviewResult }) {
  const t = useTranslations("review");
  const tResult = useTranslations("review.result");

  const severityLabels: Record<FindingSeverity, string> = {
    info: tResult("severity.info"),
    minor: tResult("severity.minor"),
    major: tResult("severity.major"),
    critical: tResult("severity.critical"),
  };

  const typeLabels: Record<ReviewType, string> = {
    general: t("types.general"),
    "clean-code": t("types.cleanCode"),
    bugs: t("types.bugs"),
    security: t("types.security"),
    performance: t("types.performance"),
    architecture: t("types.architecture"),
    testing: t("types.testing"),
  };

  return (
    <div className="mt-10 space-y-8">
      <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
        {tResult("reviewedAs", { type: typeLabels[result.reviewType] })}
      </p>

      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          {tResult("summary")}
        </h2>
        <p className="text-zinc-800">{result.summary}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
          {tResult("findings")}
        </h2>
        {result.findings.length === 0 ? (
          <p className="text-zinc-500">{tResult("noFindings")}</p>
        ) : (
          <ul className="space-y-4">
            {result.findings.map((finding, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 bg-white p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <span className="font-medium text-zinc-900">{finding.title}</span>
                  <span
                    className={cn(
                      "inline-block shrink-0 rounded border px-2 py-0.5 text-xs font-medium",
                      SEVERITY_STYLES[finding.severity],
                    )}
                  >
                    {severityLabels[finding.severity]}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-zinc-600">{finding.explanation}</p>

                {finding.suggestion && (
                  <p className="mt-3 text-sm text-zinc-500">
                    <span className="font-medium text-zinc-700">{tResult("suggestion")}: </span>
                    {finding.suggestion}
                  </p>
                )}

                {finding.line !== undefined && (
                  <p className="mt-2 text-xs text-zinc-400">
                    {tResult("line")} {finding.line}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
