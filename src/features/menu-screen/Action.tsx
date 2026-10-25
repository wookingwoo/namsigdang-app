import { useEffect, useState } from "react";
import { Platform, Pressable, type PressableProps, type ViewStyle } from "react-native";
import { colors } from "./theme";

const focusStyle: ViewStyle = Platform.OS === "web"
  ? { outlineColor: colors.focus, outlineStyle: "solid", outlineWidth: 3, outlineOffset: 3 }
  : { borderColor: colors.focus, borderWidth: 2 };

/** Preserve native Pressable semantics and provide a consistent focus ring. */
export function Action({ style, onFocus, onBlur, accessibilityState, ...props }: PressableProps) {
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (props.disabled) setFocused(false); }, [props.disabled]);
  return <Pressable {...props} accessibilityState={accessibilityState}
    aria-selected={props.accessibilityRole === "tab" ? accessibilityState?.selected : undefined}
    aria-pressed={props.accessibilityRole === "button" ? accessibilityState?.selected : undefined}
    onFocus={(event) => { setFocused(true); onFocus?.(event); }}
    onBlur={(event) => { setFocused(false); onBlur?.(event); }}
    style={(state) => [typeof style === "function" ? style(state) : style, focused && !props.disabled && focusStyle]}
  />;
}
