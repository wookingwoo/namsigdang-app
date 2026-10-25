import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import type { MealType } from "../../types/menu";

// Primitive palette → semantic roles → component styles. Platform fonts keep
// Korean readable offline and follow the user's system text scaling.
const palette = {
  white: "#FFFFFF", gray50: "#F8FAFC", gray100: "#F1F5F9", gray200: "#E2E8F0",
  gray400: "#94A3B8", gray600: "#475569", gray900: "#0F172A",
  blue50: "#EFF6FF", blue100: "#DBEAFE", blue600: "#2563EB", blue800: "#1E40AF",
  amber50: "#FFF4DD", amber800: "#956009", pink50: "#FBEAF0", pink800: "#A33E61",
} as const;

export const colors = {
  background: palette.gray50, surface: palette.white, surfaceMuted: palette.gray100,
  border: palette.gray200, borderStrong: palette.gray400,
  ink: palette.gray900, inkSoft: palette.gray600, inkFaint: palette.gray600,
  onBrand: palette.white, brand: palette.blue600, brandDark: palette.blue800,
  brandTint: palette.blue50, brandPressed: palette.blue100, focus: palette.blue600,
  sunday: palette.pink800, saturday: palette.blue600,
  error: palette.pink800, errorTint: palette.pink50,
  scrim: "rgba(15, 23, 42, 0.42)", skeleton: palette.gray100,
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, section: 40, page: 56 } as const;
export const radii = { small: 10, control: 14, card: 20, sheet: 28, pill: 999 } as const;
export const typography = { caption: 12, small: 14, body: 16, title: 20, heading: 28, display: 36 } as const;
export const layout = { maxWidth: 1080, wideBreakpoint: 900, controlSize: 48 } as const;

export const mealTheme: Record<MealType, {
  icon: ComponentProps<typeof Ionicons>["name"];
  tint: string;
  dark: string;
  caption: string;
}> = {
  breakfast: { icon: "sunny-outline", tint: palette.blue50, dark: palette.blue800, caption: "하루를 여는 한 끼" },
  lunch: { icon: "restaurant-outline", tint: palette.amber50, dark: palette.amber800, caption: "든든하게 채우는 점심" },
  dinner: { icon: "moon-outline", tint: palette.pink50, dark: palette.pink800, caption: "하루를 마무리하는 저녁" },
};
