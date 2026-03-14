import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eaf2ff",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 28 : 12,
    paddingBottom: 28,
    gap: 16,
  },
  containerWide: {
    width: "100%",
    maxWidth: 860,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 6,
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f2d5e",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#5f7da9",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#edf4ff",
    borderRadius: 20,
    padding: 6,
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 15,
  },
  segmentButtonActive: {
    backgroundColor: "#2b6fe8",
  },
  segmentButtonPressed: {
    backgroundColor: "#dceaff",
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4e6f9e",
  },
  segmentButtonTextActive: {
    color: "#f5f9ff",
  },
  controlsPlaceholder: {
    height: 58,
  },
  surfaceCard: {
    backgroundColor: "#fafdff",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#d8e7ff",
    padding: 16,
    gap: 16,
    shadowColor: "#7ca9e8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 2,
  },
  dateCard: {
    gap: 16,
  },
  dateNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateNavCenter: {
    flex: 1,
    alignItems: "center",
  },
  dateValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#12356b",
    textAlign: "center",
  },
  weekNavButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: "#edf4ff",
    borderWidth: 1,
    borderColor: "#d4e4ff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weekNavButtonPressed: {
    backgroundColor: "#dceaff",
  },
  weekNavArrow: {
    fontSize: 28,
    lineHeight: 32,
    color: "#1958b7",
    fontWeight: "400",
    marginTop: -2,
  },
  todayShortcutRow: {
    alignItems: "flex-end",
  },
  todayShortcutButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#edf4ff",
    borderWidth: 1,
    borderColor: "#cfe0ff",
  },
  todayShortcutButtonPressed: {
    backgroundColor: "#dceaff",
  },
  todayShortcutText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1a58ba",
  },
  weekRow: {
    flexDirection: "row",
    gap: 6,
  },
  dayChip: {
    flex: 1,
    minWidth: 0,
    minHeight: 74,
    backgroundColor: "#f6faff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#d8e7ff",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayChipToday: {
    backgroundColor: "#edf4ff",
    borderColor: "#8fb8ff",
  },
  dayChipActive: {
    backgroundColor: "#2b6fe8",
    borderColor: "#2b6fe8",
  },
  dayChipPressed: {
    backgroundColor: "#e7f0ff",
  },
  dayChipWeekday: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6c84ab",
  },
  dayChipSunday: {
    color: "#cf4d5c",
  },
  dayChipSaturday: {
    color: "#2d74d7",
  },
  dayChipDate: {
    fontSize: 18,
    fontWeight: "900",
    color: "#143466",
  },
  dayChipTextActive: {
    color: "#f5f9ff",
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2b6fe8",
    marginTop: 2,
  },
  todayDotActive: {
    backgroundColor: "rgba(245, 249, 255, 0.88)",
  },
  feedbackCard: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#f4f8ff",
  },
  feedbackText: {
    fontSize: 15,
    color: "#5d759d",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#193b72",
    textAlign: "center",
  },
  errorText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5e759f",
    textAlign: "center",
  },
  menuGrid: {
    gap: 12,
  },
  menuGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  mealCardWrap: {
    width: "100%",
  },
  mealCardWrapWide: {
    flex: 1,
  },
  mealCard: {
    backgroundColor: "#f4f8ff",
    borderColor: "#d8e7ff",
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  mealCardStretch: {
    height: "100%",
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  mealBadge: {
    backgroundColor: "#dceaff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  mealBadgeText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1b58b8",
  },
  mealMeta: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6e86ab",
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  menuBullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#2b6fe8",
    marginTop: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#21406d",
  },
  emptyMealCard: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.62)",
  },
  emptyMealText: {
    fontSize: 14,
    color: "#6f86a7",
  },
});
