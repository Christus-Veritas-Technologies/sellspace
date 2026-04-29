import { ArrowLeft01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radii, spacing } from "@sellspace/ui/theme";
import type { ChatMessage } from "@/lib/messages";
import { messagesApi } from "@/lib/messages";
import { useServerEvents } from "@/lib/notifications";
import { getStoredUserId } from "@/lib/user";

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isMine }: { msg: ChatMessage; isMine: boolean }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={{
        alignSelf: isMine ? "flex-end" : "flex-start",
        maxWidth: "78%",
        marginBottom: spacing[2],
      }}
    >
      {!isMine && (
        <Text
          style={{
            fontFamily: "DMSans_500Medium",
            fontSize: 11,
            color: colors.textMuted,
            marginBottom: 3,
            marginLeft: 4,
          }}
        >
          {msg.sender.displayName}
        </Text>
      )}
      <View
        style={{
          backgroundColor: isMine ? colors.primary : colors.surface,
          borderRadius: radii.lg,
          borderBottomRightRadius: isMine ? radii.xs : radii.lg,
          borderBottomLeftRadius: isMine ? radii.lg : radii.xs,
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[3],
          borderWidth: isMine ? 0 : 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: "DMSans_400Regular",
            fontSize: 14,
            color: isMine ? colors.primaryForeground : colors.text,
            lineHeight: 20,
          }}
        >
          {msg.body}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: "DMSans_400Regular",
          fontSize: 10,
          color: colors.textMuted,
          marginTop: 3,
          alignSelf: isMine ? "flex-end" : "flex-start",
          marginHorizontal: 4,
        }}
      >
        {time}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    getStoredUserId().then(setMyUserId);
  }, []);

  const { data, isPending, isError } = useQuery({
    queryKey: ["thread", id],
    queryFn: () => messagesApi.getThread(id),
    enabled: !!id,
  });

  // Scroll to bottom when messages load/update
  useEffect(() => {
    if (data?.thread.messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [data?.thread.messages.length]);

  // Real-time: inject incoming messages without full refetch
  useServerEvents((e) => {
    if (e.event !== "message" || e.threadId !== id) return;
    const incoming = e.message as ChatMessage;
    queryClient.setQueryData(
      ["thread", id],
      (old: { thread: typeof data.thread } | undefined) => {
        if (!old) return old;
        return {
          thread: {
            ...old.thread,
            messages: [...old.thread.messages, incoming],
          },
        };
      },
    );
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  });

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      const { message } = await messagesApi.sendMessage(id, trimmed);
      queryClient.setQueryData(
        ["thread", id],
        (old: { thread: typeof data.thread } | undefined) => {
          if (!old) return old;
          return {
            thread: {
              ...old.thread,
              messages: [...old.thread.messages, message],
            },
          };
        },
      );
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch {
      setText(trimmed); // restore on error
    } finally {
      setSending(false);
    }
  }

  const thread = data?.thread;
  const messages = thread?.messages ?? [];
  const other = thread ? (myUserId === thread.buyer.id ? thread.seller : thread.buyer) : null;

  return (
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
            style={{
              fontFamily: "DMSans_700Bold",
              fontSize: 15,
              color: colors.text,
            }}
          >
            {other?.displayName ?? "Chat"}
          </Text>
          {thread?.listing.title ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: "DMSans_400Regular",
                fontSize: 12,
                color: colors.textMuted,
              }}
            >
              {thread.listing.title}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Body */}
      {isPending ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[6] }}>
          <Text
            style={{
              fontFamily: "DMSans_400Regular",
              fontSize: 14,
              color: colors.textMuted,
              textAlign: "center",
            }}
          >
            Couldn&apos;t load messages.
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{
              padding: spacing[4],
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
            renderItem={({ item }) => (
              <Bubble msg={item} isMine={item.sender.id === myUserId} />
            )}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text
                  style={{
                    fontFamily: "DMSans_400Regular",
                    fontSize: 13,
                    color: colors.textMuted,
                  }}
                >
                  No messages yet. Say hello!
                </Text>
              </View>
            }
          />

          {/* Input bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: spacing[2],
              paddingHorizontal: spacing[4],
              paddingVertical: spacing[3],
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingBottom: spacing[6],
            }}
          >
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              maxLength={2000}
              style={{
                flex: 1,
                fontFamily: "DMSans_400Regular",
                fontSize: 15,
                color: colors.text,
                backgroundColor: colors.surface2,
                borderRadius: radii.xl,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 14,
                paddingVertical: 10,
                maxHeight: 100,
              }}
              placeholder="Type a message…"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable
              onPress={handleSend}
              disabled={!text.trim() || sending}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor:
                  text.trim() && !sending ? colors.accent : colors.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <HugeiconsIcon
                icon={SentIcon}
                size={20}
                color={text.trim() && !sending ? "#fff" : colors.textMuted}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
