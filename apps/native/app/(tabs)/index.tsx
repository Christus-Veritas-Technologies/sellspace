import {
  AmericanFootballIcon,
  Book01Icon,
  Briefcase01Icon,
  Car01Icon,
  Chair01Icon,
  ClothesIcon,
  CpuIcon,
  FlowerIcon,
  GridIcon,
  MoreHorizontalIcon,
  Notification01Icon,
  PlateIcon,
  Search01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import type { IconSvgElement } from "@hugeicons/react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { ListingCard } from "@/components/listing-card";
import type { Category, Listing } from "@/lib/listings";
import { listingsApi } from "@/lib/listings";

// ─── Category config ──────────────────────────────────────────────────────────

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

function SkeletonCard({ width }: { width: number }) {
  return (
    <View
      style={{
        width,
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

// ─── List header ──────────────────────────────────────────────────────────────

function HomeHeader({
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
}: {
  activeCategory: Category | null;
  onCategorySelect: (cat: Category | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  return (
    <View>
      {/* Top row: Logo + notification */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing[4],
          paddingTop: spacing[4],
          paddingBottom: spacing[3],
        }}
      >
        <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 28, color: colors.primary }}>
          sell<Text style={{ color: colors.accent }}>space</Text>
        </Text>
        <Pressable hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <HugeiconsIcon icon={Notification01Icon} size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View
        style={{
          marginHorizontal: spacing[4],
          marginBottom: spacing[3],
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
          onChangeText={onSearchChange}
          placeholder="Search listings…"
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            fontFamily: "DMSans_400Regular",
            fontSize: 14,
            color: colors.text,
            padding: 0,
          }}
          returnKeyType="search"
        />
      </View>

      {/* Category scroll */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingHorizontal: spacing[4],
          paddingBottom: spacing[3],
          gap: spacing[2],
        }}
        renderItem={({ item }) => {
          const isActive = activeCategory === item.key;
          return (
            <Pressable
              onPress={() => onCategorySelect(isActive ? null : item.key)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing[3],
                paddingVertical: spacing[2],
                borderRadius: 9999,
                gap: spacing[1],
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: isActive ? colors.primary : colors.border,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <HugeiconsIcon
                icon={item.icon}
                size={16}
                color={isActive ? colors.primaryForeground : colors.textSecondary}
              />
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 13,
                  color: isActive ? colors.primaryForeground : colors.textSecondary,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Section header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing[4],
          paddingBottom: spacing[3],
        }}
      >
        <Text style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 22, color: colors.text }}>
          Just Listed
        </Text>
        <Pressable>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.accent }}>
            See all
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const PAGE_LIMIT = 15;

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["listings", { category: activeCategory, q: searchQuery || undefined }],
    queryFn: ({ pageParam }) =>
      listingsApi.getListings({
        sort: "newest",
        limit: PAGE_LIMIT,
        page: pageParam as number,
        ...(activeCategory && { category: activeCategory }),
        ...(searchQuery && { q: searchQuery }),
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 30_000,
  });

  const listings = data?.pages.flatMap((p) => p.listings) ?? [];

  // Skeleton placeholders — 4 cards filling 2 columns
  const CARD_GAP = 12;
  const H_PADDING = 16;
  const { width: screenWidth } = Dimensions.get("window");
  const cardWidth = (screenWidth - H_PADDING * 2 - CARD_GAP) / 2;

  function renderItem({ item }: { item: Listing }) {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? (
        <>
          <HomeHeader
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingHorizontal: H_PADDING,
              gap: CARD_GAP,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} width={cardWidth} />
            ))}
          </View>
        </>
      ) : isError ? (
        <>
          <HomeHeader
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing[8] }}>
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 14,
                color: colors.textMuted,
                textAlign: "center",
              }}
            >
              Couldn't load listings. Pull to refresh.
            </Text>
            <Pressable onPress={() => refetch()} style={{ marginTop: spacing[4] }}>
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: colors.accent }}>
                Try again
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={renderItem}
          columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: H_PADDING }}
          contentContainerStyle={{ gap: CARD_GAP, paddingBottom: 100 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <HomeHeader
              activeCategory={activeCategory}
              onCategorySelect={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View
                style={{
                  flexDirection: "row",
                  gap: CARD_GAP,
                  paddingHorizontal: H_PADDING,
                  paddingTop: CARD_GAP,
                }}
              >
                <SkeletonCard width={cardWidth} />
                <SkeletonCard width={cardWidth} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: spacing[10] }}>
              <HugeiconsIcon icon={GridIcon} size={40} color={colors.border} />
              <Text
                style={{
                  marginTop: spacing[3],
                  fontFamily: "DMSans_400Regular",
                  fontSize: 14,
                  color: colors.textMuted,
                }}
              >
                No listings yet. Be the first to sell!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
