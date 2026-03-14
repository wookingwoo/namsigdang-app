import { Text, View } from "react-native";

import { styles } from "./styles";

type MealCardProps = {
  label: string;
  items: string[];
  stretch?: boolean;
};

export function MealCard({ label, items, stretch = false }: MealCardProps) {
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
