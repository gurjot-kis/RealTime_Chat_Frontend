"use client";

import { Conversation } from "@/features/chat/chatTypes";
import {
  useLazyGetMessagesQuery,
} from "@/features/chat/chatApi";
import {
  setMessages,
  setSelectedConversation,
} from "@/features/chat/chatSlice";
import { useAppDispatch } from "@/store/hooks";

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const dispatch = useAppDispatch();

  const [getMessages] = useLazyGetMessagesQuery();

  const handleSelectConversation = async () => {
    try {
      // Selected conversation store
      dispatch(setSelectedConversation(conversation));

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
      className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
        {conversation.user.name.charAt(0)}
      </div>

      <div className="flex-1 overflow-hidden">
        <h3 className="font-semibold truncate">
          {conversation.user.name}
        </h3>

        <p className="text-sm text-gray-500 truncate">
          {conversation.lastMessage?.text || "No messages yet"}
        </p>
      </div>

      <div className="text-xs text-gray-400">
        {conversation.lastMessage
          ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </div>
    </div>
  );
}