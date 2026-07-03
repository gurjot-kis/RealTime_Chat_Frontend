// components/chat/body/MessageBubble.tsx
import React from 'react';
import SeenIndicator from './SeenIndicator';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    time: string;
    isOwn: boolean;
    status?: 'sent' | 'delivered' | 'seen';
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { isOwn, text, time, status } = message;

  return (
    <div className={`flex w-full mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
        
        {/* Message Box */}
        <div 
          className={`relative px-4 py-2.5 text-sm rounded-2xl shadow-sm
            ${isOwn 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
            }
          `}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>

        {/* Timestamp & Status */}
        <div className="flex items-center mt-1 space-x-1.5 px-1">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {time}
          </span>
          {isOwn && status && <SeenIndicator status={status} />}
        </div>
        
      </div>
    </div>
  );
};

export default MessageBubble;