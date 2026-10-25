import type { KeyboardEvent } from "react";
import { Platform, Text, View } from "react-native";
import { Action } from "./Action";
import { Icon } from "./Icon";

import type { Campus } from "../../types/menu";
import { CAMPUS_OPTIONS } from "./constants";
import { styles } from "./styles";
import { colors } from "./theme";

type CampusToggleProps = {
  campus: Campus;
  onChange: (campus: Campus) => void;
  wide?: boolean;
};

export function CampusToggle({ campus, onChange, wide = false }: CampusToggleProps) {
  function handleKey(event: KeyboardEvent<HTMLElement>, index: number) {
    const next = event.key === "ArrowRight" || event.key === "End" ? 1
      : event.key === "ArrowLeft" || event.key === "Home" ? 0 : null;
    if (next === null) return;
    event.preventDefault();
    if (next !== index) onChange(CAMPUS_OPTIONS[next].value);
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  }
  return (
    <View accessibilityRole="tablist" accessibilityLabel="학숙 선택" style={[styles.segmentedControl, wide && styles.segmentedControlWide]}>
      {CAMPUS_OPTIONS.map((option, index) => {
        const selected = campus === option.value;

        return (
          <Action
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            tabIndex={selected ? 0 : -1}
            {...(Platform.OS === "web" ? { onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleKey(event, index) } : {})}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentButton,
              selected && styles.segmentButtonActive,
              pressed && !selected && styles.pressed,
            ]}
          >
            <Icon
              name={selected ? "location" : "location-outline"}
              size={15}
              color={selected ? colors.brand : colors.inkSoft}
            />
            <Text
              style={[
                styles.segmentButtonText,
                selected && styles.segmentButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Action>
        );
      })}
    </View>
  );
}
