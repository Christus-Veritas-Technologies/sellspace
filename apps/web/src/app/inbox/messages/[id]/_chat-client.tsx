"use client";

import { useRef, useState, useEffect, useCallback, useTransition } from "react";

import { sendMessage } from "./_actions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  body: string;
  createdAt: string;
  readAt: string | null;
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
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isOtherOnline, setIsOtherOnline] = useState(initialOnline);
  const [showEmoji, setShowEmoji] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] flex flex-col gap-0.5 ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-[14px] text-[14px] leading-relaxed ${
                    isMe
                      ? "bg-[#E8621A] text-white rounded-tr-[4px]"
                      : "bg-white border border-[#E2E2DC] text-[#1A1A18] rounded-tl-[4px]"
                  }`}
                >
                  {msg.body}
                </div>
                <div
                  className={`flex items-center gap-1 px-1 ${
                    isMe ? "flex-row" : "flex-row"
                  }`}
                >
                  {isMe && <ReadTicks readAt={msg.readAt} />}
                  <p className="text-[10px] text-[#8A8A82]">{formatTime(msg.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-[12px] text-[#DC2626] px-2 mb-2">{error}</p>}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#E2E2DC] pt-4">
        {/* Emoji picker */}
        <div ref={emojiRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-[#E2E2DC] bg-white hover:bg-[#F2F2EF] transition-colors text-[20px]"
            aria-label="Open emoji picker"
          >
            😊
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
        </div>

        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => handleBodyChange(e.target.value)}
          placeholder="Type a message…"
          disabled={pending}
          className="flex-1 h-11 px-4 rounded-full border border-[#E2E2DC] bg-white text-[14px]
                     text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60"
        />
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
