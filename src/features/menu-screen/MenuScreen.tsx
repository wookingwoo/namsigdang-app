import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
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
import { colors } from "./theme";
import { useMenuScreen } from "./useMenuScreen";

const DEVELOPER_EMAIL = "contact@wookingwoo.com";
const GITHUB_URL = "https://github.com/wookingwoo/namsigdang-app";
const GITHUB_REPOSITORY = "wookingwoo/namsigdang-app";
const DEVELOPER_URL = "https://wookingwoo.com";

export function MenuScreen() {
  const [aboutVisible, setAboutVisible] = useState(false);
  const { width } = useWindowDimensions();
  const { campus, setCampus, dateKey, setDateKey, menuDay, loading, error } =
    useMenuScreen();

  const isWideLayout = width >= 760;
  const isCompactDatePicker = width < 520;

  return (
    <LinearGradient colors={colors.backgroundGradient} style={styles.screen}>
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
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>
                  남식당{" "}
                  <Text style={styles.headerTitleMeta}>남도학숙 식단정보</Text>
                </Text>
                <LinearGradient
                  colors={[colors.mint, colors.gold, colors.pink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.headerAccentBar}
                />
              </View>
              <Pressable
                onPress={() => setAboutVisible(true)}
                style={({ pressed }) => [
                  styles.headerInfoButton,
                  pressed && styles.headerInfoButtonPressed,
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={17}
                  color={colors.ink}
                />
                <Text style={styles.headerInfoButtonText}>정보</Text>
              </Pressable>
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
                <ActivityIndicator size="large" color={colors.ink} />
                <Text style={styles.feedbackText}>식단을 불러오는 중입니다.</Text>
              </View>
            ) : error ? (
              <View style={styles.feedbackCard}>
                <View style={styles.errorIconWrap}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={26}
                    color={colors.pinkDark}
                  />
                </View>
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
                      mealType={mealType}
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

      <Modal
        visible={aboutVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAboutVisible(false)}
      >
        <LinearGradient colors={colors.backgroundGradient} style={styles.screen}>
          <SafeAreaView style={styles.aboutModalSafeArea}>
            <View style={styles.aboutModalHeader}>
              <Text style={styles.aboutModalTitle}>서비스 정보</Text>
              <Pressable
                onPress={() => setAboutVisible(false)}
                style={({ pressed }) => [
                  styles.aboutModalCloseButton,
                  pressed && styles.aboutModalCloseButtonPressed,
                ]}
                accessibilityLabel="닫기"
              >
                <Ionicons name="close" size={20} color={colors.ink} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.aboutModalContent}
            >
              <View
                style={[
                  styles.aboutModalBody,
                  isWideLayout && styles.aboutModalBodyWide,
                ]}
              >
                <View style={styles.infoCard}>
                  <View style={styles.infoCardHeader}>
                    <Image
                      source={require("../../../assets/favicon.png")}
                      style={styles.infoCardIcon}
                    />
                    <View style={styles.infoCardTitleWrap}>
                      <Text style={styles.infoEyebrow}>남식당</Text>
                      <Text style={styles.infoTitle}>
                        남도학숙 식단 정보
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.infoDescription}>
                    남식당은 남도학숙 사생들을 위한 식단 정보 생활 편의 공익 서비스입니다. 사용 중 불편한 점이나 버그, 건의사항이 있다면 이메일로 편하게 알려주세요. GitHub Issue나 PR을 통한 오픈소스 기여도 환영합니다.
                  </Text>

                  <View style={styles.infoLinkList}>
                    <Pressable
                      onPress={() => void Linking.openURL(DEVELOPER_URL)}
                      style={({ pressed }) => [
                        styles.infoLinkRow,
                        pressed && styles.infoLinkRowPressed,
                      ]}
                    >
                      <View style={styles.infoLinkIconWrap}>
                        <Ionicons name="person-outline" size={20} color={colors.mintDark} />
                      </View>
                      <View style={styles.infoLinkTextWrap}>
                        <Text style={styles.infoLinkLabel}>개발자</Text>
                        <Text style={styles.infoLinkValue}>wookingwoo</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.inkFaint}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        void Linking.openURL(`mailto:${DEVELOPER_EMAIL}`)
                      }
                      style={({ pressed }) => [
                        styles.infoLinkRow,
                        pressed && styles.infoLinkRowPressed,
                      ]}
                    >
                      <View style={styles.infoLinkIconWrap}>
                        <Ionicons name="mail-outline" size={20} color={colors.goldDark} />
                      </View>
                      <View style={styles.infoLinkTextWrap}>
                        <Text style={styles.infoLinkLabel}>연락처</Text>
                        <Text style={styles.infoLinkValue}>{DEVELOPER_EMAIL}</Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.inkFaint}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => void Linking.openURL(GITHUB_URL)}
                      style={({ pressed }) => [
                        styles.infoLinkRow,
                        pressed && styles.infoLinkRowPressed,
                      ]}
                    >
                      <View style={styles.infoLinkIconWrap}>
                        <Ionicons name="logo-github" size={20} color={colors.ink} />
                      </View>
                      <View style={styles.infoLinkTextWrap}>
                        <Text style={styles.infoLinkLabel}>GitHub</Text>
                        <Text style={styles.infoLinkValue}>
                          {GITHUB_REPOSITORY}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.inkFaint}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}
