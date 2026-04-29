import {
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Money02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, spacing } from "@sellspace/ui/theme";
import type { OfferMessage, OfferThread } from "@/lib/offers";
import { offersApi } from "@/lib/offers";
import { getStoredUserId } from "@/lib/user";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(cents: number) {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

const MSG_LABEL: Record<string, string> = {
  OFFER: "Offer",
  COUNTER: "Counter-offer",
  ACCEPT: "Accepted",
  DECLINE: "Declined",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: "Pending", bg: "#FEF3C7", text: "#D97706" },
  COUNTERED: { label: "Countered", bg: "#EFEFEB", text: "#4A4A45" },
  ACCEPTED: { label: "Accepted", bg: "#DCFCE7", text: "#16A34A" },
  DECLINED: { label: "Declined", bg: "#FEE2E2", text: "#DC2626" },
  EXPIRED: { label: "Expired", bg: "#EFEFEB", text: "#8A8A82" },
};

// ─── Offer message row ────────────────────────────────────────────────────────

function OfferRow({ msg, isMine }: { msg: OfferMessage; isMine: boolean }) {
  const isResolution = msg.type === "ACCEPT" || msg.type === "DECLINE";
  const label = MSG_LABEL[msg.type] ?? msg.type;

  return (
    <View
      style={{
        alignSelf: isMine ? "flex-end" : "flex-start",
        maxWidth: "80%",
        marginBottom: spacing[3],
        backgroundColor: isResolution
          ? msg.type === "ACCEPT" ? "#DCFCE7" : "#FEE2E2"
          : isMine ? colors.primary : colors.surface,
        borderRadius: radii.lg,
        borderWidth: isResolution || isMine ? 0 : 1,
        borderColor: colors.border,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
      }}
    >
      <Text
        style={{
          fontFamily: "DMSans_700Bold",
          fontSize: 11,
          color: isResolution
            ? msg.type === "ACCEPT" ? "#16A34A" : "#DC2626"
            : isMine ? "rgba(250,250,248,0.7)" : colors.textMuted,
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      {msg.amount > 0 && (
        <Text
          style={{
            fontFamily: "Fraunces_700Bold",
            fontSize: 20,
            color: isResolution
              ? msg.type === "ACCEPT" ? "#16A34A" : "#DC2626"
              : isMine ? colors.primaryForeground : colors.text,
          }}
        >
          {formatUSD(msg.amount)}
        </Text>
      )}
      <Text
        style={{
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          color: isResolution
            ? colors.textSecondary
            : isMine ? "rgba(250,250,248,0.6)" : colors.textMuted,
          marginTop: 4,
        }}
      >
        {new Date(msg.createdAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

// ─── Counter modal ────────────────────────────────────────────────────────────

function CounterModal({
  visible,
  onClose,
  onSubmit,
  pending,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  pending: boolean;
}) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  function handleSubmit() {
    setErr("");
    const cents = Math.round(parseFloat(val) * 100);
    if (!cents || isNaN(cents) || cents < 1) {
      setErr("Enter a valid counter-offer amount.");
      return;
    }
    onSubmit(cents);
  }

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
              marginBottom: spacing[4],
            }}
          >
            Counter-Offer
          </Text>

          <Text
            style={{
              fontFamily: "DMSans_500Medium",
              fontSize: 13,
              color: colors.textMuted,
              marginBottom: 6,
            }}
          >
            Your counter-offer (USD)
          </Text>

          <View style={{ position: "relative", marginBottom: spacing[4] }}>
            <Text
              style={{
                position: "absolute",
                left: 14,
                top: 13,
                fontFamily: "DMSans_400Regular",
                fontSize: 15,
                color: colors.textMuted,
                zIndex: 1,
              }}
            >
              $
            </Text>
            <TextInput
              value={val}
              onChangeText={setVal}
              keyboardType="decimal-pad"
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 15,
                color: colors.text,
                backgroundColor: colors.surface,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                paddingLeft: 28,
                paddingRight: 14,
                paddingVertical: 11,
              }}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>

          {err ? (
            <Text
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 13,
                color: colors.destructive,
                marginBottom: spacing[3],
              }}
            >
              {err}
            </Text>
          ) : null}

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
              <Text style={{ fontFamily: "DMSans_500Medium", fontSize: 15, color: colors.text }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={pending}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: radii.md,
                backgroundColor: colors.accent,
                alignItems: "center",
                opacity: pending ? 0.6 : 1,
              }}
            >
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: "#fff" }}>
                {pending ? "Sending…" : "Send Counter"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OfferScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [counterOpen, setCounterOpen] = useState(false);

  useEffect(() => {
    getStoredUserId().then(setMyUserId);
  }, []);

  const { data, isPending, isError } = useQuery({
    queryKey: ["offer-thread", id],
    queryFn: () => offersApi.getThreads().then((r) => {
      const t = r.threads.find((x) => x.id === id);
      if (!t) throw new Error("Thread not found");
      return { thread: t };
    }),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (action: Parameters<typeof offersApi.respond>[1]) =>
      offersApi.respond(id, action),
    onSuccess: (res) => {
      queryClient.setQueryData(["offer-thread", id], { thread: res.thread });
      queryClient.invalidateQueries({ queryKey: ["inbox-offers"] });
      setCounterOpen(false);
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  });

  const thread = data?.thread;
  const isSeller = myUserId === thread?.seller.id;
  const canAct =
    thread &&
    (thread.status === "PENDING" || thread.status === "COUNTERED");

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing[3],
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[3],
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: "DMSans_700Bold", fontSize: 15, color: colors.text }}
            >
              {thread?.listing.title ?? "Offer"}
            </Text>
            {thread ? (
              <View
                style={{
                  marginTop: 2,
                  alignSelf: "flex-start",
                  backgroundColor: STATUS_CONFIG[thread.status]?.bg ?? "#EFEFEB",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: radii.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: "DMSans_700Bold",
                    fontSize: 10,
                    color: STATUS_CONFIG[thread.status]?.text ?? colors.textMuted,
                  }}
                >
                  {STATUS_CONFIG[thread.status]?.label ?? thread.status}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Messages */}
        {isPending ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError || !thread ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
            <Text
              style={{ fontFamily: "DMSans_400Regular", fontSize: 14, color: colors.textMuted }}
            >
              Couldn&apos;t load offer.
            </Text>
          </View>
        ) : (
          <FlatList
            data={thread.messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{
              padding: spacing[4],
              paddingBottom:
                canAct ? spacing[4] : spacing[8],
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
            renderItem={({ item }) => (
              <OfferRow msg={item} isMine={item.sender.id === myUserId} />
            )}
          />
        )}

        {/* Action bar */}
        {canAct && thread ? (
          <View
            style={{
              flexDirection: "row",
              gap: spacing[3],
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[4],
              paddingBottom: spacing[8],
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {/* Decline — always shown */}
            <Pressable
              onPress={() =>
                Alert.alert("Decline offer?", "This cannot be undone.", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Decline",
                    style: "destructive",
                    onPress: () => mutation.mutate({ action: "decline" }),
                  },
                ])
              }
              disabled={mutation.isPending}
              style={{
                flex: 1,
                height: 48,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.destructive,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
                opacity: mutation.isPending ? 0.6 : 1,
              }}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} color={colors.destructive} />
              <Text
                style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: colors.destructive }}
              >
                Decline
              </Text>
            </Pressable>

            {/* Counter — seller only */}
            {isSeller && thread.status === "PENDING" && (
              <Pressable
                onPress={() => setCounterOpen(true)}
                disabled={mutation.isPending}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 6,
                  backgroundColor: colors.surface,
                  opacity: mutation.isPending ? 0.6 : 1,
                }}
              >
                <HugeiconsIcon icon={Money02Icon} size={16} color={colors.text} />
                <Text
                  style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: colors.text }}
                >
                  Counter
                </Text>
              </Pressable>
            )}

            {/* Accept */}
            <Pressable
              onPress={() =>
                Alert.alert("Accept offer?", "You're agreeing to complete the sale.", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Accept",
                    onPress: () => mutation.mutate({ action: "accept" }),
                  },
                ])
              }
              disabled={mutation.isPending}
              style={{
                flex: 1,
                height: 48,
                borderRadius: radii.md,
                backgroundColor: "#16A34A",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
                opacity: mutation.isPending ? 0.6 : 1,
              }}
            >
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color="#fff" />
              <Text style={{ fontFamily: "DMSans_700Bold", fontSize: 14, color: "#fff" }}>
                Accept
              </Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>

      <CounterModal
        visible={counterOpen}
        onClose={() => setCounterOpen(false)}
        onSubmit={(amount) => mutation.mutate({ action: "counter", amount })}
        pending={mutation.isPending}
      />
    </>
  );
}
