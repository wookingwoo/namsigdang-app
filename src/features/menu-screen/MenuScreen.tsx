import { useState } from "react";
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
import { useMenuScreen } from "./useMenuScreen";

const DEVELOPER_EMAIL = "contact@wookingwoo.com";
const GITHUB_URL = "https://github.com/wookingwoo/namsigdang-app";

export function MenuScreen() {
  const [aboutVisible, setAboutVisible] = useState(false);
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
            <View style={styles.headerBrand}>
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
            <Pressable
              onPress={() => setAboutVisible(true)}
              style={({ pressed }) => [
                styles.headerInfoButton,
                pressed && styles.headerInfoButtonPressed,
              ]}
            >
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

      <Modal
        visible={aboutVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAboutVisible(false)}
      >
        <SafeAreaView style={styles.aboutModalSafeArea}>
          <View style={styles.aboutModalHeader}>
            <Text style={styles.aboutModalTitle}>서비스 정보</Text>
            <Pressable
              onPress={() => setAboutVisible(false)}
              style={({ pressed }) => [
                styles.aboutModalCloseButton,
                pressed && styles.aboutModalCloseButtonPressed,
              ]}
            >
              <Text style={styles.aboutModalCloseButtonText}>닫기</Text>
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
                    <Text style={styles.infoEyebrow}>Service</Text>
                    <Text style={styles.infoTitle}>
                      남도학숙 생활 편익을 위한 공익 서비스
                    </Text>
                  </View>
                </View>

                <Text style={styles.infoDescription}>
                  남식당은 남도학숙 학생들이 식단 정보를 더 빠르게 확인할 수 있도록
                  만든 생활 편의 서비스입니다.
                </Text>

                <View style={styles.infoMetaGroup}>
                  <Text style={styles.infoMetaLabel}>개발자</Text>
                  <Text style={styles.infoMetaValue}>wookingwoo</Text>
                </View>

                <View style={styles.infoMetaGroup}>
                  <Text style={styles.infoMetaLabel}>연락처</Text>
                  <Text style={styles.infoMetaValue}>{DEVELOPER_EMAIL}</Text>
                </View>

                <View style={styles.infoMetaGroup}>
                  <Text style={styles.infoMetaLabel}>GitHub</Text>
                  <Text style={styles.infoMetaValue}>{GITHUB_URL}</Text>
                </View>

                <View style={styles.infoActionRow}>
                  <Pressable
                    onPress={() =>
                      void Linking.openURL(`mailto:${DEVELOPER_EMAIL}`)
                    }
                    style={({ pressed }) => [
                      styles.infoActionButton,
                      pressed && styles.infoActionButtonPressed,
                    ]}
                  >
                    <Text style={styles.infoActionText}>이메일</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void Linking.openURL(GITHUB_URL)}
                    style={({ pressed }) => [
                      styles.infoActionButton,
                      pressed && styles.infoActionButtonPressed,
                    ]}
                  >
                    <Text style={styles.infoActionText}>GitHub 열기</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
