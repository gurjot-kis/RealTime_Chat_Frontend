// components/chat/body/TypingIndicator.tsx
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm w-fit">
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;