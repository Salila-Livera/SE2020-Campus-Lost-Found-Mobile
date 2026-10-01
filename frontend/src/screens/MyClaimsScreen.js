import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "../api/axiosInstance";
import { COLORS, SHADOWS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { confirmDialog } from "../utils/alert";

const MyClaimsScreen = ({ navigation }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyClaims = async () => {
    try {
      const { data } = await axiosInstance.get("/claims/my");
      setClaims(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyClaims();
    }, [])
  );

  const handleDeleteClaim = (claimId) => {
    confirmDialog(
      "Withdraw Claim",
      "Are you sure you want to withdraw this claim?",
      async () => {
        try {
          await axiosInstance.delete(`/claims/${claimId}`);
          setClaims(claims.filter((c) => c._id !== claimId));
        } catch (err) {
          Alert.alert("Error", err.response?.data?.message || err.message || "Could not delete claim.");
        }
      },
      "Withdraw",
      true
    );
  };

  const renderClaim = ({ item: claim }) => {
    const isPending = claim.status === "Pending";
    const itemInfo = claim.itemId;

    // Handle case where item might have been deleted but claim remains (though cascade delete should prevent this, it's good safety)
    if (!itemInfo) {
      return (
        <View style={styles.card}>
          <Text style={styles.label}>Claim on deleted item</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{itemInfo.title}</Text>
          <View style={[styles.badge, styles[`badge${claim.status}`]]}>
            <Text style={[styles.badgeText, styles[`badgeText${claim.status}`]]}>
              {claim.status}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          Claimed on {new Date(claim.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.divider} />
        
        <Text style={styles.label}>Your Proof:</Text>
        <Text style={styles.proofText}>{claim.proofDetails}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewItemBtn}
            onPress={() => navigation.navigate("ItemDetail", { itemId: itemInfo._id })}
          >
            <Ionicons name="eye-outline" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.viewItemText}>View Item</Text>
          </TouchableOpacity>

          {isPending && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[styles.viewItemBtn, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border }]}
                onPress={() => navigation.navigate("ClaimForm", { claim })}
              >
                <Ionicons name="pencil-outline" size={16} color={COLORS.textPrimary} style={{ marginRight: 4 }} />
                <Text style={[styles.viewItemText, { color: COLORS.textPrimary }]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteClaim(claim._id)}
              >
                <Ionicons name="trash-outline" size={16} color={COLORS.error} style={{ marginRight: 4 }} />
                <Text style={styles.deleteBtnText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : claims.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>You haven't submitted any claims yet.</Text>
        </View>
      ) : (
        <FlatList
          data={claims}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={renderClaim}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchMyClaims();
              }}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary },
  list: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  itemTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  dateText: { fontSize: 13, color: COLORS.textSecondary },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 4 },
  proofText: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },

  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgePending: { backgroundColor: COLORS.warningLight, borderWidth: 1, borderColor: COLORS.warningBorder },
  badgeApproved: { backgroundColor: COLORS.successLight, borderWidth: 1, borderColor: COLORS.successBorder },
  badgeRejected: { backgroundColor: COLORS.errorLight, borderWidth: 1, borderColor: COLORS.errorBorder },
  
  badgeText: { fontSize: 12, fontWeight: "700" },
  badgeTextPending: { color: COLORS.warning },
  badgeTextApproved: { color: COLORS.success },
  badgeTextRejected: { color: COLORS.error },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  
  viewItemBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.primaryLight },
  viewItemText: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  
  deleteBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.errorLight },
  deleteBtnText: { color: COLORS.error, fontWeight: "600", fontSize: 14 },
});

export default MyClaimsScreen;
