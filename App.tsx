import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { getMenuByDate } from "./src/services/menu";
import type { Campus, MealType, MenuDay } from "./src/types/menu";

const CAMPUS_OPTIONS: Array<{ label: string; value: Campus }> = [
  { label: "동작관", value: "Dongjak" },
  { label: "은평관", value: "Eunpyeong" },
];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

const MENU_LOAD_ERROR_MESSAGE =
  "현재 식단 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.";
const CAMPUS_STORAGE_KEY = "selectedCampus";

const dayFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
});
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function createTodayKey() {
  return formatDateKey(new Date());
}

function shiftDate(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return formatDateKey(date);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey: string) {
  const date = parseDateKey(dateKey);
  return dayFormatter.format(date);
}

function getDateStripDates(dateKey: string, visibleDays: number) {
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

function formatDayOfMonth(dateKey: string) {
  return `${parseDateKey(dateKey).getDate()}`;
}

function getCampusLabel(campus: Campus) {
  return CAMPUS_OPTIONS.find((option) => option.value === campus)?.label ?? campus;
}

function isCampus(value: string): value is Campus {
  return CAMPUS_OPTIONS.some((option) => option.value === value);
}

function CampusToggle({
  campus,
  onChange,
}: {
  campus: Campus;
  onChange: (campus: Campus) => void;
}) {
  return (
    <View style={styles.segmentedControl}>
      {CAMPUS_OPTIONS.map((option) => {
        const selected = campus === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentButton,
              selected && styles.segmentButtonActive,
              pressed && !selected && styles.segmentButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentButtonText,
                selected && styles.segmentButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function WeekDatePicker({
  dateKey,
  onChange,
  compact,
}: {
  dateKey: string;
  onChange: (dateKey: string) => void;
  compact: boolean;
}) {
  const todayKey = createTodayKey();
  const dateStripDates = getDateStripDates(dateKey, compact ? 5 : 7);
  const isTodaySelected = dateKey === todayKey;

  return (
    <View style={styles.dateCard}>
      <View style={styles.dateNavRow}>
        <Pressable
          onPress={() => onChange(shiftDate(dateKey, -1))}
          style={({ pressed }) => [
            styles.weekNavButton,
            pressed && styles.weekNavButtonPressed,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.weekNavArrow}>‹</Text>
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
          const dayOfWeek = parseDateKey(stripDateKey).getDay();
          const weekday = WEEKDAY_LABELS[dayOfWeek];
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <Pressable
              key={stripDateKey}
              onPress={() => onChange(stripDateKey)}
              style={({ pressed }) => [
                styles.dayChip,
                selected && styles.dayChipActive,
                today && !selected && styles.dayChipToday,
                pressed && !selected && styles.dayChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayChipWeekday,
                  isSunday && styles.dayChipSunday,
                  isSaturday && styles.dayChipSaturday,
                  selected && styles.dayChipTextActive,
                ]}
              >
                {weekday}
              </Text>
              <Text
                style={[
                  styles.dayChipDate,
                  selected && styles.dayChipTextActive,
                ]}
              >
                {formatDayOfMonth(stripDateKey)}
              </Text>
              {today && (
                <View
                  style={[styles.todayDot, selected && styles.todayDotActive]}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MealCard({
  label,
  items,
  stretch,
}: {
  label: string;
  items: string[];
  stretch?: boolean;
}) {
  return (
    <View style={[styles.mealCard, stretch && styles.mealCardStretch]}>
      <View style={styles.mealHeader}>
        <View style={styles.mealBadge}>
          <Text style={styles.mealBadgeText}>{label}</Text>
        </View>
        <Text style={styles.mealMeta}>
          {items.length > 0 ? `${items.length}개 메뉴` : "미등록"}
        </Text>
      </View>

      {items.length > 0 ? (
        items.map((item) => (
          <View key={`${label}-${item}`} style={styles.menuItemRow}>
            <View style={styles.menuBullet} />
            <Text style={styles.menuItemText}>{item}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyMealCard}>
          <Text style={styles.emptyMealText}>등록된 식단이 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [dateKey, setDateKey] = useState(createTodayKey);
  const [menuDay, setMenuDay] = useState<MenuDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCampusHydrated, setIsCampusHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreCampus() {
      try {
        const savedCampus = await AsyncStorage.getItem(CAMPUS_STORAGE_KEY);
        if (!cancelled) {
          setCampus(savedCampus && isCampus(savedCampus) ? savedCampus : "Eunpyeong");
        }
      } catch (storageError) {
        if (__DEV__) {
          console.error("Failed to restore campus:", storageError);
        }
        if (!cancelled) {
          setCampus("Eunpyeong");
        }
      } finally {
        if (!cancelled) {
          setIsCampusHydrated(true);
        }
      }
    }

    void restoreCampus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isCampusHydrated || !campus) {
      return;
    }

    const selectedCampus = campus;

    async function persistCampus() {
      try {
        await AsyncStorage.setItem(CAMPUS_STORAGE_KEY, selectedCampus);
      } catch (storageError) {
        if (__DEV__) {
          console.error("Failed to persist campus:", storageError);
        }
      }
    }

    void persistCampus();
  }, [campus, isCampusHydrated]);

  useEffect(() => {
    if (!isCampusHydrated || !campus) {
      return;
    }

    const selectedCampus = campus;
    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setError(null);

      try {
        const menu = await getMenuByDate(selectedCampus, dateKey);
        if (!cancelled) {
          setMenuDay(menu);
        }
      } catch (loadError) {
        if (!cancelled) {
          if (__DEV__) {
            console.error("Failed to load menu:", loadError);
          }

          setMenuDay(null);
          setError(MENU_LOAD_ERROR_MESSAGE);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMenu();

    return () => {
      cancelled = true;
    };
  }, [campus, dateKey, isCampusHydrated]);

  const isWideLayout = width >= 760;
  const isCompactDatePicker = width < 520;
  const campusLabel = campus ? getCampusLabel(campus) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          isWideLayout && styles.containerWide,
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>남식당 식단</Text>
          {campusLabel ? <Text style={styles.headerSubtitle}>{campusLabel}</Text> : null}
        </View>

        <View style={styles.surfaceCard}>
          {campus ? (
            <CampusToggle campus={campus} onChange={setCampus} />
          ) : (
            <View style={styles.controlsPlaceholder} />
          )}

          <WeekDatePicker
            dateKey={dateKey}
            onChange={setDateKey}
            compact={isCompactDatePicker}
          />
        </View>

        <View style={styles.surfaceCard}>
          {loading ? (
            <View style={styles.feedbackCard}>
              <ActivityIndicator size="large" color="#2b6fe8" />
              <Text style={styles.feedbackText}>식단을 불러오는 중입니다.</Text>
            </View>
          ) : error ? (
            <View style={styles.feedbackCard}>
              <Text style={styles.errorTitle}>데이터를 불러오지 못했습니다.</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={[styles.menuGrid, isWideLayout && styles.menuGridWide]}>
              {(Object.keys(MEAL_LABELS) as MealType[]).map((mealType) => (
                  <View
                    key={mealType}
                    style={[styles.mealCardWrap, isWideLayout && styles.mealCardWrapWide]}
                  >
                    <MealCard
                      label={MEAL_LABELS[mealType]}
                      items={menuDay?.[mealType] ?? []}
                      stretch={isWideLayout}
                    />
                  </View>
                ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf2ff",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 28 : 12,
    paddingBottom: 28,
    gap: 16,
  },
  containerWide: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 6,
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f2d5e",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#5f7da9",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#edf4ff",
    borderRadius: 20,
    padding: 6,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 15,
  },
  segmentButtonActive: {
    backgroundColor: "#2b6fe8",
  },
  segmentButtonPressed: {
    backgroundColor: "#dceaff",
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4e6f9e",
  },
  segmentButtonTextActive: {
    color: "#f5f9ff",
  },
  controlsPlaceholder: {
    height: 58,
  },
  surfaceCard: {
    backgroundColor: "#fafdff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#d8e7ff",
    padding: 16,
    gap: 16,
    shadowColor: "#7ca9e8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 2,
  },
  sectionHeader: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f2d5e",
  },
  dateCard: {
    gap: 16,
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateNavCenter: {
    flex: 1,
    alignItems: "center",
  },
  dateValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#12356b",
    textAlign: "center",
  },
  weekNavButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#edf4ff",
    borderWidth: 1,
    borderColor: "#d4e4ff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekNavButtonPressed: {
    backgroundColor: "#dceaff",
  },
  weekNavArrow: {
    fontSize: 28,
    lineHeight: 32,
    color: "#1958b7",
    fontWeight: "400",
    marginTop: -2,
  },
  todayShortcutRow: {
    alignItems: "flex-end",
  },
  todayShortcutButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#edf4ff",
    borderWidth: 1,
    borderColor: "#cfe0ff",
  },
  todayShortcutButtonPressed: {
    backgroundColor: "#dceaff",
  },
  todayShortcutText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a58ba",
  },
  weekRow: {
    flexDirection: "row",
    gap: 6,
  },
  dayChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 74,
    backgroundColor: "#f6faff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#d8e7ff",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayChipToday: {
    backgroundColor: "#edf4ff",
    borderColor: "#8fb8ff",
  },
  dayChipActive: {
    backgroundColor: "#2b6fe8",
    borderColor: "#2b6fe8",
  },
  dayChipPressed: {
    backgroundColor: "#e7f0ff",
  },
  dayChipWeekday: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6c84ab",
  },
  dayChipSunday: {
    color: "#cf4d5c",
  },
  dayChipSaturday: {
    color: "#2d74d7",
  },
  dayChipDate: {
    fontSize: 18,
    fontWeight: "900",
    color: "#143466",
  },
  dayChipTextActive: {
    color: "#f5f9ff",
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2b6fe8",
    marginTop: 2,
  },
  todayDotActive: {
    backgroundColor: "rgba(245, 249, 255, 0.88)",
  },
  feedbackCard: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#f4f8ff",
  },
  feedbackText: {
    fontSize: 15,
    color: "#5d759d",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#193b72",
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5e759f",
    textAlign: "center",
  },
  menuGrid: {
    gap: 12,
  },
  menuGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  mealCardWrap: {
    width: "100%",
  },
  mealCardWrapWide: {
    flex: 1,
  },
  mealCard: {
    backgroundColor: "#f4f8ff",
    borderColor: "#d8e7ff",
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  mealCardStretch: {
    height: "100%",
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  mealBadge: {
    backgroundColor: "#dceaff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  mealBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1b58b8",
  },
  mealMeta: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6e86ab",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  menuBullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#2b6fe8",
    marginTop: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#21406d",
  },
  emptyMealCard: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.62)",
  },
  emptyMealText: {
    fontSize: 14,
    color: "#6f86a7",
  },
});
