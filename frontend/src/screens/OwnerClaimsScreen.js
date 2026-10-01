import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "../api/axiosInstance";
import { COLORS, SHADOWS } from "../styles/theme";
import { confirmDialog } from "../utils/alert";

const OwnerClaimsScreen = ({ route, navigation }) => {
  const { itemId } = route.params;

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false); // when a status is being patched

  const fetchClaims = async () => {
    try {
      const { data } = await axiosInstance.get(`/items/${itemId}/claims`);
      setClaims(data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Could not load claims.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchClaims();
    }, [itemId])
  );

  const handleUpdateStatus = (claimId, newStatus) => {
    const actionText = newStatus === "Approved" ? "Approve" : "Reject";
    let message = `Are you sure you want to ${actionText.toLowerCase()} this claim?`;
    if (newStatus === "Approved") {
      message += " This will close the item and automatically reject all other pending claims.";
    }

    confirmDialog(
      `Confirm ${actionText}`,
      message,
      async () => {
        setUpdating(true);
        try {
          await axiosInstance.patch(`/claims/${claimId}/status`, {
            status: newStatus,
          });
          // Re-fetch claims to reflect the new state (e.g. others might be rejected)
          fetchClaims();
        } catch (err) {
          Alert.alert("Error", err.response?.data?.message || `Could not ${actionText.toLowerCase()} claim.`);
        } finally {
          setUpdating(false);
        }
      },
      actionText,
      newStatus !== "Approved"
    );
  };

  const renderClaim = ({ item: claim }) => {
    const isPending = claim.status === "Pending";
    const claimant = claim.claimantId || {};

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.claimantName}>{claimant.name || "Anonymous User"}</Text>
          <View style={[styles.badge, styles[`badge${claim.status}`]]}>
            <Text style={[styles.badgeText, styles[`badgeText${claim.status}`]]}>
              {claim.status}
            </Text>
          </View>
        </View>

        <Text style={styles.contact}>Email: {claimant.email || "N/A"}</Text>
        {claimant.phone ? <Text style={styles.contact}>Phone: {claimant.phone}</Text> : null}
        
        <View style={styles.divider} />
        
        <Text style={styles.label}>Proof Provided:</Text>
        <Text style={styles.proofText}>{claim.proofDetails}</Text>

        {isPending && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleUpdateStatus(claim._id, "Rejected")}
              disabled={updating}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleUpdateStatus(claim._id, "Approved")}
              disabled={updating}
            >
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
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
          <Text style={styles.emptyText}>No claims have been submitted yet.</Text>
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
                fetchClaims();
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
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  list: { padding: 16, paddingBottom: 32 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  claimantName: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, flex: 1 },
  contact: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
  
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

  actionRow: { flexDirection: "row", marginTop: 16, gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1 },
  rejectBtn: { backgroundColor: COLORS.card, borderColor: COLORS.error },
  rejectBtnText: { color: COLORS.error, fontWeight: "600" },
  approveBtn: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  approveBtnText: { color: "#fff", fontWeight: "600" },
});

export default OwnerClaimsScreen;
