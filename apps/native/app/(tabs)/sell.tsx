import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { listingsApi } from "@/lib/listings";
import { uploadListingImagesNative } from "@/lib/uploads";

// ─── Constants ────────────────────────────────────────────────────────────────

const CONDITIONS = [
  { value: "BRAND_NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "FOR_PARTS", label: "For Parts" },
] as const;

const CATEGORIES = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "PHONES_TABLETS", label: "Phones & Tablets" },
  { value: "VEHICLES", label: "Vehicles" },
  { value: "FURNITURE", label: "Furniture" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "SPORTS_OUTDOORS", label: "Sports & Outdoors" },
  { value: "HOME_GARDEN", label: "Home & Garden" },
  { value: "BOOKS_EDUCATION", label: "Books & Education" },
  { value: "FOOD_BEVERAGES", label: "Food & Beverages" },
  { value: "SERVICES", label: "Services" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle = {
  fontFamily: "DMSans_400Regular",
  fontSize: 15,
  color: colors.text,
  backgroundColor: colors.surface,
  borderRadius: radii.md,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 14,
  paddingVertical: 11,
} as const;

const labelStyle = {
  fontFamily: "DMSans_500Medium",
  fontSize: 13,
  color: colors.textMuted,
  marginBottom: 6,
} as const;

// ─── Category picker modal ────────────────────────────────────────────────────

function CategoryPicker({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            paddingBottom: 40,
            maxHeight: "75%",
          }}
          onPress={() => {/* prevent backdrop close */}}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing[5],
              paddingVertical: spacing[4],
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 18, color: colors.text }}>
              Category
            </Text>
            <Pressable onPress={onClose}>
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.accent }}>
                Done
              </Text>
            </Pressable>
          </View>
          <ScrollView>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => { onSelect(cat.value); onClose(); }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: spacing[5],
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  backgroundColor: cat.value === value ? colors.surface2 : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: cat.value === value ? "DMSans_600SemiBold" : "DMSans_400Regular",
                    fontSize: 15,
                    color: cat.value === value ? colors.primary : colors.text,
                  }}
                >
                  {cat.label}
                </Text>
                {cat.value === value && (
                  <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Image picker and display ────────────────────────────────────────────────

interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("LIKE_NEW");
  const [category, setCategory] = useState("ELECTRONICS");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [error, setError] = useState("");

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? category;

  async function pickImages() {
    if (images.length >= 10) {
      setError("Maximum 10 images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled) {
      const newImages: PickedImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.uri.split("/").pop() || `image-${Date.now()}.jpg`,
        type: asset.type === "video" ? "video/mp4" : "image/jpeg",
      }));

      setImages((prev) => [...prev, ...newImages]);
      setError("");
    }
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const validImages = images.filter((img) => img.type?.startsWith("image/"));
      const cents = Math.round(parseFloat(price) * 100);

      if (title.trim().length < 3) throw new Error("Title must be at least 3 characters.");
      if (description.trim().length < 10) throw new Error("Description must be at least 10 characters.");
      if (isNaN(cents) || cents < 1) throw new Error("Enter a valid price.");
      if (validImages.length < 1) throw new Error("Add at least one image.");

      // Create listing first
      const listing = await listingsApi.createListing({
        title: title.trim(),
        description: description.trim(),
        price: cents,
        condition,
        category,
        city: city.trim() || undefined,
        imageUrls: [], // Empty, will upload separately
      });

      // Upload images
      if (validImages.length > 0) {
        await uploadListingImagesNative(
          listing.id,
          validImages.map((img) => img.uri),
          validImages.map((img) => img.name),
        );
      }

      return listing;
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      router.push(`/listings/${listing.id}` as never);
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing[4], paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text
            style={{
              fontFamily: "Fraunces_700Bold",
              fontSize: 26,
              color: colors.primary,
              marginBottom: 4,
            }}
          >
            List an item
          </Text>
          <Text
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 14,
              color: colors.textMuted,
              marginBottom: spacing[6],
            }}
          >
            Your listing will be live immediately.
          </Text>

          {/* ── Title ───────────────────────────────────────────────── */}
          <Text style={labelStyle}>Title <Text style={{ color: colors.accent }}>*</Text></Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. iPhone 14 Pro 256GB"
            placeholderTextColor={colors.textMuted}
            maxLength={120}
            style={{ ...inputStyle, marginBottom: spacing[4] }}
          />

          {/* ── Description ─────────────────────────────────────────── */}
          <Text style={labelStyle}>Description <Text style={{ color: colors.accent }}>*</Text></Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the item — condition, accessories, reason for selling…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            maxLength={5000}
            textAlignVertical="top"
            style={{
              ...inputStyle,
              minHeight: 110,
              paddingTop: 12,
              marginBottom: spacing[4],
            }}
          />

          {/* ── Price ───────────────────────────────────────────────── */}
          <Text style={labelStyle}>Price (USD) <Text style={{ color: colors.accent }}>*</Text></Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            style={{ ...inputStyle, marginBottom: spacing[4] }}
          />

          {/* ── Condition ───────────────────────────────────────────── */}
          <Text style={labelStyle}>Condition <Text style={{ color: colors.accent }}>*</Text></Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: spacing[4],
            }}
          >
            {CONDITIONS.map((c) => (
              <Pressable
                key={c.value}
                onPress={() => setCondition(c.value)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: radii.md,
                  borderWidth: 1.5,
                  borderColor: condition === c.value ? colors.primary : colors.border,
                  backgroundColor: condition === c.value ? colors.primary : colors.surface,
                }}
              >
                <Text
                  style={{
                    fontFamily: "DMSans_500Medium",
                    fontSize: 13,
                    color: condition === c.value ? "#FAFAF8" : colors.text,
                  }}
                >
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Category ────────────────────────────────────────────── */}
          <Text style={labelStyle}>Category <Text style={{ color: colors.accent }}>*</Text></Text>
          <Pressable
            onPress={() => setCategoryPickerOpen(true)}
            style={{
              ...inputStyle,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing[4],
            }}
          >
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.text }}>
              {categoryLabel}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>▼</Text>
          </Pressable>

          {/* ── City ────────────────────────────────────────────────── */}
          <Text style={labelStyle}>City (optional)</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Harare"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
            style={{ ...inputStyle, marginBottom: spacing[4] }}
          />

          {/* ── Images ──────────────────────────────────────────────────── */}
          <Text style={labelStyle}>
            Images <Text style={{ color: colors.accent }}>*</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", color: colors.textMuted }}>
              {" "}({images.length}/10)
            </Text>
          </Text>

          {/* Image grid display */}
          {images.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: spacing[4],
              }}
            >
              {images.map((img, i) => (
                <View key={i} style={{ position: "relative", width: "48%", aspectRatio: 1 }}>
                  <Image
                    source={{ uri: img.uri }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: radii.md,
                      backgroundColor: colors.surface,
                    }}
                  />
                  {i === 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        backgroundColor: colors.accent,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: radii.sm,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "DMSans_600SemiBold",
                          fontSize: 10,
                          color: "#FFFFFF",
                        }}
                      >
                        Primary
                      </Text>
                    </View>
                  )}
                  <Pressable
                    onPress={() => removeImage(i)}
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 18, color: "#FFFFFF" }}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Error message */}
          {error && (
            <Text style={{ color: colors.accent, marginBottom: spacing[3], fontSize: 13 }}>
              {error}
            </Text>
          )}

          {/* Select images button */}
          <Pressable
            onPress={pickImages}
            disabled={images.length >= 10}
            style={{
              paddingVertical: 12,
              borderRadius: radii.md,
              borderWidth: 1.5,
              borderColor: images.length >= 10 ? colors.border : colors.primary,
              borderStyle: "dashed",
              alignItems: "center",
              marginBottom: spacing[6],
              opacity: images.length >= 10 ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontFamily: "DMSans_600SemiBold",
                fontSize: 14,
                color: images.length >= 10 ? colors.textMuted : colors.primary,
              }}
            >
              {images.length === 0 ? "📸 Select Images" : "+ Add More"}
            </Text>
          </Pressable>

          {/* ── Submit ──────────────────────────────────────────────── */}
          <Pressable
            onPress={() => mutation.mutate()}
            disabled={mutation.isPending}
            style={{
              height: 52,
              borderRadius: radii.md,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
              opacity: mutation.isPending ? 0.6 : 1,
              ...shadows.card,
            }}
          >
            <Text
              style={{
                fontFamily: "DMSans_700Bold",
                fontSize: 16,
                color: "#FFFFFF",
              }}
            >
              {mutation.isPending ? "Publishing…" : "Publish Listing"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category picker modal */}
      <CategoryPicker
        visible={categoryPickerOpen}
        value={category}
        onSelect={setCategory}
        onClose={() => setCategoryPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

