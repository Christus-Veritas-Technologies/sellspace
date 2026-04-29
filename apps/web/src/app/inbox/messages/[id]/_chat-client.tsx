"use client";

import { useRef, useState, useTransition } from "react";

import { sendMessage } from "./_actions";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; displayName: string | null };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ChatClient({
  threadId,
  initialMessages,
  currentUserId,
}: {
  threadId: string;
  initialMessages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    const optimisticBody = body.trim();
    setBody("");

    startTransition(async () => {
      try {
        const data = await sendMessage(threadId, optimisticBody);
        const msg = (data as { message: Message }).message;
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      } catch (err) {
        setError((err as Error).message);
        setBody(optimisticBody);
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4 px-2">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                <div
                  className={`px-4 py-2.5 rounded-[14px] text-[14px] leading-relaxed ${
                    isMe
                      ? "bg-[#E8621A] text-white rounded-tr-[4px]"
                      : "bg-white border border-[#E2E2DC] text-[#1A1A18] rounded-tl-[4px]"
                  }`}
                >
                  {msg.body}
                </div>
                <p className="text-[10px] text-[#8A8A82] px-1">{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {error && <p className="text-[12px] text-[#DC2626] px-2 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#E2E2DC] pt-4">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          disabled={pending}
          className="flex-1 h-11 px-4 rounded-full border border-[#E2E2DC] bg-white text-[14px]
                     text-[#1A1A18] focus:outline-none focus:border-[#E8621A] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="h-11 px-5 rounded-full bg-[#E8621A] text-white text-[14px] font-[600]
                     hover:bg-[#C9521A] transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
