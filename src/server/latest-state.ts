import { financialProfileSchema, recipeSelectionSchema, type FinancialProfile, type RecipeSelection } from "@/lib/contracts";
import { createClient } from "@/lib/supabase/server";

export interface LatestState {
  profile: FinancialProfile | null;
  profileSavedAt: string | null;
  /** 가장 최근에 고른 레시피 조합. 전부 해제한 빈 조합도 유지한다. */
  selection: RecipeSelection | null;
}

/**
 * 로그인 사용자의 최신 입력과 최근 레시피 선택을 읽는다.
 * 화면 숫자는 저장된 스냅숏 결과 대신 이 입력으로 다시 계산해, 입력을 고치면 모든 화면이 함께 바뀌게 한다.
 */
export async function getLatestState(): Promise<LatestState> {
  const supabase = await createClient();
  const [inputResponse, selectionResponse] = await Promise.all([
    supabase
      .from("financial_input_snapshots")
      .select("input, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("recipe_selections")
      .select("selected_recipe_ids, housing, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const parsedProfile = financialProfileSchema.safeParse(inputResponse.data?.input);
  const parsedSelection = selectionResponse.data
    ? recipeSelectionSchema.safeParse({
        selectedRecipeIds: selectionResponse.data.selected_recipe_ids,
        housing: selectionResponse.data.housing,
      })
    : null;

  return {
    profile: parsedProfile.success ? parsedProfile.data : null,
    profileSavedAt: inputResponse.data?.created_at ?? null,
    selection: parsedSelection?.success ? parsedSelection.data : null,
  };
}
