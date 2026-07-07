"use client";

import { useAppSelector } from "@/store/hooks";
import UserStatus from "./UserStatus";
import HeaderActions from "./HeaderActions";

// Stable reference so the selector never returns a brand-new `{}` on every render,
// which would trigger unnecessary rerenders (Redux selector equality check).
const EMPTY_TYPING_MAP: Record<string, string> = {};

const ChatHeader = () => {
  const conversation = useAppSelector(
    (state) => state.chat.selectedConversation
  );
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const typingUsersMap = useAppSelector(
    (state) => state.chat.typingUsers[conversation?._id || ""] ?? EMPTY_TYPING_MAP
  );
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);

  if (!conversation) return null;

  const isOnline = onlineUsers.includes(conversation.user._id);
  const typingUsers = Object.entries(typingUsersMap).filter(([id]) => id !== loggedInUser?._id);
  const isSomeoneElseTyping = typingUsers.length > 0;
  const statusText = isSomeoneElseTyping ? "Typing..." : (isOnline ? "Online" : "Offline");

  return (
    <header className="flex items-center justify-between px-4 h-16 bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200 w-full shrink-0">
      <UserStatus
        user={{
          name: conversation.user.name,
          isOnline: isOnline,
          status: statusText,
          avatar: conversation.user.name.charAt(0).toUpperCase(),
        }}
      />

      <HeaderActions />
    </header>
  );
};

export default ChatHeader;