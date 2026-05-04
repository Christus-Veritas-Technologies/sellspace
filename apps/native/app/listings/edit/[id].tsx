import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "@sellspace/ui/theme";
import { ListingForm } from "@/components/listing-form";
import { listingsApi } from "@/lib/listings";

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ["listings", id],
    queryFn: () => listingsApi.getListing(id),
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontFamily: "DMSans_700Bold", color: colors.accent, marginBottom: 8 }}>
          Error loading listing
        </Text>
        <Text style={{ fontFamily: "DMSans_400Regular", color: colors.textMuted, textAlign: "center" }}>
          This listing might have been removed or you don't have connection.
        </Text>
      </View>
    );
  }

  return (
    <ListingForm
      titleText="Edit listing"
      subtitleText="Update your item details. New images will replace current ones."
      submitButtonText="Save Changes"
      initialData={{
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        condition: listing.condition,
        category: listing.category,
        city: listing.city,
        imageUrls: listing.images.map(img => img.url),
        latitude: listing.latitude,
        longitude: listing.longitude,
      }}
      onSuccess={() => {
        router.back();
      }}
    />
  );
}