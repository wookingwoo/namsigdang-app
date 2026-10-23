import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({
  db: { name: "test-database" },
  reference: { path: "controlled-month-reference" },
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDb: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({ doc: firebase.doc, getDoc: firebase.getDoc }));
vi.mock("../config/firebase", () => ({ getDb: firebase.getDb }));

import { getMenuByDate } from "./menu";

beforeEach(() => {
  firebase.getDb.mockReturnValue(firebase.db);
  firebase.doc.mockReturnValue(firebase.reference);
  firebase.getDoc.mockResolvedValue({ exists: () => true, data: () => ({}) });
});

describe("menu month document and campus decoding", () => {
  it.each([
    { campus: "Dongjak" as const, date: "2026-01-02", year: "year_2026", month: "month_01",
      data: { do20260102a: "쌀밥, 미역국", do20260102b: "비빔밥", do20260102c: "카레", eu20260102a: "다른 관", do20260103a: "다른 날짜" } },
    { campus: "Eunpyeong" as const, date: "2024-02-29", year: "year_2024", month: "month_02",
      data: { eu20240229a: "쌀밥, 미역국", eu20240229b: "비빔밥", eu20240229c: "카레", do20240229a: "다른 관", eu20240301a: "다른 날짜" } },
  ])("reads and decodes $campus on $date", async ({ campus, date, year, month, data }) => {
    firebase.getDoc.mockResolvedValue({ exists: () => true, data: () => data });
    await expect(getMenuByDate(campus, date)).resolves.toEqual({
      breakfast: ["쌀밥", "미역국"], lunch: ["비빔밥"], dinner: ["카레"],
    });
    expect(firebase.doc).toHaveBeenCalledExactlyOnceWith(firebase.db, "menu", campus, year, month);
    expect(firebase.getDoc).toHaveBeenCalledExactlyOnceWith(firebase.reference);
  });

  it("continues to accept the existing compact date format", async () => {
    firebase.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ do20261023a: "토스트" }) });
    await expect(getMenuByDate("Dongjak", "20261023"))
      .resolves.toEqual({ breakfast: ["토스트"], lunch: [], dinner: [] });
    expect(firebase.doc).toHaveBeenCalledWith(firebase.db, "menu", "Dongjak", "year_2026", "month_10");
  });

  it.each([
    [" 쌀밥 , , 미역국,\n김치, ", ["쌀밥", "미역국", "김치"]],
    ["샐러드&망고소스, 떡갈비(돼지고기)", ["샐러드&망고소스", "떡갈비(돼지고기)"]],
    ["김치,김치", ["김치", "김치"]],
    ["", []], ["  , ,\n", []], [null, []], [undefined, []], [42, []], [false, []],
    [["쌀밥"], []], [{ menu: "쌀밥" }, []],
  ])("normalizes a meal value of %j", async (raw, expected) => {
    firebase.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ eu20261023a: raw }) });
    await expect(getMenuByDate("Eunpyeong", "2026-10-23"))
      .resolves.toEqual({ breakfast: expected, lunch: [], dinner: [] });
  });

  it("returns three empty meals when the day is missing from an existing month", async () => {
    firebase.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ eu20261024a: "다음 날" }) });
    await expect(getMenuByDate("Eunpyeong", "2026-10-23"))
      .resolves.toEqual({ breakfast: [], lunch: [], dinner: [] });
  });

  it("returns empty meals without decoding a missing month document", async () => {
    const data = vi.fn(() => { throw new Error("a missing document has no data"); });
    firebase.getDoc.mockResolvedValue({ exists: () => false, data });
    await expect(getMenuByDate("Dongjak", "2026-10-23"))
      .resolves.toEqual({ breakfast: [], lunch: [], dinner: [] });
    expect(data).not.toHaveBeenCalled();
  });

  it("does not share mutable empty meal arrays across missing-document reads", async () => {
    firebase.getDoc.mockResolvedValue({ exists: () => false });
    const first = await getMenuByDate("Dongjak", "2026-10-23");
    const second = await getMenuByDate("Eunpyeong", "2026-10-24");
    expect(first).not.toBe(second);
    first.breakfast.push("consumer-added item");
    expect(second).toEqual({ breakfast: [], lunch: [], dinner: [] });
    expect(first.breakfast).not.toBe(first.lunch);
  });
});

describe("invalid input and Firebase failures", () => {
  it.each([
    "", "invalid", "2026/10/23", "2026-1-02", "2026-10-2", "2026--10-23",
    "-20261023", "2026-10-23T00:00:00Z", " 2026-10-23 ",
    "2026-00-23", "2026-13-01", "2026-10-00", "2026-10-32", "2026-04-31",
    "2026-02-29", "20260230", "1900-02-29",
  ])("rejects %j before initializing or reading Firebase", async (date) => {
    await expect(getMenuByDate("Dongjak", date)).rejects.toThrow("잘못된 날짜 형식");
    expect(firebase.getDb).not.toHaveBeenCalled();
    expect(firebase.doc).not.toHaveBeenCalled();
    expect(firebase.getDoc).not.toHaveBeenCalled();
  });

  it("accepts the leap day of a century divisible by 400", async () => {
    await expect(getMenuByDate("Dongjak", "2000-02-29"))
      .resolves.toEqual({ breakfast: [], lunch: [], dinner: [] });
    expect(firebase.doc).toHaveBeenCalledWith(firebase.db, "menu", "Dongjak", "year_2000", "month_02");
  });

  it("propagates an SDK read rejection so the screen can show an error", async () => {
    const failure = new Error("permission-denied");
    firebase.getDoc.mockRejectedValueOnce(failure);
    await expect(getMenuByDate("Dongjak", "2026-10-23")).rejects.toBe(failure);
  });

  it("propagates unavailable Firebase configuration without attempting a read", async () => {
    const failure = new Error("Firebase configuration is unavailable.");
    firebase.getDb.mockImplementationOnce(() => { throw failure; });
    await expect(getMenuByDate("Dongjak", "2026-10-23")).rejects.toBe(failure);
    expect(firebase.getDoc).not.toHaveBeenCalled();
  });
});
