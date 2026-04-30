import {
  AmericanFootballIcon,
  ArrowUpDownIcon,
  Book01Icon,
  Briefcase01Icon,
  Cancel01Icon,
  Car01Icon,
  Chair01Icon,
  ClothesIcon,
  CpuIcon,
  FilterIcon,
  FlowerIcon,
  GridIcon,
  MoreHorizontalIcon,
  PlateIcon,
  Search01Icon,
  SmartPhone01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { ListingCard } from "@/components/listing-card";
import type { Category, Listing } from "@/lib/listings";
import { listingsApi } from "@/lib/listings";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOption = "newest" | "price_asc" | "price_desc";

type ConditionOption = "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";

const CONDITION_LABELS: Record<ConditionOption, string> = {
  BRAND_NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

const CONDITION_LIST: ConditionOption[] = ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR", "FOR_PARTS"];

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  price_asc: "Price: low → high",
  price_desc: "Price: high → low",
};

const SORT_CYCLE: SortOption[] = ["newest", "price_asc", "price_desc"];

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: IconSvgElement }[] = [
  { key: "ELECTRONICS", label: "Electronics", icon: CpuIcon },
  { key: "PHONES_TABLETS", label: "Phones", icon: SmartPhone01Icon },
  { key: "VEHICLES", label: "Vehicles", icon: Car01Icon },
  { key: "FURNITURE", label: "Furniture", icon: Chair01Icon },
  { key: "CLOTHING", label: "Clothing", icon: ClothesIcon },
  { key: "SPORTS_OUTDOORS", label: "Sports", icon: AmericanFootballIcon },
  { key: "HOME_GARDEN", label: "Home", icon: FlowerIcon },
  { key: "BOOKS_EDUCATION", label: "Books", icon: Book01Icon },
  { key: "FOOD_BEVERAGES", label: "Food", icon: PlateIcon },
  { key: "SERVICES", label: "Services", icon: Briefcase01Icon },
  { key: "OTHER", label: "Other", icon: MoreHorizontalIcon },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
const H_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

function SkeletonCard() {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        borderRadius: radii.md,
        backgroundColor: colors.surface2,
        overflow: "hidden",
      }}
    >
      <View style={{ width: "100%", aspectRatio: 4 / 3, backgroundColor: colors.border }} />
      <View style={{ padding: spacing[3], gap: spacing[1] }}>
        <View style={{ height: 10, width: "40%", borderRadius: radii.sm, backgroundColor: colors.border }} />
        <View style={{ height: 14, width: "85%", borderRadius: radii.sm, backgroundColor: colors.border }} />
        <View style={{ height: 14, width: "60%", borderRadius: radii.sm, backgroundColor: colors.border }} />
        <View style={{ height: 16, width: "30%", borderRadius: radii.sm, backgroundColor: colors.border, marginTop: 4 }} />
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function BrowseScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [condition, setCondition] = useState<ConditionOption | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [city, setCity] = useState("");
  // Staged filter state (applied only on "Apply")
  const [stagingCondition, setStagingCondition] = useState<ConditionOption | null>(null);
  const [stagingMin, setStagingMin] = useState("");
  const [stagingMax, setStagingMax] = useState("");
  const [stagingCity, setStagingCity] = useState("");

  const activeFilterCount = [condition, minPrice || maxPrice, city].filter(Boolean).length;

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["browse", { q: searchQuery || undefined, category: activeCategory, sort, condition, minPrice, maxPrice, city }],
    queryFn: () =>
      listingsApi.getListings({
        limit: 30,
        sort,
        ...(searchQuery && { q: searchQuery }),
        ...(activeCategory && { category: activeCategory }),
        ...(condition && { condition }),
        ...(minPrice && { minPrice: Math.round(parseFloat(minPrice) * 100) }),
        ...(maxPrice && { maxPrice: Math.round(parseFloat(maxPrice) * 100) }),
        ...(city && { city }),
      }),
    staleTime: 30_000,
  });

  const listings = data?.listings ?? [];
  const hasFilters = !!searchQuery || !!activeCategory || !!condition || !!minPrice || !!maxPrice || !!city;

  function cycleSortOrder() {
    const idx = SORT_CYCLE.indexOf(sort);
    setSort(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  }

  function renderListing({ item }: { item: Listing }) {
    return (
      <ListingCard
        id={item.id}
        imageUrl={item.images[0]?.url}
        condition={item.condition}
        category={item.category}
        title={item.title}
        sellerName={item.seller.displayName}
        city={item.city ?? item.seller.city ?? undefined}
        price={item.price}
      />
    );
  }

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.background, paddingBottom: 4 }}>

        {/* Title */}
        <View style={{ paddingHorizontal: H_PADDING, paddingTop: 16, paddingBottom: 12 }}>
          <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 26, color: colors.primary }}>
            Browse
          </Text>
        </View>

        {/* Search row */}
        <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: H_PADDING, marginBottom: spacing[3], gap: spacing[2] }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              height: 44,
              borderRadius: 9999,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing[3],
              gap: spacing[2],
              ...shadows.card,
            }}
          >
            <HugeiconsIcon icon={Search01Icon} size={16} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search listings…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={{ flex: 1, fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.text, padding: 0 }}
            />
          </View>
          <Pressable
            onPress={cycleSortOrder}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: sort !== "newest" ? colors.accent : colors.border,
              backgroundColor: sort !== "newest" ? colors.accent + "15" : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
              ...shadows.card,
            })}
          >
            <HugeiconsIcon icon={ArrowUpDownIcon} size={18} color={sort !== "newest" ? colors.accent : colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => {
              setStagingCondition(condition);
              setStagingMin(minPrice);
              setStagingMax(maxPrice);
              setStagingCity(city);
              setShowFilters(true);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: activeFilterCount > 0 ? colors.accent : colors.border,
              backgroundColor: activeFilterCount > 0 ? colors.accent + "15" : colors.surface,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
              ...shadows.card,
            })}
          >
            <HugeiconsIcon icon={FilterIcon} size={18} color={activeFilterCount > 0 ? colors.accent : colors.textSecondary} />
            {activeFilterCount > 0 && (
              <View style={{ position: "absolute", top: 5, right: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 9, color: "#fff" }}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {sort !== "newest" && (
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.accent, paddingHorizontal: H_PADDING, marginBottom: spacing[2], marginTop: -spacing[2] }}>
            {SORT_LABELS[sort]}
          </Text>
        )}

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingBottom: 12, gap: 8 }}>
          <Pressable
            onPress={() => setActiveCategory(null)}
            style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", height: 34, paddingHorizontal: 14, borderRadius: 9999, backgroundColor: activeCategory === null ? "#0D3B2E" : colors.surface2, borderWidth: 1, borderColor: activeCategory === null ? "#0D3B2E" : colors.border, gap: 5, opacity: pressed ? 0.85 : 1 })}
          >
            <HugeiconsIcon icon={GridIcon} size={14} color={activeCategory === null ? "#FAFAF8" : colors.textSecondary} />
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: activeCategory === null ? "#FAFAF8" : colors.textSecondary }}>All</Text>
          </Pressable>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setActiveCategory(isActive ? null : cat.key)}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", height: 34, paddingHorizontal: 14, borderRadius: 9999, backgroundColor: isActive ? "#0D3B2E" : colors.surface2, borderWidth: 1, borderColor: isActive ? "#0D3B2E" : colors.border, gap: 5, opacity: pressed ? 0.85 : 1 })}
              >
                <HugeiconsIcon icon={cat.icon} size={14} color={isActive ? "#FAFAF8" : colors.textSecondary} />
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: isActive ? "#FAFAF8" : colors.textSecondary }}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Results ──────────────────────────────────────────────── */}
      {isLoading ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: H_PADDING, gap: CARD_GAP, paddingTop: 4 }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 16 }}>Couldn't load listings.</Text>
          <Pressable onPress={() => refetch()} style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: radii.md, backgroundColor: colors.accent }}>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#fff" }}>Try again</Text>
          </Pressable>
        </View>
      ) : listings.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <HugeiconsIcon icon={SparklesIcon} size={40} color={colors.textMuted} />
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 16, color: colors.text, marginTop: 12, marginBottom: 4 }}>No listings found</Text>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted, textAlign: "center", marginBottom: 16 }}>Try a different search or category.</Text>
          {hasFilters && (
            <Pressable
              onPress={() => { setSearchQuery(""); setActiveCategory(null); setSort("newest"); setCondition(null); setMinPrice(""); setMaxPrice(""); setCity(""); }}
              style={{ paddingVertical: 8, paddingHorizontal: 18, borderRadius: 9999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.textSecondary }}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListing}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: CARD_GAP }}
          contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingTop: 4, paddingBottom: 24, gap: CARD_GAP }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />}
        />
      )}
    </SafeAreaView>

    {/* ── Filter sheet ──────────────────────────────────────────── */}
    <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: colors.background, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing[6], paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[5] }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text }}>Filters</Text>
            <Pressable onPress={() => setShowFilters(false)} hitSlop={8}>
              <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          {/* Condition */}
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: colors.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Condition</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing[5] }}>
            {CONDITION_LIST.map((c) => (
              <Pressable
                key={c}
                onPress={() => setStagingCondition(stagingCondition === c ? null : c)}
                style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9999, borderWidth: 1, borderColor: stagingCondition === c ? colors.primary : colors.border, backgroundColor: stagingCondition === c ? colors.primary : colors.surface }}
              >
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: stagingCondition === c ? "#FAFAF8" : colors.text }}>{CONDITION_LABELS[c]}</Text>
              </Pressable>
            ))}
          </View>
          {/* Price range */}
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: colors.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Price range (USD)</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: spacing[5] }}>
            <TextInput
              value={stagingMin}
              onChangeText={setStagingMin}
              keyboardType="decimal-pad"
              placeholder="Min"
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, height: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.text }}
            />
            <TextInput
              value={stagingMax}
              onChangeText={setStagingMax}
              keyboardType="decimal-pad"
              placeholder="Max"
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, height: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.text }}
            />
          </View>
          {/* City */}
          <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 13, color: colors.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>City</Text>
          <TextInput
            value={stagingCity}
            onChangeText={setStagingCity}
            placeholder="e.g. Harare"
            placeholderTextColor={colors.textMuted}
            style={{ height: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14, fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.text, marginBottom: spacing[6] }}
          />
          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={() => {
                setStagingCondition(null); setStagingMin(""); setStagingMax(""); setStagingCity("");
                setCondition(null); setMinPrice(""); setMaxPrice(""); setCity("");
                setShowFilters(false);
              }}
              style={{ flex: 1, height: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>Clear All</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCondition(stagingCondition); setMinPrice(stagingMin); setMaxPrice(stagingMax); setCity(stagingCity);
                setShowFilters(false);
              }}
              style={{ flex: 2, height: 48, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAFAF8" }}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}
