import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axiosInstance from "../api/axiosInstance";
import { COLORS, FONTS, SHADOWS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";

// Reusable component for a single item card
export const ItemCard = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.8}
    onPress={() => onPress(item._id)}
  >
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.cardImage} />
    ) : (
      <View style={[styles.cardImage, styles.imagePlaceholder]}>
        <Ionicons name="image-outline" size={32} color={COLORS.placeholder} />
      </View>
    )}
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
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
      <Text style={styles.cardCategory}>{item.category} • {item.location}</Text>
      <Text style={styles.cardDate}>
        {new Date(item.dateReported).toLocaleDateString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const BrowseItemsScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All"); // All, Lost, Found
  const [fetchError, setFetchError] = useState("");

  const fetchItems = async () => {
    try {
      setFetchError("");
      // Build query string based on filters
      const params = new URLSearchParams();
      if (activeFilter !== "All") params.append("itemType", activeFilter);
      if (search && search.trim()) params.append("search", search.trim());

      const queryStr = params.toString();
      const endpoint = queryStr ? `/items?${queryStr}` : "/items";

      const { data } = await axiosInstance.get(endpoint);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch items error", error);
      setFetchError(error.response?.data?.message || error.message || "Failed to load items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [activeFilter, search])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  return (
    <View style={styles.container}>
      {/* ── Search & Filter Bar ── */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.placeholder} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={fetchItems} // trigger search on keyboard enter
          />
        </View>

        <View style={styles.pills}>
          {["All", "Lost", "Found"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.pill, activeFilter === type && styles.pillActive]}
              onPress={() => setActiveFilter(type)}
            >
              <Text
                style={[
                  styles.pillText,
                  activeFilter === type && styles.pillTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── List ── */}
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
            style={[styles.pill, styles.pillActive, { marginTop: 16 }]}
            onPress={() => {
              setLoading(true);
              fetchItems();
            }}
          >
            <Text style={styles.pillTextActive}>Tap to Retry</Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="folder-open-outline" size={64} color={COLORS.border} />
          <Text style={styles.emptyText}>No items found</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
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

  // Search & Filters
  filterSection: { padding: 16, backgroundColor: COLORS.card, ...SHADOWS.card, zIndex: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: COLORS.textPrimary },
  pills: { flexDirection: "row", gap: 8 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  pillTextActive: { color: "#fff" },

  // List
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
    ...SHADOWS.card,
  },
  cardImage: { width: 100, height: "100%", backgroundColor: COLORS.background },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  cardCategory: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  cardDate: { fontSize: 12, color: COLORS.placeholder },
  
  // Badges
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeLost: { backgroundColor: COLORS.lostBg },
  badgeFound: { backgroundColor: COLORS.foundBg },
  badgeReturned: { backgroundColor: COLORS.returnedBg },
  badgeText: { fontSize: 11, fontWeight: "700" },
  badgeTextLost: { color: COLORS.lost },
  badgeTextFound: { color: COLORS.found },
  badgeTextReturned: { color: COLORS.returned },
});

export default BrowseItemsScreen;
