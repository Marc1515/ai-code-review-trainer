import type { AiReviewProvider } from "@/modules/reviews/domain/ports/ai-review-provider";
import type { ReviewInput, ReviewResult, ReviewType } from "@/modules/reviews/domain/types";

// NOTE: user-submitted `code` is data — never executed or interpolated.
// See SECURITY.md and PROMPTS.md.
// TODO(i18n): mock review content (summary, findings) is currently English-only.
// When real providers are added, review content should be returned in the user's locale.

type CannedReview = Omit<ReviewResult, "reviewType">;

const MOCK_REVIEWS: Record<ReviewType, CannedReview> = {
  general: {
    summary:
      "The code is functional but has several areas that could be improved for clarity, robustness, and maintainability.",
    findings: [
      {
        title: "Missing error handling",
        severity: "major",
        explanation:
          "Functions that perform I/O or can throw should handle errors explicitly. Without this, uncaught exceptions can crash the application or produce silent failures.",
        suggestion:
          "Wrap async calls in try/catch blocks and propagate or handle errors at the appropriate boundary.",
      },
      {
        title: "Unclear variable names",
        severity: "minor",
        explanation:
          "Short or ambiguous names like `x`, `tmp`, or `d` make it harder for readers to understand intent. Descriptive names act as inline documentation and reduce cognitive load.",
        suggestion:
          "Rename variables to reflect their purpose, e.g. `userId` instead of `id`, `responseData` instead of `data`.",
      },
      {
        title: "No validation at public entry points",
        severity: "info",
        explanation:
          "Public functions and API endpoints should validate their inputs before use. This prevents confusing errors deeper in the call stack and makes the failure mode explicit.",
      },
    ],
  },

  "clean-code": {
    summary:
      "Several clean-code principles are not consistently applied, which may reduce long-term maintainability.",
    findings: [
      {
        title: "Function violates the Single Responsibility Principle",
        severity: "major",
        explanation:
          "Functions that mix concerns — e.g. fetching data and transforming it — are harder to test, name, and reuse. Each function should have one reason to change.",
        suggestion:
          "Break the function into smaller, focused helpers with descriptive names that each do one thing.",
      },
      {
        title: "Magic numbers without named constants",
        severity: "minor",
        explanation:
          "Numeric literals embedded in logic are hard to understand and change. Named constants document intent and centralise future updates.",
        suggestion: "Extract literals into named constants: `const SECONDS_PER_DAY = 86_400;`",
      },
      {
        title: "Duplicated logic across multiple locations",
        severity: "minor",
        explanation:
          "The DRY principle warns that duplicated code creates multiple maintenance points. A bug fixed in one copy may survive in another and divergence accumulates over time.",
        suggestion:
          "Extract the shared logic into a single utility function imported wherever it is needed.",
      },
    ],
  },

  bugs: {
    summary:
      "Potential runtime bugs were identified that may cause incorrect behaviour or application crashes.",
    findings: [
      {
        title: "Possible null / undefined dereference",
        severity: "critical",
        explanation:
          "Accessing a property on a value that may be null or undefined throws a TypeError at runtime. This is one of the most common sources of production crashes.",
        suggestion:
          "Use optional chaining (`?.`) or an explicit null-check before accessing nested properties. Enable TypeScript strict-null checks to catch these at compile time.",
      },
      {
        title: "Off-by-one error in loop bounds",
        severity: "major",
        explanation:
          "Loop boundary conditions are a classic source of bugs. Using `<` vs `<=` or starting at 0 vs 1 can silently skip the first or last element.",
        suggestion:
          "Audit loop bounds against the intended range. Add unit tests that assert correct behaviour for the first element, the last element, and an empty input.",
      },
      {
        title: "Unhandled promise rejection",
        severity: "major",
        explanation:
          "An async function that rejects without a `.catch()` or `try/catch` produces an unhandled rejection, which may crash the Node process or be silently swallowed in the browser.",
        suggestion:
          "Add `try/catch` around every `await` call, or attach `.catch()` to promise chains at their call sites.",
      },
    ],
  },

  security: {
    summary:
      "Security review flagged critical areas that must be addressed before any production exposure.",
    findings: [
      {
        title: "Unsanitised user input used directly",
        severity: "critical",
        explanation:
          "Passing raw user input into a database query, shell command, or template enables injection attacks. An attacker can craft input that alters program control flow or exfiltrates data.",
        suggestion:
          "Use parameterised queries or prepared statements for all database access. Never interpolate user data into raw SQL, shell commands, or eval strings.",
      },
      {
        title: "Secret or credential visible in source code",
        severity: "critical",
        explanation:
          "Hard-coded API keys, tokens, or passwords are committed to version control and visible to anyone with repo access. They cannot be rotated without a code change.",
        suggestion:
          "Move secrets to environment variables and load them at runtime. Add sensitive files to `.gitignore`. Rotate any secrets already committed.",
      },
      {
        title: "Sensitive data written to application logs",
        severity: "major",
        explanation:
          "Logging tokens, passwords, or personal data risks exposure through log aggregators, monitoring dashboards, or misconfigured log retention policies.",
        suggestion:
          "Redact or omit sensitive fields before logging. Adopt structured logging with an explicit allowlist of safe fields.",
      },
    ],
  },

  performance: {
    summary:
      "Performance analysis identified patterns that may cause unnecessary computation or latency.",
    findings: [
      {
        title: "N+1 query pattern",
        severity: "major",
        explanation:
          "Fetching related data inside a loop results in one database query per iteration. On large datasets this is orders of magnitude slower than a single batched query.",
        suggestion:
          "Load all related records in one query before the loop (e.g. using an `IN` clause or a JOIN), or use a dataloader / batching pattern.",
      },
      {
        title: "Synchronous I/O blocks the event loop",
        severity: "major",
        explanation:
          "Synchronous file or network calls block Node's event loop, preventing it from handling other concurrent requests until the call completes.",
        suggestion:
          "Replace synchronous calls (e.g. `fs.readFileSync`) with their async counterparts and await them properly.",
      },
      {
        title: "Expensive computation repeated on every call",
        severity: "minor",
        explanation:
          "Recalculating results that do not change on every render or function call wastes CPU cycles unnecessarily.",
        suggestion:
          "Cache or memoise pure computations. In React, use `useMemo` for derived state. In module scope, compute once and export the result.",
      },
    ],
  },

  architecture: {
    summary:
      "Architectural review identified boundary violations and coupling concerns that may hinder future change.",
    findings: [
      {
        title: "Presentation layer imports infrastructure directly",
        severity: "major",
        explanation:
          "When the UI depends directly on database adapters or third-party API clients, swapping one implementation requires changes across multiple layers. This violates the Dependency Inversion Principle.",
        suggestion:
          "Introduce a use-case or service layer between the UI and infrastructure. Infrastructure adapters should implement interfaces owned by the domain.",
      },
      {
        title: "Circular dependency between modules",
        severity: "major",
        explanation:
          "Circular imports create brittle coupling: changing one module may unexpectedly break another. They also prevent tree-shaking and can produce subtle initialisation errors.",
        suggestion:
          "Identify the shared concept and extract it to a common module that both modules depend on, breaking the cycle.",
      },
      {
        title: "Business logic in the route handler",
        severity: "minor",
        explanation:
          "Route handlers should translate HTTP requests into use-case calls and format responses — not contain decision logic. Fat controllers are hard to test in isolation and cannot be reused outside HTTP.",
        suggestion:
          "Move business rules into dedicated use-cases or domain services. Keep handlers thin: validate input, call use-case, return response.",
      },
    ],
  },

  testing: {
    summary:
      "Testing review found coverage gaps and test-design concerns that may allow regressions to go undetected.",
    findings: [
      {
        title: "No tests for the error or failure path",
        severity: "major",
        explanation:
          "Tests that only cover the happy path miss the failure cases where bugs most commonly hide. Empty input, null values, network errors, and boundary values all need explicit coverage.",
        suggestion:
          "Add test cases for invalid input, thrown errors, and edge values. Name them to document the expected behaviour.",
      },
      {
        title: "Tests assert implementation details, not behaviour",
        severity: "minor",
        explanation:
          "Tests that check internal state or private method calls are brittle: they break when you refactor even without changing observable behaviour, increasing maintenance cost.",
        suggestion:
          "Rewrite assertions to verify the observable output or side-effect — the return value, emitted event, or stored record. Test what, not how.",
      },
      {
        title: "Missing integration test for the full flow",
        severity: "info",
        explanation:
          "Unit tests verify components in isolation but may miss failure modes that emerge from the interaction between layers. At least one integration test increases confidence in the assembled system.",
        suggestion:
          "Add a test that exercises the feature from the entry point (route, Server Action, or public API) down to the final output or side-effect.",
      },
    ],
  },
};

export class MockAiReviewProvider implements AiReviewProvider {
  async review(input: ReviewInput): Promise<ReviewResult> {
    const mock = MOCK_REVIEWS[input.reviewType];
    return {
      reviewType: input.reviewType,
      summary: mock.summary,
      findings: mock.findings,
    };
  }
}
