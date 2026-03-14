import { Pressable, Text, View } from "react-native";

import type { Campus } from "../../types/menu";
import { CAMPUS_OPTIONS } from "./constants";
import { styles } from "./styles";

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
