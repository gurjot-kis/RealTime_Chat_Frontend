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
      dispatch(setMessages(response.data.messages));
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  return (
    <div
      onClick={handleSelectConversation}
      className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
    >
      <UserAvatar
        name={conversation.user.name}
        isOnline={isOnline}
        size="lg"
      />

      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold truncate text-gray-950 dark:text-gray-50">
          {conversation.user.name}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {conversation.lastMessage?.text || "No messages yet"}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 min-w-[70px]">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {conversation.lastMessage
            ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
        {conversation.unreadCount && conversation.unreadCount > 0 ? (
          <span className="flex items-center justify-center bg-red-500 text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 shadow-sm transition-all duration-300">
            {conversation.unreadCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}