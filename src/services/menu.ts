import { doc, getDoc } from "firebase/firestore";

import { getDb } from "../config/firebase";
import type { Campus, MenuDay } from "../types/menu";

const CAMPUS_PREFIX: Record<Campus, string> = {
  Dongjak: "do",
  Eunpyeong: "eu",
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
  // Keep both supported formats, but reject mixed/misplaced separators.
  const parts = dateKey.match(/^(\d{4})(-?)(\d{2})\2(\d{2})$/);
  if (!parts) {
    throw new Error(`잘못된 날짜 형식입니다: ${dateKey}`);
  }

  const [, year, , month, day] = parts;
  // UTC avoids local DST rules; setUTCFullYear also preserves years 0000–0099.
  const calendarDate = new Date(0);
  calendarDate.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  if (
    calendarDate.getUTCFullYear() !== Number(year) ||
    calendarDate.getUTCMonth() !== Number(month) - 1 ||
    calendarDate.getUTCDate() !== Number(day)
  ) {
    throw new Error(`잘못된 날짜 형식입니다: ${dateKey}`);
  }

  const compactDate = `${year}${month}${day}`;
  const menuRef = doc(
    getDb(),
    "menu",
    campus,
    `year_${year}`,
    `month_${month}`,
  );
  const snapshot = await getDoc(menuRef);

  if (!snapshot.exists()) {
    return { breakfast: [], lunch: [], dinner: [] };
  }

  const data = snapshot.data();

  return {
    breakfast: parseMenuItems(data[createFieldKey(campus, compactDate, "a")]),
    lunch: parseMenuItems(data[createFieldKey(campus, compactDate, "b")]),
    dinner: parseMenuItems(data[createFieldKey(campus, compactDate, "c")]),
  };
}
