// components/chat/shared/ChatSkeleton.tsx
import React from 'react';

const ChatSkeleton = () => {
  return (
    <div className="flex w-full p-3 space-x-4 animate-pulse">
      {/* Avatar Skeleton */}
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0"></div>
      
      {/* Text Lines Skeleton */}
      <div className="flex-1 space-y-3 py-1">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;