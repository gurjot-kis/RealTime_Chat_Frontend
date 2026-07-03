// components/chat/footer/AttachmentButton.tsx
import React from 'react';

const AttachmentButton = () => {
  return (
    <button 
      type="button"
      className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400 focus:outline-none"
      aria-label="Attach file"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    </button>
  );
};

export default AttachmentButton;