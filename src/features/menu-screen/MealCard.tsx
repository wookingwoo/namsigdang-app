import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import type { MealType } from "../../types/menu";
import { styles } from "./styles";
import { colors, mealTheme } from "./theme";

type MealCardProps = {
  mealType: MealType;
  label: string;
  items: string[];
  stretch?: boolean;
};

export function MealCard({ mealType, label, items, stretch = false }: MealCardProps) {
  const theme = mealTheme[mealType];

  return (
    <View style={[styles.mealCard, stretch && styles.mealCardStretch]}>
      <View style={styles.mealHeader}>
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mealIconCircle}
        >
          <Ionicons name={theme.icon} size={20} color={colors.onInk} />
        </LinearGradient>
        <View style={styles.mealHeaderText}>
          <Text style={styles.mealLabel}>{label}</Text>
          <Text style={styles.mealMeta}>
            {items.length > 0 ? `${items.length}개 메뉴` : "미등록"}
          </Text>
        </View>
      </View>

      {items.length > 0 ? (
        items.map((item) => (
          <View key={`${label}-${item}`} style={styles.menuItemRow}>
            <View style={[styles.menuBullet, { backgroundColor: theme.dark }]} />
            <Text style={styles.menuItemText}>{item}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyMealCard}>
          <Ionicons name="cafe-outline" size={22} color={colors.inkFaint} />
          <Text style={styles.emptyMealText}>등록된 식단이 없습니다.</Text>
        </View>
      )}
    </View>
  );
}
