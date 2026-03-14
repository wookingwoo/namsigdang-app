import { doc, getDoc } from "firebase/firestore";

import { getDb } from "../config/firebase";
import type { Campus, MenuDay } from "../types/menu";

const CAMPUS_PREFIX: Record<Campus, string> = {
  Dongjak: "do",
  Eunpyeong: "eu",
};

const EMPTY_DAY: MenuDay = {
  breakfast: [],
  lunch: [],
  dinner: [],
};

function parseMenuItems(rawValue: unknown) {
  if (typeof rawValue !== "string") {
    return [];
  }

  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createFieldKey(
  campus: Campus,
  compactDate: string,
  mealCode: "a" | "b" | "c",
) {
  return `${CAMPUS_PREFIX[campus]}${compactDate}${mealCode}`;
}

export async function getMenuByDate(
  campus: Campus,
  dateKey: string,
): Promise<MenuDay> {
  const compactDate = dateKey.replaceAll("-", "");
  const [year, month] =
    compactDate.match(/^(\d{4})(\d{2})\d{2}$/)?.slice(1) ?? [];

  if (!year || !month) {
    throw new Error(`잘못된 날짜 형식입니다: ${dateKey}`);
  }

  const menuRef = doc(
    getDb(),
    "menu",
    campus,
    `year_${year}`,
    `month_${month}`,
  );
  const snapshot = await getDoc(menuRef);

  if (!snapshot.exists()) {
    return EMPTY_DAY;
  }

  const data = snapshot.data();

  return {
    breakfast: parseMenuItems(data[createFieldKey(campus, compactDate, "a")]),
    lunch: parseMenuItems(data[createFieldKey(campus, compactDate, "b")]),
    dinner: parseMenuItems(data[createFieldKey(campus, compactDate, "c")]),
  };
}
