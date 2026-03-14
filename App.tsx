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
  { label: "은평관", value: "Eunpyeong" },
  { label: "동작관", value: "Dongjak" },
];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

const MENU_LOAD_ERROR_MESSAGE =
  "현재 식단 정보를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.";

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

function getDateStripDates(dateKey: string) {
  const selectedDate = parseDateKey(dateKey);
  const startDate = new Date(selectedDate);
  startDate.setDate(selectedDate.getDate() - 3);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + index);
    return formatDateKey(currentDate);
  });
}

function formatDayOfMonth(dateKey: string) {
  return `${parseDateKey(dateKey).getDate()}`;
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
            style={[styles.segmentButton, selected && styles.segmentButtonActive]}
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
}: {
  dateKey: string;
  onChange: (dateKey: string) => void;
}) {
  const todayKey = createTodayKey();
  const dateStripDates = getDateStripDates(dateKey);

  return (
    <View style={styles.dateCard}>
      <View style={styles.dateNavRow}>
        <Pressable
          onPress={() => onChange(shiftDate(dateKey, -1))}
          style={styles.weekNavButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.weekNavArrow}>‹</Text>
        </Pressable>
        <View style={styles.dateNavCenter}>
          <Text style={styles.dateValue}>{formatDateLabel(dateKey)}</Text>
        </View>
        <Pressable
          onPress={() => onChange(shiftDate(dateKey, 1))}
          style={styles.weekNavButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.weekNavArrow}>›</Text>
        </Pressable>
      </View>

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
}: {
  label: string;
  items: string[];
}) {
  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealLabel}>{label}</Text>
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
        <Text style={styles.emptyMealText}>등록된 식단이 없습니다.</Text>
      )}
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const [campus, setCampus] = useState<Campus>("Eunpyeong");
  const [dateKey, setDateKey] = useState(createTodayKey);
  const [menuDay, setMenuDay] = useState<MenuDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setError(null);

      try {
        const menu = await getMenuByDate(campus, dateKey);
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
  }, [campus, dateKey]);

  const isWideLayout = width >= 760;

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
        <View style={styles.controlsPanel}>
          <CampusToggle campus={campus} onChange={setCampus} />

          <WeekDatePicker dateKey={dateKey} onChange={setDateKey} />
        </View>

        {loading ? (
          <View style={styles.feedbackCard}>
            <ActivityIndicator size="large" color="#b14d27" />
            <Text style={styles.feedbackText}>식단을 불러오는 중입니다.</Text>
          </View>
        ) : error ? (
          <View style={styles.feedbackCard}>
            <Text style={styles.errorTitle}>데이터를 불러오지 못했습니다.</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={[styles.menuPanel, isWideLayout && styles.menuPanelWide]}>
            {(Object.keys(MEAL_LABELS) as MealType[]).map((mealType) => (
              <View
                key={mealType}
                style={[
                  isWideLayout && styles.mealSectionWide,
                  mealType !== "dinner" &&
                    (isWideLayout
                      ? styles.mealSectionWideDivider
                      : styles.mealSectionDivider),
                ]}
              >
                <MealCard
                  label={MEAL_LABELS[mealType]}
                  items={menuDay?.[mealType] ?? []}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4ede5",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 28 : 12,
    paddingBottom: 24,
    gap: 14,
  },
  containerWide: {
    width: "100%",
    maxWidth: 920,
    alignSelf: "center",
  },
  controlsPanel: {
    backgroundColor: "#fffaf5",
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e6d5c5",
    gap: 14,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#efe2d5",
    borderRadius: 18,
    padding: 5,
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  segmentButtonActive: {
    backgroundColor: "#b14d27",
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6f4330",
  },
  segmentButtonTextActive: {
    color: "#fff8f2",
  },
  dateCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e7d7c8",
    gap: 16,
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateNavCenter: {
    flex: 1,
    alignItems: "center",
  },
  dateValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2b140e",
    textAlign: "center",
  },
  weekNavButton: {
    width: 44,
    height: 44,
    backgroundColor: "#f5ece4",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekNavArrow: {
    fontSize: 28,
    lineHeight: 34,
    color: "#714634",
    fontWeight: "400",
    marginTop: -2,
  },
  weekRow: {
    flexDirection: "row",
    gap: 5,
  },
  dayChip: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#fbf3ec",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#ead9cd",
    paddingVertical: 12,
    alignItems: "center",
    gap: 3,
    minHeight: 70,
    justifyContent: "center",
  },
  dayChipToday: {
    borderColor: "#b14d27",
    backgroundColor: "#fff4ee",
  },
  dayChipActive: {
    backgroundColor: "#b14d27",
    borderColor: "#b14d27",
  },
  dayChipPressed: {
    backgroundColor: "#f0e0d6",
  },
  dayChipWeekday: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8f624d",
  },
  dayChipSunday: {
    color: "#c0392b",
  },
  dayChipSaturday: {
    color: "#2980b9",
  },
  dayChipDate: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2d170f",
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#b14d27",
    marginTop: 1,
  },
  todayDotActive: {
    backgroundColor: "rgba(255,248,242,0.8)",
  },
  dayChipTextActive: {
    color: "#fff8f2",
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#ead7ca",
    alignItems: "center",
    gap: 12,
  },
  feedbackText: {
    color: "#6d4836",
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#5d1b14",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#7b3b34",
    textAlign: "center",
  },
  menuPanel: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ead7ca",
  },
  menuPanelWide: {
    flexDirection: "row",
  },
  mealSection: {
    gap: 10,
  },
  mealSectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0e1d5",
    marginBottom: 14,
    paddingBottom: 14,
  },
  mealSectionWide: {
    flex: 1,
  },
  mealSectionWideDivider: {
    borderRightWidth: 1,
    borderRightColor: "#f0e1d5",
    marginRight: 14,
    paddingRight: 14,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealLabel: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2b140e",
  },
  mealMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9a725d",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  menuBullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#b14d27",
    marginTop: 7,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#5c3c31",
  },
  emptyMealText: {
    fontSize: 14,
    color: "#967262",
  },
});
