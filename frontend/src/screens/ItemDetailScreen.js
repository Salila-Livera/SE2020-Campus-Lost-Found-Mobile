import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { COLORS, SHADOWS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { confirmDialog } from "../utils/alert";

const ItemDetailScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-fetch when entering screen so edits are reflected immediately
  const fetchItem = async () => {
    try {
      const { data } = await axiosInstance.get(`/items/${itemId}`);
      setItem(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Could not load item details.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItem();
    }, [itemId])
  );

  const handleDelete = () => {
    confirmDialog(
      "Delete Item",
      "Are you sure? This cannot be undone.",
      async () => {
        try {
          await axiosInstance.delete(`/items/${itemId}`);
          navigation.goBack();
        } catch (err) {
          Alert.alert("Error", err.response?.data?.message || err.message || "Could not delete item.");
        }
      },
      "Delete",
      true
    );
  };

  // Safe checks before full render
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  if (!item) return null;

  const isOwner = Boolean(
    user?._id &&
      item?.postedBy &&
      (user._id === (item.postedBy._id || item.postedBy))
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* ── Image ── */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={64} color={COLORS.placeholder} />
        </View>
      )}

      {/* ── Content ── */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <View
            style={[
              styles.badge,
              item.status === "Returned"
                ? styles.badgeReturned
                : item.itemType === "Lost"
                ? styles.badgeLost
                : styles.badgeFound,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                item.status === "Returned"
                  ? styles.badgeTextReturned
                  : item.itemType === "Lost"
                  ? styles.badgeTextLost
                  : styles.badgeTextFound,
              ]}
            >
              {item.status === "Returned" ? "Returned" : item.itemType}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {item.category} • {item.location}
        </Text>
        <Text style={styles.date}>
          Reported on {new Date(item.dateReported).toLocaleDateString()}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {item.description || "No description provided."}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.contactText}>Posted by: {item.postedBy?.name || "Unknown User"}</Text>
        <Text style={styles.contactText}>Email: {item.postedBy?.email || "N/A"}</Text>
        {item.postedBy?.phone ? (
          <Text style={styles.contactText}>Phone: {item.postedBy.phone}</Text>
        ) : null}

        {/* ── Owner Actions ── */}
        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("AddEditItem", { item })}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
              <Text style={styles.editBtnText}>Edit Item</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Owner: View Claims ── */}
        {isOwner && (
          <TouchableOpacity
            style={styles.viewClaimsBtn}
            onPress={() => navigation.navigate("OwnerClaims", { itemId: item._id })}
          >
            <Ionicons name="document-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.viewClaimsBtnText}>Manage Claims</Text>
          </TouchableOpacity>
        )}

        {/* ── Claim Button ── */}
        {/* Only non-owners can claim Found items that are Open */}
        {!isOwner && item.itemType === "Found" && item.status === "Open" && (
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={() => navigation.navigate("ClaimForm", { itemId: item._id })}
          >
            <Text style={styles.claimBtnText}>Claim this Item</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.card },
  scroll: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  image: { width: "100%", height: 300, backgroundColor: COLORS.background },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },

  content: { padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.textPrimary, flex: 1, marginRight: 16 },
  
  meta: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 4 },
  date: { fontSize: 13, color: COLORS.placeholder },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 8 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  
  contactText: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 4 },

  // Badges (copied from ItemCard)
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeLost: { backgroundColor: COLORS.lostBg },
  badgeFound: { backgroundColor: COLORS.foundBg },
  badgeReturned: { backgroundColor: COLORS.returnedBg },
  badgeText: { fontSize: 12, fontWeight: "700" },
  badgeTextLost: { color: COLORS.lost },
  badgeTextFound: { color: COLORS.found },
  badgeTextReturned: { color: COLORS.returned },

  // Buttons
  ownerActions: { flexDirection: "row", marginTop: 24, gap: 12 },
  editBtn: { flex: 1, flexDirection: "row", backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, justifyContent: "center", alignItems: "center", gap: 8 },
  editBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteBtn: { backgroundColor: COLORS.errorLight, borderRadius: 12, padding: 14, justifyContent: "center", alignItems: "center" },

  viewClaimsBtn: { flexDirection: "row", backgroundColor: COLORS.primaryDark, borderRadius: 12, paddingVertical: 14, justifyContent: "center", alignItems: "center", marginTop: 12 },
  viewClaimsBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  claimBtn: { backgroundColor: COLORS.success, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  claimBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ItemDetailScreen;
