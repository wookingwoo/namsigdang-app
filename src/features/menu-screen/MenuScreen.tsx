import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { AboutSheet } from "./AboutSheet";
import { Action } from "./Action";
import { CampusToggle } from "./CampusToggle";
import { Icon } from "./Icon";
import { MealCard } from "./MealCard";
import { MEAL_LABELS, MEAL_TYPES, getCampusLabel } from "./constants";
import { createTodayKey } from "./date";
import { styles } from "./styles";
import { colors, layout } from "./theme";
import { useMenuScreen } from "./useMenuScreen";
import { WeekDatePicker } from "./WeekDatePicker";

export function MenuScreen() {
  const [aboutVisible, setAboutVisible] = useState(false);
  const { width, fontScale } = useWindowDimensions();
  const { campus, setCampus, dateKey, setDateKey, menuDay, loading, error } = useMenuScreen();
  const wide = width >= layout.wideBreakpoint && fontScale < 1.5;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView style={styles.scroll} contentContainerStyle={[styles.container, wide && styles.containerWide]}>
          <View style={styles.headerRow}>
            <Image source={require("../../../assets/favicon.png")} style={styles.headerIconImage} accessible={false} />
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>남식당</Text>
              <Text style={styles.headerTitleMeta}>남도학숙 식단 안내</Text>
            </View>
            <Action accessibilityRole="button" accessibilityLabel="서비스 정보" onPress={() => setAboutVisible(true)}
              style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}>
              <Icon name="information-circle-outline" size={21} color={colors.inkSoft} />
              {width >= 520 && <Text style={styles.infoButtonText}>서비스 정보</Text>}
            </Action>
          </View>

          <View style={[styles.intro, wide && styles.introWide]}>
            <View style={styles.introText}>
              <Text accessibilityRole="header" style={[styles.pageTitle, wide && styles.pageTitleWide]}>{dateKey === createTodayKey() ? "오늘의 식단" : "선택한 날의 식단"}</Text>
              <Text style={styles.subtitle}>아침부터 저녁까지, 한눈에 확인하세요.</Text>
            </View>
            {campus ? <CampusToggle campus={campus} onChange={setCampus} wide={wide} /> : <View style={styles.controlsPlaceholder} />}
          </View>

          <WeekDatePicker dateKey={dateKey} onChange={setDateKey} compact={width < 520 || fontScale >= 1.5} />

          <View style={styles.menuSection}>
            <View style={styles.menuSectionHeading}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>{campus ? getCampusLabel(campus) : "학숙"} 식단</Text>
              <Text style={styles.sectionMeta}>아침 · 점심 · 저녁</Text>
            </View>
            {loading ? (
              <View role="status" accessibilityLiveRegion="polite" style={styles.feedbackCard}>
                <ActivityIndicator color={colors.brand} />
                <Text style={styles.feedbackText}>식단을 불러오고 있어요.</Text>
              </View>
            ) : error ? (
              <View accessibilityRole="alert" style={styles.feedbackCard}>
                <View style={[styles.feedbackIcon, styles.feedbackErrorIcon]}><Icon name="cloud-offline-outline" size={26} color={colors.error} /></View>
                <Text style={styles.feedbackTitle}>식단을 불러오지 못했어요</Text>
                <Text style={styles.feedbackText}>{error}</Text>
              </View>
            ) : (
              <View style={[styles.menuGrid, wide && styles.menuGridWide]}>
                {MEAL_TYPES.map((mealType) => <View key={mealType} style={[styles.mealCardWrap, wide && styles.mealCardWrapWide]}>
                  <MealCard mealType={mealType} label={MEAL_LABELS[mealType]} items={menuDay?.[mealType] ?? []} stretch={wide} />
                </View>)}
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>식단은 학숙 사정에 따라 변경될 수 있어요.</Text>
            <Text style={styles.footerBrand}>남식당</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      <AboutSheet visible={aboutVisible} onClose={() => setAboutVisible(false)} compact={width < 520} />
    </View>
  );
}
