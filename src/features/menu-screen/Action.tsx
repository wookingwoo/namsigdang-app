import { useState } from "react";
import { Platform, Pressable, type PressableProps, type ViewStyle } from "react-native";
import { colors } from "./theme";

const focusStyle: ViewStyle = Platform.OS === "web"
  ? { outlineColor: colors.focus, outlineStyle: "solid", outlineWidth: 3, outlineOffset: 3 }
  : { borderColor: colors.focus, borderWidth: 2 };

/** Preserve native Pressable semantics and provide a consistent focus ring. */
export function Action({ style, onFocus, onBlur, accessibilityState, ...props }: PressableProps) {
  const [focused, setFocused] = useState(false);
  return <Pressable {...props} accessibilityState={accessibilityState}
    aria-selected={accessibilityState?.selected}
    onFocus={(event) => { setFocused(true); onFocus?.(event); }}
    onBlur={(event) => { setFocused(false); onBlur?.(event); }}
    style={(state) => [typeof style === "function" ? style(state) : style, focused && focusStyle]}
  />;
}
