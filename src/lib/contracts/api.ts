import { z } from "zod";
import { financialProfileSchema } from "./financial-profile";
import { diagnosisResultSchema, recipeSelectionSchema } from "./results";

export const calculateRequestSchema = z.object({
  profile: financialProfileSchema,
  recipeSelection: recipeSelectionSchema.optional(),
  persist: z.boolean().default(true),
});

export const calculateResponseSchema = z.object({
  snapshotId: z.string().uuid().nullable(),
  result: diagnosisResultSchema,
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export type CalculateRequest = z.infer<typeof calculateRequestSchema>;
export type CalculateResponse = z.infer<typeof calculateResponseSchema>;
