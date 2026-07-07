"use client";

import { Conversation } from "@/features/chat/chatTypes";
import {
  useLazyGetMessagesQuery,
  chatApi,
} from "@/features/chat/chatApi";
import {
  setMessages,
  setSelectedConversation,
} from "@/features/chat/chatSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import UserAvatar from "../shared/UserAvatar";

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const dispatch = useAppDispatch();
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const isOnline = onlineUsers.includes(conversation.user._id);

  const [getMessages] = useLazyGetMessagesQuery();

  const handleSelectConversation = async () => {
    try {
      // Save active conversation ID in localStorage to survive reloads
      localStorage.setItem("activeConversationId", conversation._id);

      // Selected conversation store
      dispatch(setSelectedConversation(conversation));

      // Reset unread count locally in the cache instantly
      dispatch(
        chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
          const conv = draft.data.find((c) => c._id === conversation._id);
          if (conv) {
            conv.unreadCount = 0;
          }
        })
      );

      // Fetch messages
      const response = await getMessages({
        conversationId: conversation._id,
        page: 1,
        limit: 20,
      }).unwrap();

      // Store messages in redux
      dispatch(
        setMessages({
          messages: response.data.messages,
          hasMore: response.data.hasMore,
          page: response.data.page,
        })
      );
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  const renderLastMessage = () => {
    const lastMsg = conversation.lastMessage;
    if (!lastMsg) return { icon: null, text: "No messages yet" };

    const type = lastMsg.messageType || "text";
    const text = lastMsg.text;

    if (type === "image") {
      return { icon: "📷", text: text || "Photo" };
    }
    if (type === "video") {
      return { icon: "🎥", text: text || "Video" };
    }
    if (type === "file") {
      return { icon: "📁", text: text || "Document" };
    }
    return { icon: null, text: text || "No messages yet" };
  };

  // Smart, WhatsApp-style relative timestamp: time for today, weekday for
  // this week, short date otherwise.
  const renderTimestamp = () => {
    const lastMsg = conversation.lastMessage;
    if (!lastMsg) return "";

    const date = new Date(lastMsg.createdAt);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const withinWeek = now.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000;

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (isYesterday) {
      return "Yesterday";
    }
    if (withinWeek) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  const selectedConversation = useAppSelector(
    (state) => state.chat.selectedConversation
  );
  const isActive = selectedConversation?._id === conversation._id;
  const hasUnread = !!conversation.unreadCount && conversation.unreadCount > 0;
  const { icon, text } = renderLastMessage();

  return (
    <div
      onClick={handleSelectConversation}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleSelectConversation();
      }}
      className={`group relative flex items-center gap-3 pl-3 pr-4 py-3 cursor-pointer select-none transition-colors duration-150 ${
        isActive
          ? "bg-gradient-to-r from-emerald-50 to-teal-50/60 dark:from-emerald-500/10 dark:to-teal-500/[0.04]"
          : "hover:bg-slate-50 dark:hover:bg-white/[0.03]"
      }`}
    >
      {/* Active indicator bar */}
      <span
        className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 to-teal-500 transition-all duration-200 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-30"
        }`}
      />

      {/* Avatar with online ring */}
 <div className="relative shrink-0">
        <UserAvatar
          name={conversation.user.name}
          imageUrl={conversation.user.avatar}
          isOnline={isOnline}
          size="lg"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`truncate text-[15px] ${
              hasUnread
                ? "font-bold text-gray-950 dark:text-white"
                : "font-semibold text-gray-800 dark:text-gray-100"
            }`}
          >
            {conversation.user.name}
          </h3>
          <span
            className={`shrink-0 text-[11px] tabular-nums ${
              hasUnread
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {renderTimestamp()}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={`flex items-center gap-1 truncate text-[13px] ${
              hasUnread
                ? "text-gray-700 dark:text-gray-300 font-medium"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {icon && <span className="text-[12px] leading-none">{icon}</span>}
            <span className="truncate">{text}</span>
          </p>

          {hasUnread ? (
            <span className="flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-[10.5px] font-bold rounded-full min-w-[19px] h-[19px] px-1.5 shadow-sm shadow-emerald-500/30">
              {conversation.unreadCount! > 99 ? "99+" : conversation.unreadCount}
            </span>
          ) : (
            <span className="w-[19px] h-[19px]" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
