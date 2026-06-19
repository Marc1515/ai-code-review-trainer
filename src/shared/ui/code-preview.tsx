"use client";

import dynamic from "next/dynamic";
import { useEditorTheme } from "@/shared/hooks/use-editor-theme";

const CodeEditor = dynamic(
  () => import("@/modules/reviews/ui/code-editor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
    ),
  },
);

interface Props {
  value: string;
  minHeight?: string;
  ariaLabel?: string;
}

export function CodePreview({ value, minHeight = "160px", ariaLabel }: Props) {
  const { theme } = useEditorTheme();
  return (
    <CodeEditor value={value} theme={theme} minHeight={minHeight} readOnly ariaLabel={ariaLabel} />
  );
}
