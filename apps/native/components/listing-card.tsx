import { BookmarkAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { Dimensions } from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Condition = "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";
export type Category =
  | "ELECTRONICS"
  | "PHONES_TABLETS"
  | "VEHICLES"
  | "FURNITURE"
  | "CLOTHING"
  | "SPORTS_OUTDOORS"
  | "HOME_GARDEN"
  | "BOOKS_EDUCATION"
  | "FOOD_BEVERAGES"
  | "SERVICES"
  | "OTHER";

export interface ListingCardProps {
  id: string;
  imageUrl?: string;
  condition: Condition;
  category: Category;
  title: string;
  sellerName: string;
  city?: string;
  /** Price in cents */
  price: number;
  /** Original price in cents (for strikethrough) */
  originalPrice?: number;
  saved?: boolean;
  onSave?: () => void;
}

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
  PHONES_TABLETS: "Phones",
  VEHICLES: "Vehicles",
  FURNITURE: "Furniture",
  CLOTHING: "Clothing",
  SPORTS_OUTDOORS: "Sports",
  HOME_GARDEN: "Home & Garden",
  BOOKS_EDUCATION: "Books",
  FOOD_BEVERAGES: "Food & Drinks",
  SERVICES: "Services",
  OTHER: "Other",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
// 2 columns, 16px gutters on each side, 12px gap between columns
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 12) / 2;

// ─── Component ───────────────────────────────────────────────────────────────

export function ListingCard({
  id,
  imageUrl,
  condition,
  category,
  title,
  sellerName,
  city,
  price,
  originalPrice,
  saved = false,
  onSave,
}: ListingCardProps) {
  const router = useRouter();
  const cond = CONDITION_CONFIG[condition];

  const formattedPrice = `$${(price / 100).toFixed(2)}`;
  const formattedOriginal = originalPrice ? `$${(originalPrice / 100).toFixed(2)}` : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/listings/${id}` as never)}
      style={({ pressed }) => ({
        width: CARD_WIDTH,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: "hidden",
        opacity: pressed ? 0.92 : 1,
        ...shadows.card,
      })}
    >
      {/* Image */}
      <View style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.surface2 }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: colors.surface2 }} />
        )}

        {/* Condition badge */}
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            paddingHorizontal: spacing[2],
            paddingVertical: 3,
            borderRadius: radii.sm,
            backgroundColor: cond.bg,
            ...(cond.border && { borderWidth: 1, borderColor: cond.border }),
          }}
        >
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: cond.text }}>
            {cond.label}
          </Text>
        </View>

        {/* Bookmark */}
        <Pressable
          onPress={onSave}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.85)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HugeiconsIcon
            icon={BookmarkAdd01Icon}
            size={16}
            color={saved ? colors.accent : colors.textMuted}
          />
        </Pressable>
      </View>

      {/* Content */}
      <View style={{ padding: spacing[3] }}>
        <Text
          style={{
            fontFamily: "DMSans_700Bold",
            fontSize: 11,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 3,
          }}
        >
          {CATEGORY_LABELS[category]}
        </Text>

        <Text
          numberOfLines={2}
          style={{
            fontFamily: "DMSans_700Bold",
            fontSize: 14,
            lineHeight: 18,
            color: colors.text,
            marginBottom: 3,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontFamily: "DMSans_400Regular",
            fontSize: 12,
            color: colors.textMuted,
            marginBottom: spacing[2],
          }}
        >
          {sellerName}{city ? ` · ${city}` : ""}
        </Text>

        {/* Price row */}
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.accent }}>
            {formattedPrice}
          </Text>
          {formattedOriginal && (
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 13,
                color: colors.textMuted,
                textDecorationLine: "line-through",
              }}
            >
              {formattedOriginal}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
