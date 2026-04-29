import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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

// ─── Image URL row ────────────────────────────────────────────────────────────

function ImageUrlRow({
  index,
  url,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  url: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <TextInput
        value={url}
        onChangeText={onChange}
        placeholder={`Image URL ${index + 1}`}
        placeholderTextColor={colors.textMuted}
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        style={{ ...inputStyle, flex: 1, fontSize: 13, paddingVertical: 10 }}
      />
      {canRemove && (
        <Pressable
          onPress={onRemove}
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: colors.surface2,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 18, color: colors.textMuted, lineHeight: 20 }}>
            ×
          </Text>
        </Pressable>
      )}
    </View>
  );
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
  const [imageUrls, setImageUrls] = useState<string[]>(["", ""]);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? category;

  function updateImageUrl(i: number, value: string) {
    const next = [...imageUrls];
    next[i] = value;
    setImageUrls(next);
  }

  function addImageRow() {
    if (imageUrls.length >= 10) return;
    setImageUrls((prev) => [...prev, ""]);
  }

  function removeImageRow(i: number) {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  const mutation = useMutation({
    mutationFn: () => {
      const validUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
      const cents = Math.round(parseFloat(price) * 100);

      if (title.trim().length < 3) throw new Error("Title must be at least 3 characters.");
      if (description.trim().length < 10) throw new Error("Description must be at least 10 characters.");
      if (isNaN(cents) || cents < 1) throw new Error("Enter a valid price.");
      if (validUrls.length < 1) throw new Error("Add at least one image URL.");

      return listingsApi.createListing({
        title: title.trim(),
        description: description.trim(),
        price: cents,
        condition,
        category,
        city: city.trim() || undefined,
        imageUrls: validUrls,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      router.push(`/listings/${data.id}` as never);
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

          {/* ── Image URLs ──────────────────────────────────────────── */}
          <Text style={labelStyle}>
            Images <Text style={{ color: colors.accent }}>*</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", color: colors.textMuted }}>
              {" "}(paste direct image URLs, min 1 max 10)
            </Text>
          </Text>

          {imageUrls.map((url, i) => (
            <ImageUrlRow
              key={i}
              index={i}
              url={url}
              onChange={(v) => updateImageUrl(i, v)}
              onRemove={() => removeImageRow(i)}
              canRemove={imageUrls.length > 1}
            />
          ))}

          {imageUrls.length < 10 && (
            <Pressable
              onPress={addImageRow}
              style={{
                paddingVertical: 10,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: "dashed",
                alignItems: "center",
                marginBottom: spacing[6],
                marginTop: 4,
              }}
            >
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.textMuted }}>
                + Add another image
              </Text>
            </Pressable>
          )}

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

