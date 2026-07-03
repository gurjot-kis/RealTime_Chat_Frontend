// components/chat/header/UserStatus.tsx
import React from "react";
import UserAvatar from "../shared/UserAvatar";

interface UserStatusProps {
  user: {
    name: string;
    status: string;
    isOnline: boolean;
    avatar: string;
  };
}

const UserStatus: React.FC<UserStatusProps> = ({ user }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Mobile Back Button (Hidden on Desktop) */}
      <button className="p-2 -ml-2 mr-1 text-gray-500 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 focus:outline-none">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Avatar Container */}
      <UserAvatar name="Design Team" isOnline={true} size="lg" />

      {/* Name and Status */}
      <div className="flex flex-col cursor-pointer">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {user.name}
        </h2>
        <span
          className={`text-xs ${user.status.toLowerCase().includes("typing") ? "text-blue-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
        >
          {user.status}
        </span>
      </div>
    </div>
  );
};

export default UserStatus;
