// components/chat/footer/EmojiPicker.tsx
import React from 'react';

const EmojiPicker = () => {
  return (
    <button 
      type="button"
      className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400 focus:outline-none"
      aria-label="Choose emoji"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
};

export default EmojiPicker;