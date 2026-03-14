import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MealCard } from "./MealCard";
import { CampusToggle } from "./CampusToggle";
import { MEAL_LABELS, MEAL_TYPES } from "./constants";
import { WeekDatePicker } from "./WeekDatePicker";
import { styles } from "./styles";
import { useMenuScreen } from "./useMenuScreen";

export function MenuScreen() {
  const { width } = useWindowDimensions();
  const { campus, setCampus, dateKey, setDateKey, menuDay, loading, error } =
    useMenuScreen();

  const isWideLayout = width >= 760;
  const isCompactDatePicker = width < 520;

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
          <View style={styles.headerRow}>
            <View style={styles.headerIconWrap}>
              <Image
                source={require("../../../assets/favicon.png")}
                style={styles.headerIconImage}
              />
            </View>
            <Text style={styles.headerTitle}>
              남식당{" "}
              <Text style={styles.headerTitleMeta}>(남도학숙 식단정보)</Text>
            </Text>
          </View>
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
              {MEAL_TYPES.map((mealType) => (
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
