import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

/** These icons are paired with visible text or a named parent control. */
export function Icon(props: ComponentProps<typeof Ionicons>) {
  return <Ionicons {...props} accessible={false} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />;
}
