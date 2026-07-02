// components/chat/sidebar/SidebarHeader.tsx
import React from 'react';

const SidebarHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-gray-800">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        {/* Placeholder for a settings or profile icon (e.g., Lucide Icons or Heroicons) */}
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
};

export default SidebarHeader;