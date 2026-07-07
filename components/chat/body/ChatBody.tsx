// components/chat/body/ChatBody.tsx
import React, { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import { useAppSelector } from "@/store/hooks";
import { getSocket } from "@/services/socket";

// Stable reference so the selector never returns a brand-new `{}` on every render,
// which would trigger unnecessary rerenders (Redux selector equality check).
const EMPTY_TYPING_MAP: Record<string, string> = {};

const ChatBody = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useAppSelector(
    (state) => state.chat.selectedConversation
  );
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.chat.messages);
  const typingUsersMap = useAppSelector(
    (state) => state.chat.typingUsers[selectedConversation?._id || ""] ?? EMPTY_TYPING_MAP
  );

  const typingUsers = Object.entries(typingUsersMap).filter(([id]) => id !== loggedInUser?._id);
  const isSomeoneElseTyping = typingUsers.length > 0;

  // Emit mark_as_read when active chat or messages change
  useEffect(() => {
    if (selectedConversation?._id) {
      const socket = getSocket();
      if (socket) {
        socket.emit("mark_as_read", { conversationId: selectedConversation._id });
      }
    }
  }, [selectedConversation?._id, messages.length]);

  // Auto-scroll to bottom when component mounts or updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSomeoneElseTyping]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 w-full p-4 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 bg-[#F8FAFC] dark:bg-gray-950/50"
    >
      <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
        {/* A little padding at the top so messages don't stick to the header */}
        <div className="pt-4">
          <MessageList />
          
          {isSomeoneElseTyping && (
            <div className="mt-2">
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBody;