import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "../api/axiosInstance";
import { ItemCard } from "./BrowseItemsScreen";
import { COLORS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

// Reuses the ItemCard component and the fetch logic, but hits the /my endpoint
const MyItemsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const fetchMyItems = async () => {
    try {
      setFetchError("");
      const { data } = await axiosInstance.get("/items/my");
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch my items error", error);
      setFetchError(error.response?.data?.message || error.message || "Failed to load your items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyItems();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyItems();
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : fetchError ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={56} color={COLORS.error} />
          <Text style={[styles.emptyText, { color: COLORS.error, textAlign: "center", marginHorizontal: 24 }]}>
            {fetchError}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              fetchMyItems();
            }}
          >
            <Text style={styles.retryBtnText}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>You haven't posted any items yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={(id) => navigation.navigate("ItemDetail", { itemId: id })}
            />
          )}
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
  retryBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  retryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default MyItemsScreen;
