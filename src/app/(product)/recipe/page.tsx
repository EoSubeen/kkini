import { connection } from "next/server";
import { RecipeBuilder } from "@/components/recipe-builder";
import { reportCaseResult } from "@/domain/finance";
import { getLatestState } from "@/server";

export const instant = false;

export default async function RecipePage() {
  await connection();
  const { profile, selection } = await getLatestState();
  return <RecipeBuilder initialProfile={profile} initialSelection={selection} reportCase={reportCaseResult()} />;
}
