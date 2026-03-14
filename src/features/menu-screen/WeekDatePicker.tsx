import { Pressable, Text, View } from "react-native";

import { WEEKDAY_LABELS } from "./constants";
import {
  createMenuHistoryStartKey,
  createTodayKey,
  formatDateLabel,
  formatDayOfMonth,
  getDateStripDates,
  isDateKeyWithinMenuHistory,
  parseDateKey,
  shiftDate,
} from "./date";
import { styles } from "./styles";

type WeekDatePickerProps = {
  dateKey: string;
  onChange: (dateKey: string) => void;
  compact: boolean;
};

export function WeekDatePicker({
  dateKey,
  onChange,
  compact,
}: WeekDatePickerProps) {
  const todayKey = createTodayKey();
  const minimumDateKey = createMenuHistoryStartKey();
  const dateStripDates = getDateStripDates(
    dateKey,
    compact ? 5 : 7,
    minimumDateKey,
  );
  const isTodaySelected = dateKey === todayKey;
  const previousDateKey = shiftDate(dateKey, -1);
  const canGoPrevious = isDateKeyWithinMenuHistory(previousDateKey);

  return (
    <View style={styles.dateCard}>
      <View style={styles.dateNavRow}>
        <Pressable
          disabled={!canGoPrevious}
          onPress={() => onChange(previousDateKey)}
          style={({ pressed }) => [
            styles.weekNavButton,
            !canGoPrevious && styles.weekNavButtonDisabled,
            pressed && styles.weekNavButtonPressed,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={[
              styles.weekNavArrow,
              !canGoPrevious && styles.weekNavArrowDisabled,
            ]}
          >
            ‹
          </Text>
        </Pressable>

        <View style={styles.dateNavCenter}>
          <Text style={styles.dateValue}>{formatDateLabel(dateKey)}</Text>
        </View>

        <Pressable
          onPress={() => onChange(shiftDate(dateKey, 1))}
          style={({ pressed }) => [
            styles.weekNavButton,
            pressed && styles.weekNavButtonPressed,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.weekNavArrow}>›</Text>
        </Pressable>
      </View>

      {!isTodaySelected && (
        <View style={styles.todayShortcutRow}>
          <Pressable
            onPress={() => onChange(todayKey)}
            style={({ pressed }) => [
              styles.todayShortcutButton,
              pressed && styles.todayShortcutButtonPressed,
            ]}
          >
            <Text style={styles.todayShortcutText}>오늘로 이동</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.weekRow}>
        {dateStripDates.map((stripDateKey) => {
          const selected = stripDateKey === dateKey;
          const today = stripDateKey === todayKey;
          const disabled = !isDateKeyWithinMenuHistory(stripDateKey);
          const dayOfWeek = parseDateKey(stripDateKey).getDay();
          const weekday = WEEKDAY_LABELS[dayOfWeek];
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <Pressable
              disabled={disabled}
              key={stripDateKey}
              onPress={() => onChange(stripDateKey)}
              style={({ pressed }) => [
                styles.dayChip,
                selected && styles.dayChipActive,
                today && !selected && styles.dayChipToday,
                disabled && styles.dayChipDisabled,
                pressed && !selected && styles.dayChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayChipWeekday,
                  isSunday && styles.dayChipSunday,
                  isSaturday && styles.dayChipSaturday,
                  disabled && styles.dayChipWeekdayDisabled,
                  selected && styles.dayChipTextActive,
                ]}
              >
                {weekday}
              </Text>
              <Text
                style={[
                  styles.dayChipDate,
                  disabled && styles.dayChipDateDisabled,
                  selected && styles.dayChipTextActive,
                ]}
              >
                {formatDayOfMonth(stripDateKey)}
              </Text>
              {today ? (
                <View
                  style={[styles.todayDot, selected && styles.todayDotActive]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {!canGoPrevious ? (
        <Text style={styles.dateLimitNotice}>
          최근 3개월 식단까지만 조회할 수 있습니다.
        </Text>
      ) : null}
    </View>
  );
}
