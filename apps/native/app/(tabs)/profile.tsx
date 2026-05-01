import type React from "react";
import {
  Camera01Icon,
  Edit01Icon,
  Logout01Icon,
  MapPinIcon,
  StarIcon,
  Tag01Icon,
  BookmarkIcon,
  Message01Icon,
  UserLockIcon,
  UserSharingIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
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
import { savedApi } from "@/lib/saved";
import type { SavedListing } from "@/lib/saved";
import { messagesApi } from "@/lib/messages";
import type { MessageThread } from "@/lib/messages";
import { uploadProfilePictureNative } from "@/lib/uploads";
import { Avatar } from "@/components/avatar";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Edit profile modal ───────────────────────────────────────────────────────

function EditProfileModal({
  visible,
  displayName,
  city,
  isPrivate,
  onClose,
  onSave,
  saving,
}: {
  visible: boolean;
  displayName: string;
  city: string;
  isPrivate: boolean;
  onClose: () => void;
  onSave: (body: UpdateProfileBody) => void;
  saving: boolean;
}) {
  const [name, setName] = useState(displayName);
  const [cityVal, setCityVal] = useState(city);
  const [privateVal, setPrivateVal] = useState(isPrivate);

  useEffect(() => {
    if (visible) {
      setName(displayName);
      setCityVal(city);
      setPrivateVal(isPrivate);
    }
  }, [visible, displayName, city, isPrivate]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
            padding: spacing[6],
            paddingBottom: 40,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing[5] }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text }}>
              Edit Profile
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <HugeiconsIcon icon={Cancel01Icon} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>
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
            maxLength={80}
          />

          <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>
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
              marginBottom: spacing[5],
            }}
            placeholderTextColor={colors.textMuted}
            placeholder="e.g. Harare"
            maxLength={100}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing[6] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <HugeiconsIcon icon={privateVal ? UserLockIcon : UserSharingIcon} size={18} color={colors.textMuted} />
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 14, color: colors.text }}>Private profile</Text>
            </View>
            <Switch
              value={privateVal}
              onValueChange={setPrivateVal}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>

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
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.text }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave({ displayName: name.trim() || undefined, city: cityVal.trim() || undefined, isPrivate: privateVal })}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: radii.md,
                backgroundColor: colors.primary,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FAFAF8" />
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#FAFAF8" />
              )}
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAFAF8" }}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Saved tab ────────────────────────────────────────────────────────────────

