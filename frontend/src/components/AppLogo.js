import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS } from "../styles/theme";

/**
 * Modern Campus Shield & Search Star Brand Logo
 * Academic crest with an inner glowing search compass/star.
 * 100% vector-rendered, pixel-perfect on all screen DPIs.
 */
const AppLogo = ({ size = 80 }) => {
  const outerSize = size;
  const innerSize = Math.round(size * 0.76);
  const shieldSize = Math.round(size * 0.46);
  const starSize = Math.round(size * 0.22);
  const badgeSize = Math.round(size * 0.32);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          width: outerSize,
          height: outerSize,
          borderRadius: Math.round(outerSize * 0.28),
          backgroundColor: COLORS.primaryLight,
          borderColor: COLORS.border,
        },
      ]}
    >
      {/* Emerald Academic Crest Base */}
      <View
        style={[
          styles.innerCore,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: Math.round(innerSize * 0.26),
            backgroundColor: COLORS.primary,
          },
        ]}
      >
        {/* Main University Campus Shield Crest */}
        <Ionicons name="shield" size={shieldSize} color="#FFFFFF" />

        {/* Inner Search Star (Sparkles/Compass) nestled inside the shield */}
        <View style={styles.centerStar}>
          <Ionicons name="sparkles" size={starSize} color={COLORS.primary} />
        </View>

        {/* Floating Mint Campus Navigation Compass Corner Badge */}
        <View
          style={[
            styles.cornerBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: Math.round(badgeSize / 2),
              backgroundColor: COLORS.accent,
            },
          ]}
        >
          <Ionicons name="compass" size={Math.round(badgeSize * 0.7)} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  innerCore: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...SHADOWS.primaryButton,
  },
  centerStar: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: "32%",
  },
  cornerBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});

export default AppLogo;
