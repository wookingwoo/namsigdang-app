import { Text, View } from "react-native";
import { Action } from "./Action";
import { Icon } from "./Icon";
import { WEEKDAY_LABELS } from "./constants";
import { createMenuHistoryEndKey, createMenuHistoryStartKey, createTodayKey, formatDateLabel, formatDayOfMonth, getDateStripDates, isDateKeyWithinMenuHistory, parseDateKey, shiftDate } from "./date";
import { styles } from "./styles";
import { colors } from "./theme";

type WeekDatePickerProps = { dateKey: string; onChange: (dateKey: string) => void; compact: boolean };

export function WeekDatePicker({ dateKey, onChange, compact }: WeekDatePickerProps) {
  const todayKey = createTodayKey();
  const dates = getDateStripDates(dateKey, compact ? 5 : 7, createMenuHistoryStartKey(), createMenuHistoryEndKey());
  const isToday = dateKey === todayKey;
  const previous = shiftDate(dateKey, -1);
  const next = shiftDate(dateKey, 1);
  const canPrevious = isDateKeyWithinMenuHistory(previous);
  const canNext = isDateKeyWithinMenuHistory(next);

  return (
    <View style={styles.dateCard}>
      <View style={styles.dateNavRow}>
        <View style={styles.dateNavCenter}>
          <Text style={styles.dateYear}>{parseDateKey(dateKey).getFullYear()}년</Text>
          <Text accessibilityRole="header" style={styles.dateValue}>{formatDateLabel(dateKey)}</Text>
        </View>
        <Action accessibilityRole="button" accessibilityLabel="이전 날짜" accessibilityState={{ disabled: !canPrevious }} disabled={!canPrevious} onPress={() => onChange(previous)}
          style={({ pressed }) => [styles.weekNavButton, !canPrevious && styles.disabled, pressed && styles.pressed]}>
          <Icon name="chevron-back" size={21} color={colors.ink} />
        </Action>
        <Action accessibilityRole="button" accessibilityLabel="다음 날짜" accessibilityState={{ disabled: !canNext }} disabled={!canNext} onPress={() => onChange(next)}
          style={({ pressed }) => [styles.weekNavButton, !canNext && styles.disabled, pressed && styles.pressed]}>
          <Icon name="chevron-forward" size={21} color={colors.ink} />
        </Action>
      </View>
      <View style={styles.weekRow}>
        {dates.map((key) => {
          const selected = key === dateKey;
          const today = key === todayKey;
          const disabled = !isDateKeyWithinMenuHistory(key);
          const weekday = parseDateKey(key).getDay();
          return (
            <Action key={key} accessibilityRole="button"
              accessibilityLabel={formatDateLabel(key) + (today ? ", 오늘" : "") + (selected ? ", 선택됨" : "")}
              accessibilityState={{ selected, disabled }} disabled={disabled} onPress={() => onChange(key)}
              style={({ pressed }) => [styles.dayChip, today && styles.dayChipToday, selected && styles.dayChipActive, disabled && styles.dayChipDisabled, pressed && !selected && styles.pressed]}>
              <Text style={[styles.dayChipWeekday, weekday === 0 && styles.dayChipSunday, weekday === 6 && styles.dayChipSaturday, selected && styles.dayChipTextActive]}>{WEEKDAY_LABELS[weekday]}</Text>
              <Text style={[styles.dayChipDate, selected && styles.dayChipTextActive]}>{formatDayOfMonth(key)}</Text>
              {today ? <Text style={[styles.todayIndicator, selected && styles.dayChipTextActive]}>오늘</Text> : <View style={styles.dayIndicatorSpace} />}
            </Action>
          );
        })}
      </View>
      <View style={styles.dateToolbar}>
        <Text style={styles.dateHint}>다른 날의 식단도 확인해 보세요.</Text>
        <Action accessibilityRole="button" accessibilityLabel="오늘로 이동" disabled={isToday} accessibilityState={{ disabled: isToday }} onPress={() => onChange(todayKey)}
          style={({ pressed }) => [styles.todayShortcutButton, isToday && styles.todayShortcutDisabled, pressed && styles.pressed]}>
          <Icon name="today-outline" size={16} color={isToday ? colors.inkSoft : colors.brandDark} />
          <Text style={[styles.todayShortcutText, isToday && styles.todayShortcutTextDisabled]}>오늘</Text>
        </Action>
      </View>
      {(!canPrevious || !canNext) && <Text style={styles.dateLimitNotice}>오늘 기준 3개월 전부터 3개월 후까지 조회할 수 있어요.</Text>}
    </View>
  );
}
