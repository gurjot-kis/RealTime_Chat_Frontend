// components/chat/footer/MessageInput.tsx
import React from 'react';

const MessageInput = () => {
  return (
    <div className="flex-1 mx-2 sm:mx-3">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full py-2.5 px-4 text-sm bg-gray-100 border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900 dark:focus:border-blue-500 dark:focus:ring-blue-900 transition-all duration-200 outline-none"
      />
    </div>
  );
};

export default MessageInput;