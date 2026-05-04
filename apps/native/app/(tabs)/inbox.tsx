import {
  CheckmarkCircle01Icon,
  Message01Icon,
  Money02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { colors, radii, shadows, spacing } from "@sellspace/ui/theme";
import type { MessageThread } from "@/lib/messages";
import { messagesApi } from "@/lib/messages";
import type { OfferThread } from "@/lib/offers";
import { offersApi } from "@/lib/offers";
import { useServerEvents } from "@/lib/notifications";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatUSD(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "Pending", bg: "#FEF3C7", text: "#D97706" },
  COUNTERED: { label: "Counter", bg: "#EFEFEB", text: "#4A4A45" },
  ACCEPTED: { label: "Accepted", bg: "#DCFCE7", text: "#16A34A" },
  DECLINED: { label: "Declined", bg: "#FEE2E2", text: "#DC2626" },
  EXPIRED: { label: "Expired", bg: "#EFEFEB", text: "#8A8A82" },
};

// ─── Thread row ───────────────────────────────────────────────────────────────

function ThreadRow({
  imageUrl,
  title,
  subtitle,
  meta,
  badge,
  unread,
  onPress,
}: {
  imageUrl?: string;
  title: string;
  subtitle: string;
  meta: string;
  badge?: { label: string; bg: string; text: string };
  unread?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[3],
        paddingHorizontal: spacing[5],
        paddingVertical: spacing[4],
        backgroundColor: pressed ? colors.surface2 : colors.surface,
      })}
    >
      {/* Thumbnail */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radii.md,
          backgroundColor: colors.surface2,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.border,
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: 52, height: 52 }} resizeMode="cover" />
        ) : null}
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 3,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "DMSans_700Bold",
              fontSize: 14,
              color: colors.text,
              flex: 1,
              marginRight: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 11,
              color: colors.textMuted,
              flexShrink: 0,
            }}
          >
            {meta}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {badge ? (
            <View
              style={{
                backgroundColor: badge.bg,
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: radii.sm,
              }}
            >
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 10, color: badge.text }}>
                {badge.label}
              </Text>
            </View>
          ) : null}
          <Text
            numberOfLines={1}
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 13,
              color: colors.textSecondary,
              flex: 1,
            }}
          >
            {subtitle}
          </Text>
          {unread ? (
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.accent,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 10, color: "#fff" }}>
                {unread > 9 ? "9+" : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginLeft: spacing[5] + 52 + spacing[3],
      }}
    />
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
      <Text
        style={{
          fontFamily: "DMSans_400Regular",
          fontSize: 14,
          color: colors.textMuted,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Tab = "messages" | "offers";

export default function InboxScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("messages");

  // Real-time: refresh inbox when a new message arrives via WebSocket
  useServerEvents((e) => {
    if (e.event === "message") {
      void queryClient.invalidateQueries({ queryKey: ["inbox-messages"] });
    }
  });

  const {
    data: msgData,
    isPending: msgPending,
    refetch: refetchMessages,
    isRefetching: msgRefetching,
  } = useQuery({
    queryKey: ["inbox-messages"],
    queryFn: () => messagesApi.getThreads(),
  });

  const {
    data: offersData,
    isPending: offersPending,
    refetch: refetchOffers,
    isRefetching: offersRefetching,
  } = useQuery({
    queryKey: ["inbox-offers"],
    queryFn: () => offersApi.getThreads(),
  });

  const tabs: { key: Tab; label: string; icon: Parameters<typeof HugeiconsIcon>[0]["icon"] }[] = [
    { key: "messages", label: "Messages", icon: Message01Icon },
    { key: "offers", label: "Offers", icon: Money02Icon },
  ];

  const isPending = activeTab === "messages" ? msgPending : offersPending;
  const isRefreshing = activeTab === "messages" ? msgRefetching : offersRefetching;

  function handleRefresh() {
    if (activeTab === "messages") void refetchMessages();
    else void refetchOffers();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing[5],
          paddingTop: spacing[5],
          paddingBottom: spacing[2],
        }}
      >
        <Text
          style={{
            fontFamily: "Fraunces_700Bold",
            fontSize: 24,
            color: colors.text,
          }}
        >
          Inbox
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing[5],
          gap: spacing[2],
          marginBottom: spacing[1],
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: radii.full,
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <HugeiconsIcon
                icon={tab.icon}
                size={14}
                color={active ? colors.primaryForeground : colors.textMuted}
              />
              <Text
                style={{
                  fontFamily: "DMSans_700Bold",
                  fontSize: 13,
                  color: active ? colors.primaryForeground : colors.textMuted,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.border, marginTop: spacing[2] }} />

      {/* Content */}
      {isPending ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === "messages" ? (
        <FlatList
          data={msgData?.threads ?? []}
          keyExtractor={(t) => t.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={
            <EmptyState label={"No messages yet.\nStart a conversation from a listing."} />
          }
          renderItem={({ item }: { item: MessageThread }) => {
            const last = item.messages[0];
            const other = item.listing;
            return (
              <ThreadRow
                imageUrl={other.images[0]?.url}
                title={other.title}
                subtitle={last?.body ?? "No messages yet"}
                meta={last ? timeAgo(last.createdAt) : ""}
                unread={item.unreadCount}
                onPress={() => router.push(`/messages/${item.id}` as never)}
              />
            );
          }}
        />
      ) : (
        <FlatList
          data={offersData?.threads ?? []}
          keyExtractor={(t) => t.id}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={
            <EmptyState label={"No offers yet.\nTap 'Make an Offer' on any listing."} />
          }
          renderItem={({ item }: { item: OfferThread }) => {
            const last = item.messages[0];
            const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
            return (
              <ThreadRow
                imageUrl={item.listing.images[0]?.url}
                title={item.listing.title}
                subtitle={
                  last
                    ? `${last.type === "OFFER" ? "Offer" : last.type === "COUNTER" ? "Counter" : last.type}: ${formatUSD(last.amount)}`
                    : ""
                }
                meta={timeAgo(item.updatedAt)}
                badge={statusCfg}
                onPress={() => router.push(`/offers/${item.id}` as never)}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

