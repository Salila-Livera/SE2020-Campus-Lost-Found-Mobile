import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS, SHADOWS } from "../styles/theme";
import { confirmDialog } from "../utils/alert";

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    confirmDialog(
      "Log Out",
      "Are you sure you want to log out of your account?",
      logout,
      "Log Out",
      true
    );
  };

  return (
    <View style={styles.container}>
      {/* Avatar placeholder using the user's initial */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </Text>
      </View>

      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      {user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}

      {/* Info card */}
      <View style={styles.card}>
        <InfoRow label="Name" value={user?.name} />
        <InfoRow label="Email" value={user?.email} />
        {user?.phone && <InfoRow label="Phone" value={user.phone} />}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Small reusable row inside the info card
const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: 24,
    paddingTop: 48,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...SHADOWS.card,
  },
  avatarText: { fontSize: 36, color: "#fff", fontWeight: "700" },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
  phone: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24 },

  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
    ...SHADOWS.card,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  rowValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: "600", flexShrink: 1, textAlign: "right" },

  logoutBtn: {
    backgroundColor: COLORS.errorLight,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: "700" },
});

export default ProfileScreen;
