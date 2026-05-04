import {
  ArrowLeft01Icon,
  Bookmark01Icon,
  BookmarkAdd01Icon,
  Delete01Icon,
  Edit01Icon,
  FavouriteIcon,
  Flag01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
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
import { messagesApi } from "@/lib/messages";
import { offersApi } from "@/lib/offers";
import { reviewsApi } from "@/lib/reviews";
import { savedApi } from "@/lib/saved";
import type { Condition, Category } from "@/lib/listings";
import { listingsApi } from "@/lib/listings";
import { useAuth } from "@/contexts/auth-context";

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

// ─── Star row helper ──────────────────────────────────────────────────────────

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <HugeiconsIcon
          key={i}
          icon={i <= Math.round(rating) ? FavouriteIcon : StarIcon}
          size={size}
          color={i <= Math.round(rating) ? colors.amber : colors.border}
        />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ListingDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId, isSignedIn } = useAuth();

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsApi.getListing(id),
    enabled: !!id,
  });

  const isOwner = listing && userId === listing.sellerId;

  // ── Saved / offer / message / report / review state ────────────────────────
  const [saved, setSaved] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerError, setOfferError] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [messageError, setMessageError] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  const saveMutation = useMutation({
    mutationFn: async () => (saved ? savedApi.unsave(id) : savedApi.save(id)),
    onSuccess: (data) => setSaved(data.saved),
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  const offerMutation = useMutation({
    mutationFn: (amount: number) => offersApi.createOffer(id, amount),
    onSuccess: (data) => {
      setShowOfferModal(false);
      setOfferAmount("");
      setOfferError("");
      router.push(`/offers/${data.thread.id}` as never);
    },
    onError: (err: Error) => setOfferError(err.message),
  });

  const messageMutation = useMutation({
    mutationFn: (body: string) => messagesApi.startThread(id, body),
    onSuccess: (data) => {
      setShowMessageModal(false);
      setMessageBody("");
      setMessageError("");
      router.push(`/messages/${data.threadId}` as never);
    },
    onError: (err: Error) => setMessageError(err.message),
  });

  const reportMutation = useMutation({
    mutationFn: (reason: string) => savedApi.report(id, reason),
    onSuccess: () => {
      setShowReportModal(false);
      setReportReason("");
      setReportError("");
      Alert.alert("Reported", "Thank you for your report. We'll review it shortly.");
    },
    onError: (err: Error) => setReportError(err.message),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      reviewsApi.submitReview(listing!.seller.id, rating, comment || undefined),
    onSuccess: () => {
      setShowReviewModal(false);
      setReviewRating(0);
      setReviewComment("");
      setReviewError("");
      Alert.alert("Review submitted", "Thank you for your feedback!");
    },
    onError: (err: Error) => setReviewError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => listingsApi.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      Alert.alert("Deleted", "Listing has been removed.");
      router.replace("/(tabs)");
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  function handleDelete() {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  }

  function handleSubmitOffer() {
    const cents = Math.round(parseFloat(offerAmount) * 100);
    if (!cents || isNaN(cents) || cents < 1) {
      setOfferError("Enter a valid offer amount.");
      return;
    }
    offerMutation.mutate(cents);
  }

  function handleSubmitMessage() {
    if (!messageBody.trim()) {
      setMessageError("Message cannot be empty.");
      return;
    }
    messageMutation.mutate(messageBody.trim());
  }

  function handleSubmitReport() {
    if (reportReason.trim().length < 5) {
      setReportError("Please describe the issue (at least 5 characters).");
      return;
    }
    reportMutation.mutate(reportReason.trim());
  }

  function handleSubmitReview() {
    if (!reviewRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    reviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
  }

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
        <Pressable
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <HugeiconsIcon
            icon={saved ? BookmarkAdd01Icon : Bookmark01Icon}
            size={22}
            color={saved ? colors.accent : colors.textMuted}
          />
        </Pressable>
        {isOwner && (
          <View style={{ flexDirection: "row", gap: 12, marginLeft: 4 }}>
            <Pressable
              onPress={() => router.push(`/listings/edit/${id}` as never)}
              hitSlop={8}
            >
              <HugeiconsIcon icon={Edit01Icon} size={22} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              hitSlop={8}
            >
              <HugeiconsIcon icon={Delete01Icon} size={22} color={colors.destructive} />
            </Pressable>
          </View>
        )}
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}>
              {listing.seller.displayName ?? "Seller"}
            </Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted }}>
              {listing.seller.city ?? listing.city ?? "Zimbabwe"}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowReviewModal(true)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 12, color: colors.text }}>
              Rate Seller
            </Text>
          </Pressable>
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
          {listing.latitude != null && listing.longitude != null && (
            <Pressable
              onPress={() => void Linking.openURL(`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`)}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 12, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Map
              </Text>
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.primary }}>
                📍 View on Google Maps →
              </Text>
            </Pressable>
          )}
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
          onPress={() => setShowOfferModal(true)}
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
          onPress={() => setShowMessageModal(true)}
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

      {/* Report link */}
      <Pressable
        onPress={() => setShowReportModal(true)}
        style={{
          position: "absolute",
          bottom: 88,
          alignSelf: "center",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 12,
        }}
      >
        <HugeiconsIcon icon={Flag01Icon} size={12} color={colors.textMuted} />
        <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 12, color: colors.textMuted }}>
          Report this listing
        </Text>
      </Pressable>

      {/* ── Offer modal ──────────────────────────────────────────────────── */}
      <Modal visible={showOfferModal} animationType="slide" transparent onRequestClose={() => setShowOfferModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing[6], paddingBottom: 40 }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text, marginBottom: spacing[1] }}>Make an Offer</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted, marginBottom: spacing[5] }}>
              Asking: ${((listing?.price ?? 0) / 100).toFixed(2)}
            </Text>
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.text, marginBottom: 6 }}>Your offer (USD)</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginBottom: spacing[4] }}>
              <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.textMuted, marginRight: 6 }}>$</Text>
              <TextInput
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.text, paddingVertical: 11 }}
                autoFocus
              />
            </View>
            {!!offerError && <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.destructive, marginBottom: spacing[3] }}>{offerError}</Text>}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => setShowOfferModal(false)} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitOffer} disabled={offerMutation.isPending} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: "center", opacity: offerMutation.isPending ? 0.6 : 1 }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#fff" }}>{offerMutation.isPending ? "Sending…" : "Send Offer"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Message modal ─────────────────────────────────────────────────── */}
      <Modal visible={showMessageModal} animationType="slide" transparent onRequestClose={() => setShowMessageModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing[6], paddingBottom: 40 }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text, marginBottom: spacing[5] }}>Message Seller</Text>
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.text, marginBottom: 6 }}>Your message</Text>
            <TextInput
              value={messageBody}
              onChangeText={setMessageBody}
              multiline
              numberOfLines={4}
              placeholder="Hi, is this still available?"
              placeholderTextColor={colors.textMuted}
              style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.text, backgroundColor: colors.surface2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 90, textAlignVertical: "top", marginBottom: spacing[4] }}
              autoFocus
            />
            {!!messageError && <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.destructive, marginBottom: spacing[3] }}>{messageError}</Text>}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => setShowMessageModal(false)} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitMessage} disabled={messageMutation.isPending} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: "center", opacity: messageMutation.isPending ? 0.6 : 1 }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAFAF8" }}>{messageMutation.isPending ? "Sending…" : "Send Message"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Report modal ──────────────────────────────────────────────────── */}
      <Modal visible={showReportModal} animationType="slide" transparent onRequestClose={() => setShowReportModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing[6], paddingBottom: 40 }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text, marginBottom: 6 }}>Report Listing</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted, marginBottom: spacing[5] }}>Let us know why this listing is problematic.</Text>
            <TextInput
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              numberOfLines={4}
              placeholder="Describe the issue…"
              placeholderTextColor={colors.textMuted}
              style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.text, backgroundColor: colors.surface2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 90, textAlignVertical: "top", marginBottom: spacing[4] }}
              autoFocus
            />
            {!!reportError && <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.destructive, marginBottom: spacing[3] }}>{reportError}</Text>}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => setShowReportModal(false)} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitReport} disabled={reportMutation.isPending} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, backgroundColor: colors.destructive, alignItems: "center", opacity: reportMutation.isPending ? 0.6 : 1 }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#fff" }}>{reportMutation.isPending ? "Reporting…" : "Submit Report"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Review modal ──────────────────────────────────────────────────── */}
      <Modal visible={showReviewModal} animationType="slide" transparent onRequestClose={() => setShowReviewModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing[6], paddingBottom: 40 }}>
            <Text style={{ fontFamily: "Fraunces_700Bold", fontSize: 20, color: colors.text, marginBottom: 6 }}>Rate Seller</Text>
            <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.textMuted, marginBottom: spacing[4] }}>
              How was your experience with {listing?.seller?.displayName ?? "this seller"}?
            </Text>
            {/* Star picker */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: spacing[5] }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => setReviewRating(i)} hitSlop={8}>
                  <HugeiconsIcon
                    icon={i <= reviewRating ? FavouriteIcon : StarIcon}
                    size={32}
                    color={i <= reviewRating ? colors.amber : colors.border}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 13, color: colors.text, marginBottom: 6 }}>Comment (optional)</Text>
            <TextInput
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={3}
              placeholder="Share your experience…"
              placeholderTextColor={colors.textMuted}
              style={{ fontFamily: "DMSans_400Regular", fontSize: 15, color: colors.text, backgroundColor: colors.surface2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 80, textAlignVertical: "top", marginBottom: spacing[4] }}
            />
            {!!reviewError && <Text style={{ fontFamily: "DMSans_400Regular", fontSize: 13, color: colors.destructive, marginBottom: spacing[3] }}>{reviewError}</Text>}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => setShowReviewModal(false)} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.text }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmitReview} disabled={reviewMutation.isPending} style={{ flex: 1, paddingVertical: 13, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: "center", opacity: reviewMutation.isPending ? 0.6 : 1 }}>
                <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#FAFAF8" }}>{reviewMutation.isPending ? "Submitting…" : "Submit Review"}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
