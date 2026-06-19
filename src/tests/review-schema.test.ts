import { describe, expect, it } from "vitest";

import {
  MAX_CODE_LENGTH,
  reviewInputSchema,
  reviewResultSchema,
} from "@/modules/reviews/schemas/review.schema";

// ---------------------------------------------------------------------------
// reviewResultSchema — Zod validation of AI provider output
// ---------------------------------------------------------------------------

const VALID_RESULT = {
  reviewType: "general",
  summary: "Code looks good overall.",
  findings: [
    {
      title: "Missing error handling",
      severity: "major",
      explanation: "Functions that perform I/O should handle errors explicitly.",
    },
  ],
};

describe("reviewResultSchema", () => {
  it("accepts a valid review result", () => {
    expect(reviewResultSchema.safeParse(VALID_RESULT).success).toBe(true);
  });

  it("accepts findings that include all optional fields", () => {
    const result = {
      ...VALID_RESULT,
      findings: [
        {
          title: "Title",
          severity: "info",
          explanation: "Explanation.",
          suggestion: "Suggestion.",
          line: 42,
        },
      ],
    };
    expect(reviewResultSchema.safeParse(result).success).toBe(true);
  });

  it("accepts an empty findings array", () => {
    expect(reviewResultSchema.safeParse({ ...VALID_RESULT, findings: [] }).success).toBe(true);
  });

  it("accepts all seven valid review types", () => {
    const types = [
      "general",
      "clean-code",
      "bugs",
      "security",
      "performance",
      "architecture",
      "testing",
    ];
    for (const reviewType of types) {
      expect(reviewResultSchema.safeParse({ ...VALID_RESULT, reviewType }).success).toBe(true);
    }
  });

  it("accepts all four valid severity values", () => {
    for (const severity of ["info", "minor", "major", "critical"]) {
      const result = {
        ...VALID_RESULT,
        findings: [{ ...VALID_RESULT.findings[0], severity }],
      };
      expect(reviewResultSchema.safeParse(result).success).toBe(true);
    }
  });

  it("rejects when summary is missing", () => {
    const { summary: _s, ...noSummary } = VALID_RESULT;
    expect(reviewResultSchema.safeParse(noSummary).success).toBe(false);
  });

  it("rejects when findings is missing", () => {
    const { findings: _f, ...noFindings } = VALID_RESULT;
    expect(reviewResultSchema.safeParse(noFindings).success).toBe(false);
  });

  it("rejects an unrecognised review type", () => {
    expect(
      reviewResultSchema.safeParse({ ...VALID_RESULT, reviewType: "invalid-type" }).success,
    ).toBe(false);
  });

  it("rejects a finding with an unrecognised severity", () => {
    const result = {
      ...VALID_RESULT,
      findings: [{ ...VALID_RESULT.findings[0], severity: "blocker" }],
    };
    expect(reviewResultSchema.safeParse(result).success).toBe(false);
  });

  it("rejects a finding with a non-integer line number", () => {
    const result = {
      ...VALID_RESULT,
      findings: [{ ...VALID_RESULT.findings[0], line: 1.5 }],
    };
    expect(reviewResultSchema.safeParse(result).success).toBe(false);
  });

  it("rejects a finding with a non-positive line number", () => {
    const result = {
      ...VALID_RESULT,
      findings: [{ ...VALID_RESULT.findings[0], line: 0 }],
    };
    expect(reviewResultSchema.safeParse(result).success).toBe(false);
  });

  it("rejects when the entire payload is null", () => {
    expect(reviewResultSchema.safeParse(null).success).toBe(false);
  });

  it("rejects an unexpected flat string", () => {
    expect(reviewResultSchema.safeParse("not-an-object").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// reviewInputSchema — Zod validation of user-submitted form input
// ---------------------------------------------------------------------------

const VALID_INPUT = {
  code: "function hello() {}",
  reviewType: "general",
};

describe("reviewInputSchema", () => {
  it("accepts valid input with required fields only", () => {
    expect(reviewInputSchema.safeParse(VALID_INPUT).success).toBe(true);
  });

  it("accepts valid input with an optional language hint", () => {
    expect(reviewInputSchema.safeParse({ ...VALID_INPUT, language: "TypeScript" }).success).toBe(
      true,
    );
  });

  it("rejects empty code", () => {
    expect(reviewInputSchema.safeParse({ ...VALID_INPUT, code: "" }).success).toBe(false);
  });

  it("rejects code that exceeds MAX_CODE_LENGTH", () => {
    const input = { ...VALID_INPUT, code: "x".repeat(MAX_CODE_LENGTH + 1) };
    expect(reviewInputSchema.safeParse(input).success).toBe(false);
  });

  it("accepts code exactly at MAX_CODE_LENGTH", () => {
    const input = { ...VALID_INPUT, code: "x".repeat(MAX_CODE_LENGTH) };
    expect(reviewInputSchema.safeParse(input).success).toBe(true);
  });

  it("rejects an unrecognised review type", () => {
    expect(reviewInputSchema.safeParse({ ...VALID_INPUT, reviewType: "unknown" }).success).toBe(
      false,
    );
  });

  it("rejects when reviewType is missing", () => {
    const { reviewType: _rt, ...noType } = VALID_INPUT;
    expect(reviewInputSchema.safeParse(noType).success).toBe(false);
  });

  it("rejects a language hint longer than 50 characters", () => {
    const input = { ...VALID_INPUT, language: "L".repeat(51) };
    expect(reviewInputSchema.safeParse(input).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MAX_CODE_LENGTH — constant contract
// ---------------------------------------------------------------------------

describe("MAX_CODE_LENGTH", () => {
  it("is 10 000 characters", () => {
    expect(MAX_CODE_LENGTH).toBe(10_000);
  });
});
