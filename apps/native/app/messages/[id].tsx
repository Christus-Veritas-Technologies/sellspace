import { ArrowLeft01Icon, Camera01Icon, Location01Icon, SentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
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
import { uploadChatImageNative } from "@/lib/uploads";
import { useServerEvents } from "@/lib/notifications";
import { getStoredUserId } from "@/lib/user";

// ─── Image bubble ────────────────────────────────────────────────────────────

function ImageBubble({ url, isMine }: { url: string; isMine: boolean }) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(url)}
      style={{
        borderRadius: radii.lg,
        borderBottomRightRadius: isMine ? radii.sm : radii.lg,
        borderBottomLeftRadius: isMine ? radii.lg : radii.sm,
        overflow: "hidden",
        borderWidth: isMine ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <Image
        source={{ uri: url }}
        style={{ width: 220, height: 220 }}
        resizeMode="cover"
      />
    </Pressable>
  );
}

// ─── Location bubble ─────────────────────────────────────────────────────────

function LocationBubble({ lat, lng, isMine }: { lat: number; lng: number; isMine: boolean }) {
  return (
    <Pressable
      onPress={() => void Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`)}
      style={{
        backgroundColor: isMine ? colors.primary : colors.surface,
        borderRadius: radii.lg,
        borderBottomRightRadius: isMine ? radii.sm : radii.lg,
        borderBottomLeftRadius: isMine ? radii.lg : radii.sm,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        borderWidth: isMine ? 0 : 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing[2],
        minWidth: 160,
      }}
    >
      <Text style={{ fontSize: 22 }}>📍</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "DMSans_600SemiBold",
            fontSize: 13,
            color: isMine ? colors.primaryForeground : colors.text,
          }}
        >
          Location shared
        </Text>
        <Text
          style={{
            fontFamily: "DMSans_400Regular",
            fontSize: 11,
            color: isMine ? "rgba(255,255,255,0.7)" : colors.textMuted,
            marginTop: 2,
          }}
        >
          Tap to open in Maps
        </Text>
      </View>
    </Pressable>
  );
}

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
      {msg.imageUrl != null ? (
        <ImageBubble url={msg.imageUrl} isMine={isMine} />
      ) : msg.latitude != null && msg.longitude != null ? (
        <LocationBubble lat={msg.latitude} lng={msg.longitude} isMine={isMine} />
      ) : (
        <View
          style={{
            backgroundColor: isMine ? colors.primary : colors.surface,
            borderRadius: radii.lg,
            borderBottomRightRadius: isMine ? radii.sm : radii.lg,
            borderBottomLeftRadius: isMine ? radii.lg : radii.sm,
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
      )}
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
  const [sendingLocation, setSendingLocation] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
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
      (old: { thread: NonNullable<typeof data>['thread'] } | undefined) => {
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

  async function handlePickImage() {
    if (sendingImage) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setSendingImage(true);
    try {
      const fileName = asset.fileName ?? `chat-${Date.now()}.jpg`;
      const { imageUrl } = await uploadChatImageNative(asset.uri, fileName);
      const { message } = await messagesApi.sendImageMessage(id, imageUrl);
      queryClient.setQueryData(
        ["thread", id],
        (old: { thread: NonNullable<typeof data>["thread"] } | undefined) => {
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
      // silently ignore on failure
    } finally {
      setSendingImage(false);
    }
  }

  async function handleShareLocation() {
    if (sendingLocation) return;
    setSendingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setSendingLocation(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { message } = await messagesApi.sendLocation(id, pos.coords.latitude, pos.coords.longitude);
      queryClient.setQueryData(
        ["thread", id],
        (old: { thread: NonNullable<typeof data>["thread"] } | undefined) => {
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
      // silently ignore – user may have denied permission
    } finally {
      setSendingLocation(false);
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      const { message } = await messagesApi.sendMessage(id, trimmed);
      queryClient.setQueryData(
        ["thread", id],
        (old: { thread: NonNullable<typeof data>['thread'] } | undefined) => {
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
              onPress={() => void handlePickImage()}
              disabled={sendingImage}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed || sendingImage ? 0.6 : 1,
              })}
            >
              {sendingImage ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <HugeiconsIcon icon={Camera01Icon} size={20} color={colors.primary} />
              )}
            </Pressable>
            <Pressable
              onPress={() => void handleShareLocation()}
              disabled={sendingLocation}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed || sendingLocation ? 0.6 : 1,
              })}
            >
              {sendingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <HugeiconsIcon icon={Location01Icon} size={20} color={colors.primary} />
              )}
            </Pressable>
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
