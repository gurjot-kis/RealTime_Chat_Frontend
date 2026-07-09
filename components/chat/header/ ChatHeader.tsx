"use client";

import { useAppSelector } from "@/store/hooks";
import UserStatus from "./UserStatus";
import HeaderActions from "./HeaderActions";

// Stable reference so the selector never returns a brand-new `{}` on every render,
// which would trigger unnecessary rerenders (Redux selector equality check).
const EMPTY_TYPING_MAP: Record<string, string> = {};

const ChatHeader = () => {
  const conversation = useAppSelector(
    (state) => state.chat.selectedConversation,
  );
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const typingUsersMap = useAppSelector(
    (state) =>
      state.chat.typingUsers[conversation?._id || ""] ?? EMPTY_TYPING_MAP,
  );
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);

  if (!conversation) return null;

  const isOnline = conversation.user?._id ? onlineUsers.includes(conversation.user._id) : false;
  const typingUsers = Object.entries(typingUsersMap).filter(
    ([id]) => id !== loggedInUser?._id,
  );
  const isSomeoneElseTyping = typingUsers.length > 0;
  const statusText = isSomeoneElseTyping
    ? "Typing..."
    : isOnline
      ? "Online"
      : "Offline";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-[72px] bg-white backdrop-blur-md border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800/60 transition-colors duration-200 w-full shrink-0 shadow-sm shadow-gray-100/50 dark:shadow-gray-900/50">
      <UserStatus
        user={{
          name: conversation.user?.name || conversation.groupName || "Chat",
          isOnline: isOnline,
          status: statusText,
          avatar: conversation.user?.avatar || conversation.groupImage || "",
        }}
      />
      {/* <HeaderActions /> */}
    </header>
  );
};

export default ChatHeader;
