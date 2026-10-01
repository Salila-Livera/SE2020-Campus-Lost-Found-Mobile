import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../styles/theme";

// A simple stand-in screen used for tabs that will be built in Phase 6 & 7.
// Having it now means the navigation shell is fully functional today.
const PlaceholderScreen = ({ route }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚧</Text>
      <Text style={styles.title}>Coming Soon</Text>
      <Text style={styles.subtitle}>{route.name} will be built in Phase 6 & 7</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default PlaceholderScreen;
