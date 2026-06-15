export class ReviewLimitReachedError extends Error {
  readonly code = "REVIEW_LIMIT_REACHED";
  constructor() {
    super("Review limit reached.");
    this.name = "ReviewLimitReachedError";
  }
}