function SavedPanel({ userId }: { userId: string }) {
  const { data, isPending } = useQuery({
    queryKey: ["saved", userId],
    queryFn: () => savedApi.getSaved(),
  });

  if (isPending) {
    return (
      <View style={{ padding: spacing[5], alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const items = data?.saved ?? [];

  if (!items.length) {
    return (
      <View style={{ padding: spacing[5], alignItems: "center", gap: 12 }}>
        <HugeiconsIcon icon={BookmarkIcon} size={36} color={colors.border} />
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
          You haven't saved any items yet.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      numColumns={2}
      columnWrapperStyle={{ gap: spacing[3] }}
      ItemSeparatorComponent={() => <View style={{ height: spacing[3] }} />}
      contentContainerStyle={{ paddingHorizontal: spacing[5], paddingBottom: spacing[4] }}
      renderItem={({ item }: { item: SavedListing }) => (
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          {item.images[0] ? (
            <Image source={{ uri: item.images[0].url }} style={{ width: "100%", aspectRatio: 1 }} resizeMode="cover" />
          ) : (
            <View style={{ width: "100%", aspectRatio: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2 }}>
              <HugeiconsIcon icon={Tag01Icon} size={24} color={colors.border} />
            </View>
          )}
          <View style={{ padding: 10 }}>
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.text }} numberOfLines={2}>{item.title}</Text>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: colors.accent, marginTop: 4 }}>{formatPrice(item.price)}</Text>
          </View>
        </View>
      )}
    />
  );
}

// ─── Messages tab ─────────────────────────────────────────────────────────────

function MessagesPanel({ userId }: { userId: string }) {
  const router = useRouter();
  const { data, isPending } = useQuery({
    queryKey: ["message-threads"],
    queryFn: () => messagesApi.getThreads(),
  });

  if (isPending) {
    return (
      <View style={{ padding: spacing[5], alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const threads = data?.threads ?? [];

  if (!threads.length) {
    return (
      <View style={{ padding: spacing[5], alignItems: "center", gap: 12 }}>
        <HugeiconsIcon icon={Message01Icon} size={36} color={colors.border} />
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
          No messages yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing[5], gap: spacing[3] }}>
      {threads.map((thread: MessageThread) => {
        const other = thread.buyer.id === userId ? thread.seller : thread.buyer;
        const lastMsg = thread.messages[0];
        const hasUnread = thread.unreadCount > 0;
        return (
          <Pressable
            key={thread.id}
            onPress={() => router.push(`/messages/${thread.id}` as never)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
            }}
          >
            <Avatar name={other.displayName} avatarUrl={other.avatarUrl} size={44} />
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: hasUnread ? "DMSans_700Bold" : "DMSans_500Medium", fontSize: 14, color: colors.text, flex: 1 }} numberOfLines={1}>
                  {other.displayName}
                </Text>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted }}>
                  {lastMsg ? timeAgo(lastMsg.createdAt) : timeAgo(thread.createdAt)}
                </Text>
              </View>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
                {lastMsg ? lastMsg.body : thread.listing.title}
              </Text>
            </View>
            {hasUnread && (
              <View style={{ minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 11, color: "#FFFFFF" }}>{thread.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

// ─── Animated identity card wrapper ──────────────────────────────────────────

function IdentityCard({ children, style }: { children: React.ReactNode; style?: object }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Tab = "listings" | "saved" | "messages";

export default function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [tab, setTab] = useState<Tab>("listings");

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
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure?", [
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
    const fileName = asset.fileName ?? asset.uri.split("/").pop() ?? `avatar-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? "image/jpeg";
    try {
      setAvatarUploading(true);
      await uploadProfilePictureNative(asset.uri, fileName, mimeType);
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch (err) {
      Alert.alert("Upload failed", (err as Error).message);
    } finally {
      setAvatarUploading(false);
    }
  }

  if (!userId || isPending) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.textMuted, textAlign: "center", marginBottom: spacing[4] }}>
            Couldn't load your profile.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ backgroundColor: colors.primary, paddingHorizontal: spacing[6], paddingVertical: 12, borderRadius: radii.md }}
          >
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAFAF8" }}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { user, listings, listingCount } = data;
  const avgRating = reviewsData?.averageRating ?? null;
  const reviewCount = reviewsData?.reviewCount ?? 0;
  const reviews = reviewsData?.reviews ?? [];

  const TABS: { id: Tab; label: string; icon: typeof Tag01Icon }[] = [
    { id: "listings", label: "Listings", icon: Tag01Icon },
    { id: "saved", label: "Saved", icon: BookmarkIcon },
    { id: "messages", label: "Messages", icon: Message01Icon },
  ];

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing[5], paddingTop: spacing[5], paddingBottom: spacing[3] }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 24, color: colors.text }}>Profile</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => setEditOpen(true)}
                hitSlop={8}
                style={{ backgroundColor: colors.surface, borderRadius: radii.full, padding: 9, borderWidth: 1, borderColor: colors.border }}
              >
                <HugeiconsIcon icon={Edit01Icon} size={18} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={handleLogout}
                hitSlop={8}
                style={{ backgroundColor: colors.surface, borderRadius: radii.full, padding: 9, borderWidth: 1, borderColor: colors.border }}
              >
                <HugeiconsIcon icon={Logout01Icon} size={18} color="#DC2626" />
              </Pressable>
            </View>
          </View>

          {/* Identity card */}
          <IdentityCard style={{
              marginHorizontal: spacing[5],
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.card,
              overflow: "hidden",
            }}
          >
            <View style={{ padding: spacing[5], alignItems: "center" }}>
              <Pressable onPress={handleAvatarPress} style={{ position: "relative" }}>
                <Avatar name={user.displayName} avatarUrl={user.avatarUrl} size={88} />
                <View style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: colors.accent,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <HugeiconsIcon icon={Camera01Icon} size={14} color="#FFFFFF" />
                </View>
              </Pressable>

              {avatarUploading && <ActivityIndicator size="small" color={colors.accent} style={{ marginTop: 8 }} />}

              <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 22, color: colors.text, marginTop: spacing[3], textAlign: "center" }}>
                {user.displayName}
              </Text>

              {user.city ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
                  <HugeiconsIcon icon={MapPinIcon} size={13} color={colors.textMuted} />
                  <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted }}>{user.city}</Text>
                </View>
              ) : null}

              {/* Privacy indicator */}
              <View style={{
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: radii.full,
                backgroundColor: user.isPrivate ? "#FEF3C7" : "#DCFCE7",
              }}>
                <HugeiconsIcon icon={user.isPrivate ? UserLockIcon : UserSharingIcon} size={13} color={user.isPrivate ? "#D97706" : "#16A34A"} />
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: user.isPrivate ? "#D97706" : "#16A34A" }}>
                  {user.isPrivate ? "Private profile" : "Public profile"}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border }}>
              <View style={{ flex: 1, paddingVertical: spacing[4], alignItems: "center" }}>
                <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 22, color: colors.text }}>{listingCount}</Text>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  {listingCount === 1 ? "Listing" : "Listings"}
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ flex: 1, paddingVertical: spacing[4], alignItems: "center" }}>
                {reviewCount > 0 ? (
                  <>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <HugeiconsIcon icon={StarIcon} size={16} color={colors.amber} />
                      <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 22, color: colors.text }}>{avgRating?.toFixed(1) ?? "—"}</Text>
                    </View>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {reviewCount === 1 ? "Review" : "Reviews"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 22, color: colors.textMuted }}>—</Text>
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>No reviews</Text>
                  </>
                )}
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ flex: 1, paddingVertical: spacing[4], alignItems: "center" }}>
                <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 22, color: colors.primary }}>100%</Text>
                <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Verified</Text>
              </View>
            </View>
          </IdentityCard>

          {/* Tab bar */}
          <View style={{ flexDirection: "row", marginHorizontal: spacing[5], marginTop: spacing[5], backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
            {TABS.map(({ id, label, icon }) => (
              <Pressable
                key={id}
                onPress={() => setTab(id)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 5,
                  borderBottomWidth: 2,
                  borderBottomColor: tab === id ? colors.accent : "transparent",
                  backgroundColor: tab === id ? colors.background : colors.surface,
                }}
              >
                <HugeiconsIcon icon={icon} size={15} color={tab === id ? colors.accent : colors.textMuted} />
                <Text style={{ fontFamily: "DMSans_600SemiBold", fontSize: 13, color: tab === id ? colors.accent : colors.textMuted }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab panels */}
          <View style={{ marginTop: spacing[4], paddingBottom: spacing[8] }}>
            {tab === "listings" && (
              <View style={{ gap: spacing[6] }}>
                {/* Listings */}
                {listings.length > 0 ? (
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing[5], marginBottom: spacing[3] }}>
                      <HugeiconsIcon icon={Tag01Icon} size={16} color={colors.text} />
                      <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>Active Listings</Text>
                    </View>
                    <FlatList
                      data={listings}
                      keyExtractor={(item) => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: spacing[5], gap: spacing[3] }}
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
                ) : (
                  <View style={{ paddingHorizontal: spacing[5], paddingVertical: spacing[6], alignItems: "center", gap: 12 }}>
                    <HugeiconsIcon icon={Tag01Icon} size={36} color={colors.border} />
                    <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
                      No active listings yet.
                    </Text>
                  </View>
                )}

                {/* Reviews */}
                {reviews.length > 0 && (
                  <View style={{ paddingHorizontal: spacing[5] }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing[3] }}>
                      <HugeiconsIcon icon={StarIcon} size={16} color={colors.text} />
                      <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>Reviews</Text>
                    </View>
                    {reviews.map((review: Review) => (
                      <View
                        key={review.id}
                        style={{ backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing[4], marginBottom: spacing[3], ...shadows.card }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Avatar name={review.reviewer.displayName} avatarUrl={review.reviewer.avatarUrl} size={32} />
                            <Text style={{ fontFamily: "DMSans_600SemiBold", fontSize: 14, color: colors.text }}>
                              {review.reviewer.displayName ?? "User"}
                            </Text>
                          </View>
                          <View style={{ flexDirection: "row", gap: 2 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <HugeiconsIcon key={i} icon={StarIcon} size={12} color={i < review.rating ? colors.amber : colors.border} />
                            ))}
                          </View>
                        </View>
                        {review.comment ? (
                          <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
                            {review.comment}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {tab === "saved" && userId && <SavedPanel userId={userId} />}
            {tab === "messages" && userId && <MessagesPanel userId={userId} />}
          </View>
        </ScrollView>
      </SafeAreaView>

      <EditProfileModal
        visible={editOpen}
        displayName={user.displayName}
        city={user.city ?? ""}
        isPrivate={user.isPrivate ?? false}
        onClose={() => setEditOpen(false)}
        onSave={(body) => updateMutation.mutate(body)}
        saving={updateMutation.isPending}
      />
    </>
  );
}

