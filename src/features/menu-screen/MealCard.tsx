import { Text, View } from "react-native";
import type { MealType } from "../../types/menu";
import { Icon } from "./Icon";
import { styles } from "./styles";
import { mealTheme } from "./theme";

type MealCardProps = { mealType: MealType; label: string; items: string[]; stretch?: boolean };

export function MealCard({ mealType, label, items, stretch = false }: MealCardProps) {
  const theme = mealTheme[mealType];
  return (
    <View style={[styles.mealCard, stretch && styles.mealCardStretch]}>
      <View style={styles.mealHeader}>
        <View style={[styles.mealIconCircle, { backgroundColor: theme.tint }]}><Icon name={theme.icon} size={23} color={theme.dark} /></View>
        <View style={styles.mealHeaderText}>
          <Text accessibilityRole="header" aria-level={3} style={styles.mealLabel}>{label}</Text>
          <Text style={styles.mealMeta}>{theme.caption}</Text>
        </View>
      </View>
      {items.length ? (
        <View style={styles.menuList}>
          {items.map((item, index) => <View key={index + "-" + item} style={styles.menuItemRow}>
            <View style={styles.menuBullet} />
            <Text style={styles.menuItemText} selectable>{item}</Text>
          </View>)}
        </View>
      ) : (
        <View style={styles.emptyMealCard}>
          <Text style={styles.emptyMealText}>등록된 식단이 없어요</Text>
          <Text style={styles.emptyMealText}>업데이트 후 다시 확인해 주세요.</Text>
        </View>
      )}
    </View>
  );
}
