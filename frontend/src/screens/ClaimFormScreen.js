import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import axiosInstance from "../api/axiosInstance";
import { COLORS, SHADOWS } from "../styles/theme";
import { notifyDialog } from "../utils/alert";

const ClaimFormScreen = ({ route, navigation }) => {
  const claimToEdit = route.params?.claim;
  const isEditing = !!claimToEdit;
  const itemId = route.params?.itemId || claimToEdit?.itemId?._id || claimToEdit?.itemId;

  const [proofDetails, setProofDetails] = useState(claimToEdit?.proofDetails || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Claim" : "Submit Claim",
    });
  }, [navigation, isEditing]);

  const handleSubmit = async () => {
    setError("");
    if (!proofDetails.trim()) {
      setError("Please provide proof details.");
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await axiosInstance.put(`/claims/${claimToEdit._id}`, {
          proofDetails: proofDetails.trim(),
        });
        notifyDialog("Success", "Your claim details have been updated.", () => {
          navigation.goBack();
        });
      } else {
        await axiosInstance.post("/claims", {
          itemId,
          proofDetails: proofDetails.trim(),
        });
        notifyDialog("Success", "Your claim has been submitted successfully.", () => {
          navigation.goBack();
        });
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError(err.response?.data?.message || "You have already claimed this item.");
      } else {
        setError(
          err.response?.data?.message || err.message || "Failed to save claim. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Submit a Claim</Text>
          <Text style={styles.cardSubtitle}>
            Please describe the item in detail to prove it belongs to you. Mention specific marks, inside contents, lock screens, or serial numbers.
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Proof Details</Text>
          <TextInput
            style={[styles.input, styles.textArea, error && styles.inputError]}
            placeholder="E.g. It has a tiny scratch on the bottom left corner..."
            placeholderTextColor={COLORS.placeholder}
            value={proofDetails}
            onChangeText={setProofDetails}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isEditing ? "Save Changes" : "Submit Claim"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingBottom: 40, justifyContent: "center", flexGrow: 1 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },

  errorBox: {
    backgroundColor: COLORS.errorLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontSize: 13 },

  label: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  textArea: { height: 120 },
  inputError: { borderColor: COLORS.error },

  button: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default ClaimFormScreen;
