"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Message01Icon, ArrowRight01Icon } from "hugeicons-react";
import { profileApi, type MessageThread } from "@/lib/profile-api";
import { Avatar } from "@/components/avatar";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function MessagesTab({ token, userId }: { token: string; userId: string }) {
  const [threads, setThreads] = useState<MessageThread[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    profileApi
      .getMessageThreads(token)
      .then((d) => setThreads(d.threads))
      .catch(() => setError(true));
  }, [token]);

  if (threads === null && !error) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#EFEFEB] rounded-[10px] h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-[14px] text-[#8A8A82]">
        Couldn't load messages.
      </div>
    );
  }

  if (!threads?.length) {
    return (
      <div className="py-10 flex flex-col items-center gap-3 text-center">
        <Message01Icon size={36} color="#C8C8C0" />
        <p className="text-[14px] text-[#8A8A82]">No messages yet.</p>
        <Link href="/" className="text-[13px] font-[600] text-[#E8621A] hover:underline">
          Browse listings to start a chat
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => {
        const other = thread.buyer.id === userId ? thread.seller : thread.buyer;
        const lastMsg = thread.messages[0];
        const hasUnread = thread.unreadCount > 0;

        return (
          <Link
            key={thread.id}
            href={`/inbox/${thread.id}`}
            className="flex items-center gap-3 bg-white rounded-[12px] border border-[#E2E2DC] p-3.5 hover:bg-[#FAFAF8] transition-colors group"
          >
            <Avatar name={other.displayName} avatarUrl={other.avatarUrl} size={44} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[14px] truncate ${hasUnread ? "font-[700] text-[#1A1A18]" : "font-[500] text-[#1A1A18]"}`}>
                  {other.displayName}
                </span>
                <span className="text-[12px] text-[#8A8A82] shrink-0">
                  {lastMsg ? timeAgo(lastMsg.createdAt) : timeAgo(thread.createdAt)}
                </span>
              </div>
              <p className="text-[13px] text-[#4A4A45] truncate mt-0.5">
                <span className="text-[#8A8A82]">{thread.listing.title} · </span>
                {lastMsg ? lastMsg.body : "No messages yet"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {hasUnread && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#E8621A] text-white text-[11px] font-[700] flex items-center justify-center">
                  {thread.unreadCount}
                </span>
              )}
              <ArrowRight01Icon size={16} color="#8A8A82" className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        );
      })}

      <Link
        href="/inbox"
        className="flex items-center justify-center gap-1.5 py-3 text-[13px] font-[600] text-[#E8621A] hover:underline"
      >
        View all messages
        <ArrowRight01Icon size={14} />
      </Link>
    </div>
  );
}
