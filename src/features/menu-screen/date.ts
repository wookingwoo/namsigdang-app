const dayFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
});

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

export function getDateStripDates(dateKey: string, visibleDays: number) {
  const selectedDate = parseDateKey(dateKey);
  const startDate = new Date(selectedDate);
  const daysBeforeSelected = Math.floor(visibleDays / 2);
  startDate.setDate(selectedDate.getDate() - daysBeforeSelected);

  return Array.from({ length: visibleDays }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return formatDateKey(currentDate);
  });
}

export function formatDayOfMonth(dateKey: string) {
  return `${parseDateKey(dateKey).getDate()}`;
}
