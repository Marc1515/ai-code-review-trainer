import { z } from "zod";
import { REVIEW_TYPES } from "@/modules/reviews/domain/types";

export const MAX_CODE_LENGTH = 10_000;

export const reviewInputSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required.")
    .max(MAX_CODE_LENGTH, `Code must be under ${MAX_CODE_LENGTH} characters.`),
  language: z.string().max(50).optional(),
  reviewType: z.enum(REVIEW_TYPES),
});

export type ReviewInputDto = z.infer<typeof reviewInputSchema>;

const findingSchema = z.object({
  title: z.string(),
  severity: z.enum(["info", "minor", "major", "critical"]),
  explanation: z.string(),
  suggestion: z.string().optional(),
  line: z.number().int().positive().optional(),
});

export const reviewResultSchema = z.object({
  reviewType: z.enum(REVIEW_TYPES),
  summary: z.string(),
  findings: z.array(findingSchema),
});
