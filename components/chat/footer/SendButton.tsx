// components/chat/footer/SendButton.tsx
import React from 'react';

interface SendButtonProps {
  disabled?: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ disabled = false }) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
        disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
      }`}
      aria-label="Send message"
    >
      <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Paper airplane icon */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </button>
  );
};

export default SendButton;