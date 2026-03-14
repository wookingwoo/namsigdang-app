const dayFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
});

export const MENU_ACCESS_MONTHS = 3;

function normalizeDate(date: Date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function shiftCalendarMonths(date: Date, amount: number) {
  const normalizedDate = normalizeDate(date);
  const originalDay = normalizedDate.getDate();
  const shiftedDate = new Date(normalizedDate);

  shiftedDate.setDate(1);
  shiftedDate.setMonth(shiftedDate.getMonth() + amount);

  const lastDayOfTargetMonth = new Date(
    shiftedDate.getFullYear(),
    shiftedDate.getMonth() + 1,
    0,
  ).getDate();

  shiftedDate.setDate(Math.min(originalDay, lastDayOfTargetMonth));

  return shiftedDate;
}

export function createTodayKey() {
  return formatDateKey(new Date());
}

export function shiftDate(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return formatDateKey(date);
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function createMenuHistoryStartKey(referenceDate = new Date()) {
  return formatDateKey(shiftCalendarMonths(referenceDate, -MENU_ACCESS_MONTHS));
}

export function createMenuHistoryEndKey(referenceDate = new Date()) {
  return formatDateKey(shiftCalendarMonths(referenceDate, MENU_ACCESS_MONTHS));
}

export function isDateKeyWithinMenuHistory(
  dateKey: string,
  referenceDate = new Date(),
) {
  const minimumDate = normalizeDate(
    shiftCalendarMonths(referenceDate, -MENU_ACCESS_MONTHS),
  );
  const maximumDate = normalizeDate(
    shiftCalendarMonths(referenceDate, MENU_ACCESS_MONTHS),
  );
  const selectedDate = normalizeDate(parseDateKey(dateKey));

  return selectedDate >= minimumDate && selectedDate <= maximumDate;
}

export function clampDateKeyToMenuHistory(
  dateKey: string,
  referenceDate = new Date(),
) {
  const minimumDate = normalizeDate(
    shiftCalendarMonths(referenceDate, -MENU_ACCESS_MONTHS),
  );
  const maximumDate = normalizeDate(
    shiftCalendarMonths(referenceDate, MENU_ACCESS_MONTHS),
  );
  const selectedDate = normalizeDate(parseDateKey(dateKey));

  if (selectedDate < minimumDate) {
    return createMenuHistoryStartKey(referenceDate);
  }

  if (selectedDate > maximumDate) {
    return createMenuHistoryEndKey(referenceDate);
  }

  return dateKey;
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);
  return dayFormatter.format(date);
}

export function getDateStripDates(
  dateKey: string,
  visibleDays: number,
  minimumDateKey?: string,
  maximumDateKey?: string,
) {
  const selectedDate = parseDateKey(dateKey);
  const startDate = new Date(selectedDate);
  const daysBeforeSelected = Math.floor(visibleDays / 2);
  const daysAfterSelected = visibleDays - daysBeforeSelected - 1;

  startDate.setDate(selectedDate.getDate() - daysBeforeSelected);

  if (minimumDateKey) {
    const minimumDate = parseDateKey(minimumDateKey);
    if (startDate < minimumDate) {
      startDate.setTime(minimumDate.getTime());
    }
  }

  if (maximumDateKey) {
    const maximumDate = parseDateKey(maximumDateKey);
    const lastVisibleDate = new Date(startDate);
    lastVisibleDate.setDate(startDate.getDate() + visibleDays - 1);

    if (lastVisibleDate > maximumDate) {
      startDate.setTime(maximumDate.getTime());
      startDate.setDate(maximumDate.getDate() - daysAfterSelected);

      if (minimumDateKey) {
        const minimumDate = parseDateKey(minimumDateKey);
        if (startDate < minimumDate) {
          startDate.setTime(minimumDate.getTime());
        }
      }
    }
  }

  return Array.from({ length: visibleDays }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return formatDateKey(currentDate);
  });
}

export function formatDayOfMonth(dateKey: string) {
  return `${parseDateKey(dateKey).getDate()}`;
}
