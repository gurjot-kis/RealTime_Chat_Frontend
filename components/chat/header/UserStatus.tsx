"use client";

import UserAvatar from "../shared/UserAvatar";

interface UserStatusProps {
  user: {
    name: string;
    status: string;
    isOnline: boolean;
    avatar: string;
  };
}

const UserStatus = ({ user }: UserStatusProps) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Mobile Back Button */}
      <button className="p-2 -ml-2 mr-1 text-gray-500 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400">
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

      {/* Avatar */}
      <UserAvatar
        name={user.name}
        isOnline={user.isOnline}
        size="lg"
      />

      {/* Name & Status */}
      <div className="flex flex-col cursor-pointer">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {user.name}
        </h2>

        <span
          className={`text-xs ${
            user.status.toLowerCase().includes("typing")
              ? "text-blue-500 font-medium"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {user.status}
        </span>
      </div>
    </div>
  );
};

export default UserStatus;