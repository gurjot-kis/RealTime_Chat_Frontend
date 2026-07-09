"use client";

import { useState } from "react";
import { Conversation } from "@/features/chat/chatTypes";
import {
  useLazyGetMessagesQuery,
  useDeleteConversationMutation,
  chatApi,
} from "@/features/chat/chatApi";
import {
  setMessages,
  setSelectedConversation,
  clearMessages,
} from "@/features/chat/chatSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import UserAvatar from "../shared/UserAvatar";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const dispatch = useAppDispatch();
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const isOnline = conversation.user?._id ? onlineUsers.includes(conversation.user._id) : false;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [getMessages] = useLazyGetMessagesQuery();
  const [deleteConversation, { isLoading: isDeleting }] = useDeleteConversationMutation();

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

  const handleDeleteClick = async () => {
    const selectedId = selectedConversation?._id ? String(selectedConversation._id) : "";
    const currentId = conversation?._id ? String(conversation._id) : "";
    const isCurrentlyActive = isActive || (selectedId && selectedId === currentId);

    // 1. Always check and clear matching ID in localStorage first
    const savedActiveId = localStorage.getItem("activeConversationId");
    if (savedActiveId && String(savedActiveId) === currentId) {
      localStorage.removeItem("activeConversationId");
    }

    // 2. Clear selection in Redux second
    if (isCurrentlyActive) {
      dispatch(setSelectedConversation(null));
      dispatch(clearMessages());
    }
    
    setIsDeleteModalOpen(false);

    try {
      await deleteConversation(conversation._id).unwrap();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
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
          name={conversation.user?.name || conversation.groupName || "Chat"}
          imageUrl={conversation.user?.avatar || conversation.groupImage || undefined}
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
            {conversation.user?.name || conversation.groupName || "Chat"}
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

          <div className="flex items-center gap-1 shrink-0">
            {/* Soft Delete Trigger Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-all duration-150 cursor-pointer flex items-center justify-center mr-1"
              title="Delete conversation"
              disabled={isDeleting}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {hasUnread ? (
              <span className="flex items-center justify-center shrink-0 bg-gradient-to-br from-rose-500 to-red-500 text-white text-[10.5px] font-bold rounded-full min-w-[19px] h-[19px] px-1.5 shadow-sm shadow-red-500/20">
                {conversation.unreadCount! > 99 ? "99+" : conversation.unreadCount}
              </span>
            ) : (
              <span className="w-[19px] h-[19px] group-hover:hidden" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteClick}
          title={conversation.user?.name || conversation.groupName || "Chat"}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
