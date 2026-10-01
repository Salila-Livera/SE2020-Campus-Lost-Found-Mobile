import { Platform } from "react-native";

/**
 * Deep Emerald & Mint Design System Tokens
 * Fresh, modern, production-grade campus palette.
 * High-contrast, clean surfaces, and distinct status color hierarchy.
 */
export const COLORS = {
  // ── Brand Palette (Deep Emerald & Mint) ──
  primary: "#059669",        // Deep Emerald Green — main brand anchor
  primaryDark: "#047857",    // Forest Emerald for pressed / active states
  primaryLight: "#ECFDF5",   // Mint Cream tint for soft card highlights
  primarySubtle: "#F0FDF4",  // Soft leaf tint
  accent: "#10B981",         // Vibrant Mint accent for pills, icons, and CTA badges
  accentLight: "#D1FAE5",    // Pale Mint
  accentDark: "#065F46",     // Deep Forest Green

  // ── Backgrounds & Elevated Surfaces ──
  background: "#F4F7F5",     // Clean, organic light sage canvas
  card: "#FFFFFF",           // Crisp pure white cards
  surface: "#E6F4EA",        // Soft tinted mint surface for chips & badges
  surfaceSubtle: "#F9FAF9",
  inputBackground: "#FFFFFF",

  // ── Typography & Contrast Hierarchy ──
  textPrimary: "#064E3B",    // Very deep emerald-slate — crisp, high contrast
  textSecondary: "#374151",  // Slate gray for readable body text
  textMuted: "#6B7280",      // Medium gray for helper text & timestamps
  placeholder: "#9CA3AF",    // Neutral gray for input placeholders

  // ── Hairline Borders & Dividers ──
  border: "#D1E7DD",         // Soft mint-slate border
  borderLight: "#E8F5E9",    // Extra subtle inner divider
  borderFocus: "#059669",    // Emerald focus outline
  borderHover: "#A3D9C9",

  // ── Semantic Feedback ──
  error: "#E11D48",          // Rose 600
  errorLight: "#FFF1F2",     // Rose 50
  errorBorder: "#FECDD3",    // Rose 200
  
  success: "#059669",        // Emerald
  successLight: "#ECFDF5",
  successBorder: "#A7F3D0",

  warning: "#D97706",        // Amber 600
  warningLight: "#FFFBEB",
  warningBorder: "#FDE68A",

  info: "#0284C7",           // Sky 600
  infoLight: "#F0F9FF",
  infoBorder: "#BAE6FD",

  // ── Specialized Lost & Found Badges ──
  lost: "#E11D48",
  lostBg: "#FFE4E6",
  found: "#059669",
  foundBg: "#D1FAE5",
  returned: "#4B5563",
  returnedBg: "#F3F4F6",
};

export const FONTS = {
  regular: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  semiBold: { fontWeight: "600" },
  bold: { fontWeight: "700" },
  extraBold: { fontWeight: "800" },
};

export const SHADOWS = {
  sm: Platform.select({
    web: {
      boxShadow: "0 1px 2px 0 rgba(6, 78, 59, 0.05)",
    },
    default: {
      shadowColor: "#064E3B",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  }),
  card: Platform.select({
    web: {
      boxShadow: "0 2px 8px -1px rgba(6, 78, 59, 0.07), 0 1px 4px -1px rgba(6, 78, 59, 0.04)",
    },
    default: {
      shadowColor: "#064E3B",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    },
  }),
  cardHover: Platform.select({
    web: {
      boxShadow: "0 10px 20px -3px rgba(6, 78, 59, 0.1), 0 4px 6px -4px rgba(6, 78, 59, 0.04)",
    },
    default: {
      shadowColor: "#064E3B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
  }),
  primaryButton: Platform.select({
    web: {
      boxShadow: "0 4px 14px 0 rgba(5, 150, 105, 0.35)",
    },
    default: {
      shadowColor: "#059669",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  }),
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
};
