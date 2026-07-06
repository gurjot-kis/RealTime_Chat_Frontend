"use client";

import { useAppSelector } from "@/store/hooks";
import UserStatus from "./UserStatus";
import HeaderActions from "./HeaderActions";

const ChatHeader = () => {
  const conversation = useAppSelector(
    (state) => state.chat.selectedConversation
  );

  if (!conversation) return null;

  return (
    <header className="flex items-center justify-between px-4 h-16 bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200 w-full shrink-0">
      <UserStatus
        user={{
          name: conversation.user.name,
          isOnline: false, // Socket will update this later
          status: "Active", // Later: Online / Offline / Typing...
          avatar: conversation.user.name.charAt(0).toUpperCase(),
        }}
      />

      <HeaderActions />
    </header>
  );
};

export default ChatHeader;