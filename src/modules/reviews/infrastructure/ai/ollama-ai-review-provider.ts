import "server-only";
import type { AiReviewProvider } from "@/modules/reviews/domain/ports/ai-review-provider";
import type { ReviewInput, ReviewResult } from "@/modules/reviews/domain/types";
import { reviewResultSchema } from "@/modules/reviews/schemas/review.schema";
import { getServerEnv } from "@/config/env";

// Single in-memory concurrency guard: one Ollama review at a time on single VPS.
let reviewing = false;

class OllamaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

export class OllamaBusyError extends OllamaError {
  constructor() {
    super("Ollama is already processing a review.", "OLLAMA_BUSY");
  }
}

export class OllamaTimeoutError extends OllamaError {
  constructor() {
    super("Ollama request timed out.", "OLLAMA_TIMEOUT");
  }
}

export class OllamaUnavailableError extends OllamaError {
  constructor(cause?: unknown) {
    super("Ollama is unavailable.", "OLLAMA_UNAVAILABLE");
    if (cause != null) this.cause = cause;
  }
}

export class OllamaInvalidResponseError extends OllamaError {
  constructor() {
    super("Ollama returned an unrecognisable response.", "OLLAMA_INVALID_RESPONSE");
  }
}

const REVIEW_FOCUS: Record<string, string> = {
  general: "overall code quality, clarity, and maintainability",
  "clean-code": "clean code principles: naming, single responsibility, DRY, readability",
  bugs: "potential bugs: null dereferences, off-by-one errors, unhandled edge cases",
  security: "security vulnerabilities: injection, exposed credentials, improper auth",
  performance: "performance issues: N+1 queries, blocking I/O, unnecessary recomputation",
  architecture: "architectural concerns: layer violations, tight coupling, separation of concerns",
  testing: "testing gaps: missing coverage, brittle assertions, happy-path-only tests",
};

// Caps token output to keep responses concise and fast on small models.
const NUM_PREDICT = 800;

// NOTE: user-submitted code is passed to Ollama as data to be reviewed — it is
// never executed, compiled, or evaluated. See SECURITY.md and PROMPTS.md.
function buildPrompt(input: ReviewInput): string {
  const focus = REVIEW_FOCUS[input.reviewType] ?? "overall code quality";
  const langHint = input.language ? ` written in ${input.language}` : "";

  return `You are a senior software engineer performing a code review focused on: ${focus}.

Return ONLY a JSON object. No markdown, no code fences, no extra text. Use this exact shape:
{"reviewType":"${input.reviewType}","summary":"one or two sentence summary of the overall quality","findings":[{"title":"short issue title","severity":"info|minor|major|critical","explanation":"why this matters","suggestion":"concrete improvement"}]}

Rules:
- Return 3 to 5 findings maximum.
- Prioritise: security vulnerabilities, bugs, data validation issues, type safety problems, error handling gaps, architecture boundary violations, maintainability concerns.
- Do NOT report missing documentation unless it is clearly critical.
- Do NOT report low-value style preferences (formatting, naming conventions).
- Every finding must be specific and actionable based on what the code actually contains.
- severity must be exactly one of: info, minor, major, critical
- reviewType must be exactly "${input.reviewType}"
- Omit the "line" field unless you are certain of the line number.

Code to review${langHint}:
${input.code}`;
}

export class OllamaAiReviewProvider implements AiReviewProvider {
  async review(input: ReviewInput): Promise<ReviewResult> {
    if (reviewing) throw new OllamaBusyError();
    reviewing = true;

    const env = getServerEnv();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS);

    try {
      let response: Response;
      try {
        response = await fetch(`${env.OLLAMA_BASE_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: env.OLLAMA_MODEL,
            prompt: buildPrompt(input),
            stream: false,
            format: "json",
            options: { temperature: 0.1, num_predict: NUM_PREDICT },
          }),
          signal: controller.signal,
        });
      } catch (err) {
        if (controller.signal.aborted) throw new OllamaTimeoutError();
        throw new OllamaUnavailableError(err);
      }

      if (!response.ok) {
        throw new OllamaUnavailableError(`HTTP ${response.status}`);
      }

      let body: { response?: unknown };
      try {
        body = (await response.json()) as { response?: unknown };
      } catch {
        throw new OllamaInvalidResponseError();
      }

      const raw = body.response;
      if (typeof raw !== "string" || raw.trim() === "") {
        throw new OllamaInvalidResponseError();
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new OllamaInvalidResponseError();
      }

      const validated = reviewResultSchema.safeParse(parsed);
      if (!validated.success) {
        throw new OllamaInvalidResponseError();
      }

      // Force reviewType to match what was requested — prevents model drift.
      return { ...validated.data, reviewType: input.reviewType };
    } catch (err) {
      if (err instanceof OllamaError) throw err;
      if (controller.signal.aborted) throw new OllamaTimeoutError();
      throw new OllamaUnavailableError(err);
    } finally {
      clearTimeout(timer);
      reviewing = false;
    }
  }
}
