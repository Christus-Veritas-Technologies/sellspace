import {
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { listingsApi } from "@/lib/listings";
import type { Condition, Category } from "@/lib/listings";

// ─── Config ───────────────────────────────────────────────────────────────────

const CONDITION_CONFIG: Record<Condition, { label: string; bg: string; text: string; border?: string }> = {
  BRAND_NEW: { label: "Brand New", bg: "#0D3B2E", text: "#FAFAF8" },
  LIKE_NEW: { label: "Like New", bg: "#E8621A", text: "#FFFFFF" },
  GOOD: { label: "Good", bg: "#F4A61D", text: "#1A1A18" },
  FAIR: { label: "Fair", bg: "#EFEFEB", text: "#4A4A45", border: "#C8C8C0" },
  FOR_PARTS: { label: "For Parts", bg: "#FEE2E2", text: "#DC2626" },
};

const CATEGORY_LABELS: Record<Category, string> = {
  ELECTRONICS: "Electronics",
  PHONES_TABLETS: "Phones & Tablets",
  VEHICLES: "Vehicles",
  FURNITURE: "Furniture",
  CLOTHING: "Clothing",
  SPORTS_OUTDOORS: "Sports & Outdoors",
  HOME_GARDEN: "Home & Garden",
  BOOKS_EDUCATION: "Books & Education",
  FOOD_BEVERAGES: "Food & Beverages",
  SERVICES: "Services",
  OTHER: "Other",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Detail row for the info table ───────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.text }}>
        {value}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: listing, isLoading, isError, refetch } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getListing(id),
    enabled: !!id,
  });

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (isError || !listing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.text, marginBottom: 8 }}>
          Listing not found
        </Text>
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted, marginBottom: 20, textAlign: "center" }}>
          This listing may have been removed or is unavailable.
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.md, backgroundColor: colors.accent }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#fff" }}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const cond = CONDITION_CONFIG[listing.condition];
  const mainImage = listing.images[0]?.url;

  // ── Content ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.text} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.text, flex: 1 }}
        >
          {listing.title}
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main image */}
        <View style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.surface2 }}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: colors.surface2 }} />
          )}
        </View>

        {/* Condition + category chips */}
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 16,  paddingBottom: 4 }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: radii.sm,
              backgroundColor: cond.bg,
              ...(cond.border ? { borderWidth: 1, borderColor: cond.border } : {}),
            }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: cond.text }}>
              {cond.label}
            </Text>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: radii.sm,
              backgroundColor: colors.surface2,
            }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }}>
              {CATEGORY_LABELS[listing.category]}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: "Fraunces_700Bold",
            fontSize: 24,
            lineHeight: 30,
            color: colors.text,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          {listing.title}
        </Text>

        {/* Price */}
        <Text
          style={{
            fontFamily: "DMSans_700Bold",
            fontSize: 22,
            color: colors.accent,
            paddingHorizontal: 16,
            paddingBottom: 16,
          }}
        >
          ${(listing.price / 100).toFixed(2)}
        </Text>

        {/* Seller row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#0D3B2E",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#FAFAF8" }}>
              {initials(listing.seller.displayName)}
            </Text>
          </View>
          <View>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>
              {listing.seller.displayName ?? "Seller"}
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted }}>
              {listing.seller.city ?? listing.city ?? "Zimbabwe"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Fraunces_700Bold",
              fontSize: 18,
              color: colors.text,
              marginBottom: 10,
            }}
          >
            Description
          </Text>
          <Text
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 14,
              lineHeight: 22,
              color: colors.textSecondary,
            }}
          >
            {listing.description}
          </Text>
        </View>

        {/* Details table */}
        <View
          style={{
            marginHorizontal: 16,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            marginBottom: 8,
            ...shadows.card,
          }}
        >
          <DetailRow label="Condition" value={cond.label} />
          <DetailRow label="Category" value={CATEGORY_LABELS[listing.category]} />
          <DetailRow label="Location" value={listing.seller.city ?? listing.city ?? "Zimbabwe"} />
          <DetailRow label="Views" value={String(listing.views ?? 0)} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Listed
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.text }}>
              {formatDate(listing.createdAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <Pressable
          onPress={() => Alert.alert("Coming soon", "Offers are not yet available.")}
          style={({ pressed }) => ({
            flex: 1,
            height: 46,
            borderRadius: radii.md,
            backgroundColor: pressed ? "#C9521A" : colors.accent,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#fff" }}>
            Make an Offer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => Alert.alert("Coming soon", "Messaging is not yet available.")}
          style={({ pressed }) => ({
            flex: 1,
            height: 46,
            borderRadius: radii.md,
            backgroundColor: pressed ? colors.surface2 : colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>
            Message Seller
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
