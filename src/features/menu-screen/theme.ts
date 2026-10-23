import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

import type { MealType } from "../../types/menu";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

// A warm, cream-based palette drawn from the 남식당 mark: near-black ink,
// paired with the logo's mint and pink, bridged by a golden midday tone so
// the three meals read as a small arc of the day — morning, noon, dusk.
export const colors = {
  background: "#FAF7F1",
  backgroundGradient: ["#FDFBF7", "#F8F3EA"] as const,
  surface: "#FFFFFF",
  surfaceMuted: "#F6F1E6",
  border: "#EAE1CF",
  borderStrong: "#DDCEA9",

  ink: "#211E1A",
  inkSoft: "#79705F",
  inkFaint: "#AB9F89",
  onInk: "#FBF6EC",
  inkGradient: ["#3A342C", "#16130F"] as const,

  mint: "#3FA79A",
  mintTint: "#DFF3EF",
  mintDark: "#276C63",
  mintGradient: ["#5FC9BC", "#2E9C8D"] as const,

  gold: "#C9821B",
  goldTint: "#FBEBCE",
  goldDark: "#8C5A10",
  goldGradient: ["#EFB65C", "#C9821B"] as const,

  pink: "#D2597E",
  pinkTint: "#FBE2EA",
  pinkDark: "#A63E64",
  pinkGradient: ["#E58AA8", "#C85881"] as const,

  sunday: "#CC4B45",
  saturday: "#2E8377",

  shadow: "#3D3226",
} as const;

export const mealTheme: Record<
  MealType,
  {
    icon: IoniconName;
    gradient: readonly [string, string];
    tint: string;
    dark: string;
  }
> = {
  breakfast: {
    icon: "sunny-outline",
    gradient: colors.mintGradient,
    tint: colors.mintTint,
    dark: colors.mintDark,
  },
  lunch: {
    icon: "restaurant-outline",
    gradient: colors.goldGradient,
    tint: colors.goldTint,
    dark: colors.goldDark,
  },
  dinner: {
    icon: "moon-outline",
    gradient: colors.pinkGradient,
    tint: colors.pinkTint,
    dark: colors.pinkDark,
  },
};
