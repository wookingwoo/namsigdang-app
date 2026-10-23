import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import type { Campus } from "../../types/menu";
import { CAMPUS_OPTIONS } from "./constants";
import { styles } from "./styles";
import { colors } from "./theme";

type CampusToggleProps = {
  campus: Campus;
  onChange: (campus: Campus) => void;
};

export function CampusToggle({ campus, onChange }: CampusToggleProps) {
  return (
    <View style={styles.segmentedControl}>
      {CAMPUS_OPTIONS.map((option) => {
        const selected = campus === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentButton,
              selected && styles.segmentButtonActive,
              pressed && !selected && styles.segmentButtonPressed,
            ]}
          >
            <Ionicons
              name={selected ? "location" : "location-outline"}
              size={15}
              color={selected ? colors.onInk : colors.inkFaint}
            />
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
