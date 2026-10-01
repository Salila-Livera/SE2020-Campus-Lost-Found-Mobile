import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axiosInstance from "../api/axiosInstance";
import { COLORS, SHADOWS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";

// We use this screen for BOTH creating and editing items.
// If route.params.item exists, we are in Edit mode.
const AddEditItemScreen = ({ route, navigation }) => {
  const itemToEdit = route.params?.item;
  const isEditing = !!itemToEdit;

  // Set the header title dynamically
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Item" : "Report Item",
    });
  }, [navigation, isEditing]);

  const [title, setTitle] = useState(itemToEdit?.title || "");
  const [description, setDescription] = useState(itemToEdit?.description || "");
  const [itemType, setItemType] = useState(itemToEdit?.itemType || "Lost");
  const [category, setCategory] = useState(itemToEdit?.category || "Other");
  const [location, setLocation] = useState(itemToEdit?.location || "");
  const [status, setStatus] = useState(itemToEdit?.status || "Open");

  // Local URI of a newly selected image
  const [imageUri, setImageUri] = useState(null);
  // URL of the existing cloud image (if editing)
  const [existingImage, setExistingImage] = useState(itemToEdit?.image || null);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const CATEGORIES = ["Electronics", "Books", "ID Cards", "Clothing", "Accessories", "Other"];

  const handlePickImage = async () => {
    // Request permission (Expo handles this behind the scenes)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need camera roll permissions to upload an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // compress slightly to stay under 2MB limit
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // If they pick a new image while editing, hide the old cloud image
      setExistingImage(null);
    }
  };

  const parseErrors = (errorsArray) => {
    const map = {};
    errorsArray.forEach((e) => {
      if (e.path) map[e.path] = e.msg;
    });
    return map;
  };

  const handleSubmit = async () => {
    setFieldErrors({});
    if (!title.trim()) {
      setFieldErrors({ title: "Title is required" });
      return;
    }

    setLoading(true);
    try {
      // Must use FormData because we are uploading a file (multipart/form-data)
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("itemType", itemType);
      formData.append("category", category);
      formData.append("location", location.trim());
      if (isEditing) formData.append("status", status);

      // Append image if a new one was selected
      if (imageUri) {
        if (Platform.OS === "web") {
          // On Web, browser FormData expects a Blob/File, not a React Native object
          const res = await fetch(imageUri);
          const blob = await res.blob();
          formData.append("image", blob, "photo.jpg");
        } else {
          const filename = imageUri.split("/").pop() || "photo.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          formData.append("image", {
            uri: imageUri,
            name: filename,
            type,
          });
        }
      }

      const headers = { "Content-Type": "multipart/form-data" };

      if (isEditing) {
        await axiosInstance.put(`/items/${itemToEdit._id}`, formData, { headers });
      } else {
        await axiosInstance.post("/items", formData, { headers });
      }

      // Go back to the previous screen (Browse/MyItems or Detail view)
      navigation.goBack();
    } catch (err) {
      if (err.response?.status === 413) {
        Alert.alert("Error", err.response?.data?.message || "Image is too large. Max size is 10MB.");
      } else if (err.response?.data?.errors) {
        setFieldErrors(parseErrors(err.response.data.errors));
      } else {
        Alert.alert(
          "Error",
          err.response?.data?.message || err.message || "Failed to save item."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }) =>
    fieldErrors[field] ? (
      <Text style={styles.fieldError}>{fieldErrors[field]}</Text>
    ) : null;

  // Decide what image to preview
  const displayImage = imageUri || existingImage;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80} // offset for the header
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        
        {/* ── Image Picker ── */}
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage} activeOpacity={0.8}>
          {displayImage ? (
            <Image source={{ uri: displayImage }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.imagePlaceholderText}>Tap to add cover image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Type Toggle ── */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, itemType === "Lost" && styles.toggleBtnActiveLost]}
            onPress={() => setItemType("Lost")}
          >
            <Text style={[styles.toggleText, itemType === "Lost" && styles.toggleTextActiveLost]}>
              I Lost This
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, itemType === "Found" && styles.toggleBtnActiveFound]}
            onPress={() => setItemType("Found")}
          >
            <Text style={[styles.toggleText, itemType === "Found" && styles.toggleTextActiveFound]}>
              I Found This
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Status Toggle (Edit only) ── */}
        {isEditing && (
          <View style={[styles.toggleRow, { marginTop: 0, marginBottom: 24 }]}>
             <TouchableOpacity
              style={[styles.toggleBtn, status === "Open" && styles.toggleBtnActive]}
              onPress={() => setStatus("Open")}
            >
              <Text style={[styles.toggleText, status === "Open" && styles.toggleTextActive]}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, status === "Returned" && styles.toggleBtnActive]}
              onPress={() => setStatus("Returned")}
            >
              <Text style={[styles.toggleText, status === "Returned" && styles.toggleTextActive]}>Returned</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Form Fields ── */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={[styles.input, fieldErrors.title && styles.inputError]}
          placeholder="e.g. Blue Hydro Flask"
          placeholderTextColor={COLORS.placeholder}
          value={title}
          onChangeText={setTitle}
        />
        <FieldError field="title" />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryWrap}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, category === cat && styles.catPillActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Library 2nd Floor"
          placeholderTextColor={COLORS.placeholder}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any distinguishing features?"
          placeholderTextColor={COLORS.placeholder}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top" // Android fix
        />

        {/* ── Submit ── */}
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
              {isEditing ? "Save Changes" : "Post Item"}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingBottom: 40 },

  // Image Picker
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  imagePreview: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  imagePlaceholderText: { color: COLORS.placeholder, marginTop: 8, fontSize: 15, fontWeight: "500" },

  // Toggles
  toggleRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  
  toggleBtnActiveLost: { backgroundColor: COLORS.errorLight, borderColor: COLORS.error },
  toggleTextActiveLost: { color: COLORS.error },
  
  toggleBtnActiveFound: { backgroundColor: COLORS.success + "20", borderColor: COLORS.success },
  toggleTextActiveFound: { color: COLORS.success },

  toggleBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  toggleTextActive: { color: COLORS.primary },

  // Form Fields
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  textArea: { height: 100 },
  inputError: { borderColor: COLORS.error },
  fieldError: { color: COLORS.error, fontSize: 12, marginTop: -16, marginBottom: 16 },

  // Category Pills
  categoryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  catPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  catPillActive: { backgroundColor: COLORS.textPrimary, borderColor: COLORS.textPrimary },
  catText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  catTextActive: { color: "#fff" },

  // Button
  button: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

export default AddEditItemScreen;
