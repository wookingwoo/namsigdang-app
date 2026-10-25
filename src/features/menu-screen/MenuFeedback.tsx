import { Text, View } from "react-native";
import { Action } from "./Action";
import { Icon } from "./Icon";
import { MEAL_TYPES } from "./constants";
import { styles } from "./styles";
import { colors } from "./theme";

type MenuFeedbackProps = {
  kind: "loading" | "error" | "empty";
  wide: boolean;
  onRetry: () => void;
};

export function MenuFeedback({ kind, wide, onRetry }: MenuFeedbackProps) {
  if (kind === "loading") {
    return <View role="status" accessibilityLiveRegion="polite" accessibilityLabel="식단을 불러오고 있어요.">
      <View style={styles.loadingRow}><Text style={styles.sectionMeta}>식단을 불러오고 있어요.</Text></View>
      <View style={[styles.menuGrid, wide && styles.menuGridWide]} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {MEAL_TYPES.map((meal) => <View key={meal} style={[styles.mealCard, styles.skeletonCard, wide && styles.mealCardWrapWide]}>
          <View style={[styles.skeleton, styles.skeletonTitle]} />
          <View style={[styles.skeleton, { width: "85%" }]} />
          <View style={[styles.skeleton, { width: "65%" }]} />
          <View style={[styles.skeleton, { width: "75%" }]} />
        </View>)}
      </View>
    </View>;
  }

  const error = kind === "error";
  return <View role={error ? "alert" : "status"} accessibilityLiveRegion={error ? "assertive" : "polite"} style={styles.feedbackCard}>
    <View style={[styles.feedbackIcon, error && styles.feedbackErrorIcon]}>
      <Icon name={error ? "cloud-offline-outline" : "restaurant-outline"} size={26} color={error ? colors.error : colors.brandDark} />
    </View>
    <Text accessibilityRole="header" style={styles.feedbackTitle}>{error ? "식단을 불러오지 못했어요" : "식단을 기다리고 있어요"}</Text>
    <Text style={styles.feedbackText}>{error ? "연결 상태를 확인한 뒤 다시 불러와 주세요." : "이 날짜의 식단이 아직 등록되지 않았어요.\n다른 날짜를 선택하거나 나중에 다시 확인해 주세요."}</Text>
    <Action accessibilityRole="button" accessibilityLabel="다시 불러오기" onPress={onRetry} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}>
      <Icon name="refresh-outline" size={18} color={colors.onBrand} />
      <Text style={styles.primaryButtonText}>다시 불러오기</Text>
    </Action>
  </View>;
}
