import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getMenuByDate } from "./src/services/menu";
import type { Campus, MealType, MenuDay } from "./src/types/menu";

const CAMPUS_OPTIONS: Array<{ label: string; value: Campus }> = [
  { label: "은평관", value: "Eunpyeon" },
  { label: "동작관", value: "Dongjak" },
];

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

const dayFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
});

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

function MealCard({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealLabel}>{label}</Text>
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
  const [campus, setCampus] = useState<Campus>("Eunpyeon");
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
          setMenuDay(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "식단을 불러오지 못했습니다.",
          );
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

  const campusName = useMemo(() => {
    return CAMPUS_OPTIONS.find((option) => option.value === campus)?.label ?? campus;
  }, [campus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>남도학숙 식단 서비스</Text>
          <Text style={styles.title}>남식당</Text>
          <Text style={styles.subtitle}>
            {campusName} 식단을 웹, 안드로이드, iOS에서 한 번에 확인합니다.
          </Text>
        </View>

        <CampusToggle campus={campus} onChange={setCampus} />

        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>선택한 날짜</Text>
          <Text style={styles.dateValue}>{formatDateLabel(dateKey)}</Text>
          <View style={styles.dateActions}>
            <Pressable
              onPress={() => setDateKey((current) => shiftDate(current, -1))}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>이전 날</Text>
            </Pressable>
            <Pressable
              onPress={() => setDateKey(createTodayKey())}
              style={[styles.dateButton, styles.dateButtonPrimary]}
            >
              <Text style={[styles.dateButtonText, styles.dateButtonPrimaryText]}>
                오늘
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDateKey((current) => shiftDate(current, 1))}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>다음 날</Text>
            </Pressable>
          </View>
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
          <View style={styles.mealsWrapper}>
            {(Object.keys(MEAL_LABELS) as MealType[]).map((mealType) => (
              <MealCard
                key={mealType}
                label={MEAL_LABELS[mealType]}
                items={menuDay?.[mealType] ?? []}
              />
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>데이터 구조</Text>
          <Text style={styles.infoText}>
            `menu/{campus}/year_YYYY/month_MM` 문서에서 날짜별 필드를 읽습니다.
          </Text>
          <Text style={styles.infoText}>
            예시: `eu20260314a`, `do20260314b`, `do20260314c`
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6efe7",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 36 : 16,
    paddingBottom: 40,
    gap: 18,
  },
  hero: {
    backgroundColor: "#fff7ef",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e7cfbd",
  },
  kicker: {
    fontSize: 13,
    color: "#a2603c",
    marginBottom: 8,
    fontWeight: "700",
  },
  title: {
    fontSize: 38,
    color: "#35140a",
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#68473b",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f0dfd0",
    borderRadius: 20,
    padding: 6,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
  },
  segmentButtonActive: {
    backgroundColor: "#b14d27",
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#764832",
  },
  segmentButtonTextActive: {
    color: "#fff9f4",
  },
  dateCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ead7ca",
    gap: 12,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#a2603c",
  },
  dateValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2b140e",
  },
  dateActions: {
    flexDirection: "row",
    gap: 8,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d6bbaa",
    backgroundColor: "#fff8f2",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  dateButtonPrimary: {
    backgroundColor: "#35140a",
    borderColor: "#35140a",
  },
  dateButtonText: {
    color: "#6d4836",
    fontWeight: "700",
  },
  dateButtonPrimaryText: {
    color: "#fff6ef",
  },
  feedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
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
  mealsWrapper: {
    gap: 14,
  },
  mealCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ead7ca",
    gap: 12,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealLabel: {
    fontSize: 21,
    fontWeight: "800",
    color: "#2b140e",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  menuBullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#b14d27",
    marginTop: 7,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#5c3c31",
  },
  emptyMealText: {
    fontSize: 15,
    color: "#967262",
  },
  infoCard: {
    backgroundColor: "#35140a",
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  infoTitle: {
    color: "#fff3e6",
    fontSize: 18,
    fontWeight: "800",
  },
  infoText: {
    color: "#eed9cc",
    fontSize: 14,
    lineHeight: 20,
  },
});
