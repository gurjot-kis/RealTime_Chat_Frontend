// components/chat/body/ChatBody.tsx
import React, { useEffect, useRef } from 'react';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';

const ChatBody = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when component mounts or updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 w-full p-4 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 bg-[#F8FAFC] dark:bg-gray-950/50"
    >
      <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
        {/* A little padding at the top so messages don't stick to the header */}
        <div className="pt-4">
          <MessageList />
          
          {/* Toggle this to see the typing animation in action */}
          <div className="mt-2">
            <TypingIndicator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBody;