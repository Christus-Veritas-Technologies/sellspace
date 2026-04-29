import {
  Edit01Icon,
  Logout01Icon,
  MapPinIcon,
  StarIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import { ListingCard } from "@/components/listing-card";
import type { Category, Condition } from "@/lib/listings";
import { tokenStorage } from "@/lib/auth";
import { getStoredUserId, userApi } from "@/lib/user";
import type { UpdateProfileBody, UserListingPreview } from "@/lib/user";
import { reviewsApi } from "@/lib/reviews";
import type { Review } from "@/lib/reviews";
import { uploadProfilePictureNative } from "@/lib/uploads";

// ─── Avatar circle ────────────────────────────────────────────────────────────

function AvatarCircle({
  name,
  avatarUrl,
  size = 72,
  onPress,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  onPress?: () => void;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Pressable onPress={onPress} style={{ position: "relative" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <Text
            style={{
              fontFamily: "Fraunces_700Bold",
              fontSize: size * 0.38,
              color: "#FAFAF8",
              lineHeight: size * 0.44,
            }}
          >
            {initials || "?"}
          </Text>
        )}
      </View>
      {onPress && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: size * 0.16, color: "#FFFFFF" }}>📷</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Edit profile modal ───────────────────────────────────────────────────────

function EditProfileModal({
  visible,
  displayName,
  city,
  onClose,
  onSave,
  saving,
}: {
  visible: boolean;
  displayName: string;
  city: string;
  onClose: () => void;
  onSave: (body: UpdateProfileBody) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(displayName);
  const [cityVal, setCityVal] = useState(city);

  useEffect(() => {
    if (visible) {
      setName(displayName);
      setCityVal(city);
    }
  }, [visible, displayName, city]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing[6],
            paddingBottom: 40,
          }}
        >
          <Text
            style={{
              fontFamily: "Fraunces_700Bold",
              fontSize: 20,
              color: colors.text,
              marginBottom: spacing[5],
            }}
          >
            Edit Profile
          </Text>

          {/* Display name */}
          <Text
            style={{
              fontFamily: "DMSans_500Medium",
              fontSize: 13,
              color: colors.textMuted,
              marginBottom: 6,
            }}
          >
            Display name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 15,
              color: colors.text,
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 14,
              paddingVertical: 11,
              marginBottom: spacing[4],
            }}
            placeholderTextColor={colors.textMuted}
            placeholder="Your name"
          />

          {/* City */}
          <Text
            style={{
              fontFamily: "DMSans_500Medium",
              fontSize: 13,
              color: colors.textMuted,
              marginBottom: 6,
            }}
          >
            City
          </Text>
          <TextInput
            value={cityVal}
            onChangeText={setCityVal}
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 15,
              color: colors.text,
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 14,
              paddingVertical: 11,
              marginBottom: spacing[6],
            }}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. Harare"
          />

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 15,
                  color: colors.text,
                }}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSave({ displayName: name.trim() || undefined, city: cityVal.trim() || undefined })}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: radii.md,
                backgroundColor: colors.primary,
                alignItems: "center",
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: "DMSans_700Bold",
                  fontSize: 15,
                  color: "#FAFAF8",
                }}
              >
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Load userId from stored JWT on mount
  useEffect(() => {
    getStoredUserId().then(setUserId);
  }, []);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => userApi.getUser(userId!),
    enabled: !!userId,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", userId],
    queryFn: () => reviewsApi.getSellerReviews(userId!),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (body: UpdateProfileBody) => userApi.updateMe(body),
    onSuccess: () => {
      setEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (err: Error) => {
      Alert.alert("Error", err.message);
    },
  });

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await tokenStorage.clearTokens();
          router.replace("/(auth)/login" as never);
        },
      },
    ]);
  }

  async function handleAvatarPress() {
    if (avatarUploading) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const fileName = asset.uri.split("/").pop() ?? `avatar-${Date.now()}.jpg`;

    try {
      setAvatarUploading(true);
      await uploadProfilePictureNative(asset.uri, fileName, "image/jpeg");
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (err) {
      Alert.alert("Upload failed", (err as Error).message);
    } finally {
      setAvatarUploading(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!userId || isPending) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
          <Text
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 15,
              color: colors.textMuted,
              textAlign: "center",
              marginBottom: spacing[4],
            }}
          >
            Couldn't load your profile.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: spacing[6],
              paddingVertical: 12,
              borderRadius: radii.md,
            }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAFAF8" }}>
              Retry
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { user, listings, listingCount } = data;
  const avgRating = reviewsData?.averageRating ?? null;
  const reviewCount = reviewsData?.reviewCount ?? 0;
  const reviews = reviewsData?.reviews ?? [];

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Header ─────────────────────────────────────────────────── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing[5],
              paddingTop: spacing[5],
              paddingBottom: spacing[3],
            }}
          >
            <Text
              style={{
                fontFamily: "Fraunces_700Bold",
                fontSize: 24,
                color: colors.text,
              }}
            >
              Profile
            </Text>
            <Pressable
              onPress={() => setEditOpen(true)}
              hitSlop={8}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.full,
                padding: 9,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <HugeiconsIcon icon={Edit01Icon} size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* ── Identity card ─────────────────────────────────────────── */}
          <View
            style={{
              marginHorizontal: spacing[5],
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing[5],
              alignItems: "center",
              ...shadows.card,
            }}
          >
            <AvatarCircle
              name={user.displayName}
              avatarUrl={user.avatarUrl}
              onPress={handleAvatarPress}
            />
            {avatarUploading && (
              <ActivityIndicator
                size="small"
                color={colors.accent}
                style={{ marginTop: 8 }}
              />
            )}
            <Text
              style={{
                fontFamily: "Fraunces_700Bold",
                fontSize: 22,
                color: colors.text,
                marginTop: spacing[3],
                textAlign: "center",
              }}
            >
              {user.displayName}
            </Text>

            {user.city ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
                <HugeiconsIcon icon={MapPinIcon} size={13} color={colors.textMuted} />
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 13,
                    color: colors.textMuted,
                  }}
                >
                  {user.city}
                </Text>
              </View>
            ) : null}

            {/* Stats */}
            <View
              style={{
                flexDirection: "row",
                marginTop: spacing[4],
                gap: spacing[6],
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text }}>
                  {listingCount}
                </Text>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {listingCount === 1 ? "Listing" : "Listings"}
                </Text>
              </View>
              {reviewCount > 0 && (
                <>
                  <View style={{ width: 1, height: 30, backgroundColor: colors.border }} />
                  <View style={{ alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <HugeiconsIcon icon={StarIcon} size={16} color={colors.amber} />
                      <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text }}>
                        {avgRating?.toFixed(1) ?? "—"}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {reviewCount === 1 ? "Review" : "Reviews"}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* ── Active listings ────────────────────────────────────────── */}
          {listings.length > 0 ? (
            <View style={{ marginTop: spacing[6] }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: spacing[5],
                  marginBottom: spacing[3],
                }}
              >
                <HugeiconsIcon icon={Tag01Icon} size={16} color={colors.text} />
                <Text
                  style={{
                    fontFamily: "DMSans_700Bold",
                    fontSize: 15,
                    color: colors.text,
                  }}
                >
                  Active Listings
                </Text>
              </View>
              <FlatList
                data={listings}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: spacing[5],
                  gap: spacing[3],
                }}
                renderItem={({ item }: { item: UserListingPreview }) => (
                  <ListingCard
                    id={item.id}
                    imageUrl={item.images[0]?.url}
                    condition={item.condition as Condition}
                    category={item.category as Category}
                    title={item.title}
                    sellerName={user.displayName}
                    city={item.city ?? undefined}
                    price={item.price}
                  />
                )}
              />
            </View>
          ) : null}

          {/* ── Reviews ───────────────────────────────────────────────── */}
          {reviews.length > 0 && (
            <View style={{ marginHorizontal: spacing[5], marginTop: spacing[6] }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing[3] }}>
                <HugeiconsIcon icon={StarIcon} size={16} color={colors.text} />
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>Reviews</Text>
              </View>
              {reviews.map((review: Review) => (
                <View
                  key={review.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing[4],
                    marginBottom: spacing[3],
                    ...shadows.card,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 13, color: "#FAFAF8" }}>
                          {review.reviewer.displayName
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase() ?? "")
                            .join("")}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: colors.text }}>
                        {review.reviewer.displayName}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <HugeiconsIcon
                          key={s}
                          icon={StarIcon}
                          size={13}
                          color={s <= review.rating ? colors.amber : colors.border}
                        />
                      ))}
                    </View>
                  </View>
                  {review.comment ? (
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted, lineHeight: 18 }}>
                      {review.comment}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {/* ── Account actions ────────────────────────────────────────── */}
          <View
            style={{
              marginHorizontal: spacing[5],
              marginTop: spacing[6],
              marginBottom: spacing[8],
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: spacing[3],
                padding: spacing[4],
                backgroundColor: pressed ? "#FEE2E2" : "transparent",
              })}
            >
              <HugeiconsIcon icon={Logout01Icon} size={20} color="#DC2626" />
              <Text
                style={{
                  fontFamily: "DMSans_500Medium",
                  fontSize: 15,
                  color: "#DC2626",
                }}
              >
                Log out
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <EditProfileModal
        visible={editOpen}
        displayName={user.displayName}
        city={user.city ?? ""}
        onClose={() => setEditOpen(false)}
        onSave={(body) => updateMutation.mutate(body)}
        saving={updateMutation.isPending}
      />
    </>
  );
}
