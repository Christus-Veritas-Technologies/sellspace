"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback, useTransition } from "react";
import { motion } from "framer-motion";
import { Camera01Icon, Location01Icon, Message01Icon } from "hugeicons-react";

import { sendMessage, sendLocationMessage, sendImageMessage } from "./_actions";

const ListingMap = dynamic(
  () => import("@/components/listing-map").then((m) => m.ListingMap),
  { ssr: false, loading: () => <div className="h-[160px] rounded-[14px] bg-[#F2F2EF] animate-pulse" /> },
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  body: string;
  imageUrl?: string | null;
  createdAt: string;
  readAt: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sender: { id: string; displayName: string | null };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const COMMON_EMOJIS = [
  "😀", "😂", "🥹", "😍", "🥰", "😎", "🤩", "🥳",
  "😢", "😭", "😤", "🤔", "🙄", "😏", "😒", "🤗",
  "😊", "😄", "🤣", "😅", "😇", "🥲", "😜", "🫠",
  "👍", "👎", "👌", "🤝", "🙏", "✌️", "🤞", "💪",
  "🫶", "❤️", "🔥", "💯", "✅", "❌", "⚡", "💡",
  "🎉", "🎊", "💰", "🌟", "🎯", "🚀", "🌈", "🛒",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReadTicks({ readAt }: { readAt: string | null }) {
  if (readAt) {
    return (
      <span className="text-[10px] font-[700]" style={{ color: "#E8621A" }}>
        ✓✓
      </span>
    );
  }
  return <span className="text-[10px] text-white/50">✓</span>;
}

function LocationBubble({ lat, lng, isMe }: { lat: number; lng: number; isMe: boolean }) {
  return (
    <div className={`w-[260px] rounded-[14px] overflow-hidden border ${isMe ? "border-white/20" : "border-[#E2E2DC]"}`}>
      <ListingMap lat={lat} lng={lng} height={160} />
      <a
        href={`https://maps.google.com/?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-1.5 py-2 text-[12px] font-[600] transition-colors ${
          isMe ? "bg-[#C9521A] text-white hover:bg-[#B0461A]" : "bg-white text-[#E8621A] hover:bg-[#FEF3EE]"
        }`}
      >
        <Location01Icon size={14} color="currentColor" />
        <span>Open in Google Maps</span>
      </a>
    </div>
  );
}

function ImageBubble({ url, isMe }: { url: string; isMe: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-[14px] overflow-hidden border ${
        isMe ? "border-white/20" : "border-[#E2E2DC]"
      }`}
      style={{ maxWidth: 260 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Sent image"
        className="block w-full max-h-[220px] object-cover"
        loading="lazy"
      />
    </a>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChatClient({
  threadId,
  initialMessages,
  currentUserId,
  otherUserId,
  otherUserName,
  initialOnline,
}: {
  threadId: string;
  initialMessages: Message[];
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  initialOnline: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [locationPending, setLocationPending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(initialOnline);
  const [showEmoji, setShowEmoji] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSentRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }, 50);
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // WebSocket connection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    async function connect() {
      if (destroyed) return;
      try {
        const tokenRes = await fetch("/api/auth/token");
        const { token } = (await tokenRes.json()) as { token: string | null };
        if (!token || destroyed) return;

        const wsBase = (process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:9999")
          .replace(/^https/, "wss")
          .replace(/^http/, "ws");

        ws = new WebSocket(`${wsBase}/ws?token=${encodeURIComponent(token)}`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (destroyed) {
            ws?.close();
            return;
          }
          // Broadcast presence to notify other user we're online
          ws?.send(JSON.stringify({ event: "presence", status: "online", threadId }));
          // Immediately acknowledge any unread messages
          ws?.send(JSON.stringify({ event: "read", threadId }));
        };

        ws.onmessage = (e) => {
          if (destroyed) return;
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(e.data as string) as Record<string, unknown>;
          } catch {
            return;
          }

          // New message in this thread
          if (data.event === "message" && data.threadId === threadId) {
            const msg = data.message as Message;
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            scrollToBottom();
            // Acknowledge read
            wsRef.current?.send(JSON.stringify({ event: "read", threadId }));
          }

          // Other user is typing
          if (data.event === "typing" && data.threadId === threadId) {
            setIsOtherTyping(true);
            if (typingClearRef.current) clearTimeout(typingClearRef.current);
            typingClearRef.current = setTimeout(
              () => setIsOtherTyping(false),
              3000,
            );
          }

          // Other user read our messages
          if (data.event === "read" && data.threadId === threadId) {
            const now = new Date().toISOString();
            setMessages((prev) =>
              prev.map((m) =>
                m.sender.id === currentUserId && !m.readAt
                  ? { ...m, readAt: now }
                  : m,
              ),
            );
          }

          // Presence update
          if (data.event === "presence" && data.userId === otherUserId) {
            setIsOtherOnline(data.online as boolean);
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          if (!destroyed) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch {
        if (!destroyed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    }

    void connect();

    return () => {
      destroyed = true;
      ws?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      if (typingSentRef.current) clearTimeout(typingSentRef.current);
    };
  }, [threadId, currentUserId, otherUserId, scrollToBottom]);

  function handleBodyChange(value: string) {
    setBody(value);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Throttle: send typing event at most once per 2 s
      if (!typingSentRef.current) {
        wsRef.current.send(JSON.stringify({ event: "typing", threadId }));
      }
      if (typingSentRef.current) clearTimeout(typingSentRef.current);
      typingSentRef.current = setTimeout(() => {
        typingSentRef.current = null;
      }, 2000);
    }
  }

  function insertEmoji(emoji: string) {
    setBody((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  async function handleImageUpload(file: File) {
    setError("");
    setImageUploading(true);
    const tempId = `temp-img-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    const tempMsg: Message = {
      id: tempId,
      body: "Photo",
      imageUrl: localUrl,
      createdAt: new Date().toISOString(),
      readAt: null,
      sender: { id: currentUserId, displayName: null },
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/uploads/message", { method: "POST", body: form });
      const uploadData = (await uploadRes.json()) as { imageUrl?: string; error?: string };
      if (!uploadRes.ok || !uploadData.imageUrl) throw new Error(uploadData.error ?? "Upload failed");

      const sendData = await sendImageMessage(threadId, uploadData.imageUrl);
      const msg = (sendData as { message: Message }).message;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
    } catch (err: unknown) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setError((err as Error).message ?? "Failed to send image.");
    } finally {
      URL.revokeObjectURL(localUrl);
      setImageUploading(false);
    }
  }

  function handleShareLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationPending(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const tempId = `temp-loc-${Date.now()}`;
        const tempMsg: Message = {
          id: tempId,
          body: "Location",
          createdAt: new Date().toISOString(),
          readAt: null,
          latitude: lat,
          longitude: lng,
          sender: { id: currentUserId, displayName: null },
        };
        setMessages((prev) => [...prev, tempMsg]);
        scrollToBottom();
        void sendLocationMessage(threadId, lat, lng)
          .then((data) => {
            const msg = (data as { message: Message }).message;
            setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
          })
          .catch((err: unknown) => {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setError((err as Error).message ?? "Failed to send location.");
          })
          .finally(() => setLocationPending(false));
      },
      () => {
        setError("Location access denied.");
        setLocationPending(false);
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    const optimisticBody = body.trim();
    setBody("");

    // Optimistic message with temp ID
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      body: optimisticBody,
      createdAt: new Date().toISOString(),
      readAt: null,
      sender: { id: currentUserId, displayName: null },
    };
    setMessages((prev) => [...prev, tempMsg]);
    scrollToBottom();

    startTransition(async () => {
      try {
        const data = await sendMessage(threadId, optimisticBody);
        const msg = (data as { message: Message }).message;
        setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError((err as Error).message);
        setBody(optimisticBody);
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      {/* Status bar: typing indicator or online/offline dot */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#E2E2DC] mb-1 min-h-[28px]">
        {isOtherTyping ? (
          <span className="text-[12px] text-[#E8621A] font-[500] flex items-center gap-1.5">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-[#E8621A] rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-[#E8621A] rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-[#E8621A] rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
            {otherUserName} is typing…
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] text-[#8A8A82]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: isOtherOnline ? "#22c55e" : "#D1D1CB" }}
            />
            {isOtherOnline ? "Online" : "Offline"}
          </span>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4 px-2">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl flex flex-col flex-wrap gap-0.5 ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {msg.imageUrl ? (
                  <ImageBubble url={msg.imageUrl} isMe={isMe} />
                ) : msg.latitude != null && msg.longitude != null ? (
                  <LocationBubble lat={msg.latitude} lng={msg.longitude} isMe={isMe} />
                ) : (
                  <div
                    className={`px-4 py-2.5 rounded-[14px] text-[14px] leading-relaxed break-words whitespace-pre-wrap text-wrap ${
                      isMe
                        ? "bg-[#E8621A] text-white rounded-tr-[4px]"
                        : "bg-white border border-[#E2E2DC] text-[#1A1A18] rounded-tl-[4px]"
                    }`}
                  >
                    {msg.body}
                  </div>
                )}
                <div
                  className={`flex items-center gap-1 px-1 ${
                    isMe ? "flex-row" : "flex-row"
                  }`}
                >
                  {isMe && <ReadTicks readAt={msg.readAt} />}
                  <p className="text-[10px] text-[#8A8A82]">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-[12px] text-[#DC2626] px-2 mb-2">{error}</p>}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t border-[#E2E2DC] pt-4">
        {/* Hidden file input for image uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageUpload(file);
            e.target.value = "";
          }}
        />

        {/* Emoji picker */}
        <div className="px-2">
          <div ref={emojiRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#E2E2DC] bg-white hover:bg-[#F2F2EF] transition-colors text-[20px]"
              aria-label="Open emoji picker"
            >
              <Message01Icon size={18} color="currentColor" />
            </button>
          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-50 bg-white border border-[#E2E2DC] rounded-[12px] shadow-lg p-2 w-[224px]">
              <div className="grid grid-cols-8 gap-0.5">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-[16px] hover:bg-[#F2F2EF] rounded-[6px] transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-end gap-2 flex-wrap">
            <input
              ref={inputRef}
              type="text"
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Type a message…"
              disabled={pending}
              className="flex-1 min-w-[120px] h-11 px-4 rounded-full border border-[#E2E2DC] bg-white text-[14px]
                         text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60"
            />

            {/* Location button */}
            <button
              type="button"
              onClick={handleShareLocation}
              disabled={locationPending}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#E2E2DC] bg-white hover:bg-[#FEF3EE] transition-colors text-[20px] shrink-0 disabled:opacity-50"
              aria-label="Share location"
            >
              {locationPending ? (
                <span className="w-4 h-4 border-2 border-[#E8621A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Location01Icon size={18} color="currentColor" />
              )}
            </button>

            {/* Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageUploading}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#E2E2DC] bg-white hover:bg-[#FEF3EE] transition-colors text-[20px] shrink-0 disabled:opacity-50"
              aria-label="Send image"
            >
              {imageUploading ? (
                <span className="w-4 h-4 border-2 border-[#E8621A] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera01Icon size={18} color="currentColor" />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="h-11 px-5 rounded-full bg-[#E8621A] text-white text-[14px] font-[600]
                     hover:bg-[#C9521A] transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {pending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22 11 13 2 9l20-7z" />
            </svg>
          )}
          Send
        </button>
      </form>
    </div>
  );
}
