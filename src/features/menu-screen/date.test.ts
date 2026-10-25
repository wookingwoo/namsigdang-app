import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clampDateKeyToMenuHistory,
  createMenuHistoryEndKey,
  createMenuHistoryStartKey,
  createTodayKey,
  formatDateKey,
  formatDateLabel,
  formatDayOfMonth,
  getDateStripDates,
  isDateKeyWithinMenuHistory,
  parseDateKey,
  shiftDate,
} from "./date";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // A local evening makes accidental UTC conversion visible in Seoul and LA.
  vi.setSystemTime(new Date(2026, 9, 23, 23, 45));
});

afterEach(() => vi.useRealTimers());

describe("local calendar dates", () => {
  it("uses the local calendar day for today", () => {
    expect(createTodayKey()).toBe("2026-10-23");
  });

  it("pads month and day without converting through UTC", () => {
    expect(formatDateKey(new Date(2026, 0, 2, 0, 5))).toBe("2026-01-02");
  });

  it("parses a date key at local midnight", () => {
    const result = parseDateKey("2024-02-29");
    expect([result.getFullYear(), result.getMonth(), result.getDate(), result.getHours()])
      .toEqual([2024, 1, 29, 0]);
  });

  it("formats the Korean date and weekday", () => {
    expect(formatDateLabel("2026-10-23")).toBe("10월 23일 금요일");
  });

  it("displays the day number without a leading zero", () => {
    expect(formatDayOfMonth("2026-01-02")).toBe("2");
  });

  it.each([
    ["2026-01-31", 1, "2026-02-01"],
    ["2026-03-01", -1, "2026-02-28"],
    ["2024-02-28", 1, "2024-02-29"],
    ["2024-02-29", 1, "2024-03-01"],
    ["2025-12-31", 1, "2026-01-01"],
    ["2026-01-01", -1, "2025-12-31"],
    ["2026-03-07", 2, "2026-03-09"],
    ["2026-10-31", 2, "2026-11-02"],
    ["2026-10-23", 0, "2026-10-23"],
  ])("shifts %s by %i calendar days to %s", (date, amount, expected) => {
    expect(shiftDate(date, amount)).toBe(expected);
  });
});

describe("inclusive three-calendar-month access window", () => {
  it.each([
    [new Date(2026, 9, 23), "2026-07-23", "2027-01-23"],
    [new Date(2026, 4, 31), "2026-02-28", "2026-08-31"],
    [new Date(2024, 4, 31), "2024-02-29", "2024-08-31"],
    [new Date(2026, 10, 30), "2026-08-30", "2027-02-28"],
    [new Date(2023, 10, 30), "2023-08-30", "2024-02-29"],
    [new Date(2026, 0, 31), "2025-10-31", "2026-04-30"],
    [new Date(2024, 1, 29), "2023-11-29", "2024-05-29"],
  ])("clamps missing month-end days for %s", (reference, start, end) => {
    const originalTime = reference.getTime();
    expect(createMenuHistoryStartKey(reference)).toBe(start);
    expect(createMenuHistoryEndKey(reference)).toBe(end);
    expect(reference.getTime()).toBe(originalTime);
  });

  it("defaults the window to the device's current local date", () => {
    expect(createMenuHistoryStartKey()).toBe("2026-07-23");
    expect(createMenuHistoryEndKey()).toBe("2027-01-23");
  });

  it.each([
    ["2026-07-22", false, "2026-07-23"],
    ["2026-07-23", true, "2026-07-23"],
    ["2026-10-23", true, "2026-10-23"],
    ["2027-01-23", true, "2027-01-23"],
    ["2027-01-24", false, "2027-01-23"],
  ])("checks and clamps %s with inclusive bounds", (key, allowed, clamped) => {
    expect(isDateKeyWithinMenuHistory(key)).toBe(allowed);
    expect(clampDateKeyToMenuHistory(key)).toBe(clamped);
  });

  it("ignores the reference time of day when checking the first allowed day", () => {
    const reference = new Date(2024, 4, 31, 23, 59, 59);
    expect(isDateKeyWithinMenuHistory("2024-02-29", reference)).toBe(true);
    expect(clampDateKeyToMenuHistory("2024-02-28", reference)).toBe("2024-02-29");
  });
});

describe("date strips", () => {
  it("centers the selected date in a five-day compact strip", () => {
    expect(getDateStripDates("2026-10-23", 5)).toEqual([
      "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25",
    ]);
  });

  it("centers a seven-day strip across a year boundary", () => {
    expect(getDateStripDates("2026-01-01", 7)).toEqual([
      "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01",
      "2026-01-02", "2026-01-03", "2026-01-04",
    ]);
  });

  it("includes leap day when the strip crosses February", () => {
    expect(getDateStripDates("2024-03-01", 5)).toEqual([
      "2024-02-28", "2024-02-29", "2024-03-01", "2024-03-02", "2024-03-03",
    ]);
  });

  it("does not skip a day across a daylight-saving transition", () => {
    expect(getDateStripDates("2026-03-08", 5)).toEqual([
      "2026-03-06", "2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10",
    ]);
  });

  it("starts at the lower bound without hiding the selected date", () => {
    expect(getDateStripDates("2026-07-23", 5, "2026-07-23", "2027-01-23"))
      .toEqual(["2026-07-23", "2026-07-24", "2026-07-25", "2026-07-26", "2026-07-27"]);
  });

  it("keeps the upper-bound selection visible, with future chips disabled by the picker", () => {
    const dates = getDateStripDates("2027-01-23", 5, "2026-07-23", "2027-01-23");
    expect(dates).toEqual([
      "2027-01-21", "2027-01-22", "2027-01-23", "2027-01-24", "2027-01-25",
    ]);
    expect(dates.map((key) => isDateKeyWithinMenuHistory(key)))
      .toEqual([true, true, true, false, false]);
  });

  it("handles an upper bound without requiring a lower bound", () => {
    expect(getDateStripDates("2027-01-23", 1, undefined, "2027-01-23"))
      .toEqual(["2027-01-23"]);
    expect(getDateStripDates("2027-01-23", 3, undefined, "2027-01-23"))
      .toEqual(["2027-01-22", "2027-01-23", "2027-01-24"]);
  });

  it("respects the lower bound when the available range is shorter than the strip", () => {
    expect(getDateStripDates("2026-10-23", 5, "2026-10-23", "2026-10-24"))
      .toEqual(["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27"]);
  });
});
