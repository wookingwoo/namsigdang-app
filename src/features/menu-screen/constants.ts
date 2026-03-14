import type { Campus, MealType } from "../../types/menu";

export const CAMPUS_OPTIONS: Array<{ label: string; value: Campus }> = [
  { label: "동작관", value: "Dongjak" },
  { label: "은평관", value: "Eunpyeong" },
];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const MENU_LOAD_ERROR_MESSAGE =
  "현재 식단 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.";

export const CAMPUS_STORAGE_KEY = "selectedCampus";

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function isCampus(value: string): value is Campus {
  return CAMPUS_OPTIONS.some((option) => option.value === value);
}

export function getCampusLabel(campus: Campus) {
  return CAMPUS_OPTIONS.find((option) => option.value === campus)?.label ?? campus;
}
