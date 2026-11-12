import { z } from "zod";

export const moneyUnitSchema = z.literal("KRW_10K");

export const recipeIdSchema = z.enum([
  "basic",
  "card",
  "sil5",
  "ins",
  "par",
  "term",
  "irp",
  "spouse",
  "reemp",
  "dc15",
  "down",
  "hp",
  "retm",
  "parhp",
  "youth",
  "isa",
  "npcont",
  "prepay",
  "np70",
  "np60",
]);

export const diagnosisResultSchema = z.object({
  calculationVersion: z.string().min(1),
  moneyUnit: moneyUnitSchema,
  monthlyCashFlow: z.number().finite(),
  depletionAge: z.number().int().nullable(),
  assetsAt95: z.number().finite(),
  health: z.object({
    emergencyFundMonths: z.number().finite(),
    debtToIncomeRate: z.number().finite(),
    homeAssetRate: z.number().finite(),
    pensionGapYears: z.number().finite(),
  }),
  generatedAt: z.string().datetime(),
});

export const recipeSelectionSchema = z.object({
  selectedRecipeIds: z.array(recipeIdSchema),
  housing: z
    .object({
      downsizingRatio: z.number().min(0.3).max(0.9).default(0.7),
      downsizingAge: z.number().int().min(50).max(90).nullable().default(null),
      reverseMortgageEnabled: z.boolean().default(false),
    })
    .default({
      downsizingRatio: 0.7,
      downsizingAge: null,
      reverseMortgageEnabled: false,
    }),
});

export const calculationSnapshotSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  calculationVersion: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  result: diagnosisResultSchema,
  selectedRecipes: recipeSelectionSchema,
  createdAt: z.string().datetime(),
});

export type RecipeId = z.infer<typeof recipeIdSchema>;
export type DiagnosisResult = z.infer<typeof diagnosisResultSchema>;
export type RecipeSelection = z.infer<typeof recipeSelectionSchema>;
export type CalculationSnapshot = z.infer<typeof calculationSnapshotSchema>;
