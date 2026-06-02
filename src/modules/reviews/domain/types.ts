/**
 * Reviews domain types — framework-free.
 *
 * These describe the core concepts of a code review independently of any
 * transport (HTTP/Server Action), persistence (Prisma) or AI provider.
 * Phase 0 skeleton: shapes are defined here; behaviour lives in use-cases.
 */

/** The kinds of review a user can request. */
export const REVIEW_TYPES = [
  "general",
  "clean-code",
  "bugs",
  "security",
  "performance",
  "architecture",
  "testing",
] as const;

export type ReviewType = (typeof REVIEW_TYPES)[number];

/** Severity of an individual finding. */
export type FindingSeverity = "info" | "minor" | "major" | "critical";

/** A single issue or suggestion surfaced by the reviewer. */
export interface Finding {
  title: string;
  severity: FindingSeverity;
  /** Mentor-style explanation of why this matters. */
  explanation: string;
  /** Optional concrete suggestion or improved snippet. */
  suggestion?: string;
  /** Optional 1-based line reference into the submitted code. */
  line?: number;
}

/** The structured result returned for a review request. */
export interface ReviewResult {
  reviewType: ReviewType;
  summary: string;
  findings: Finding[];
}

/** The validated input a use-case needs to run a review. */
export interface ReviewInput {
  code: string;
  language?: string;
  reviewType: ReviewType;
}
