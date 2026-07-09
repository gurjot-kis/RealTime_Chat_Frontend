"use client";

import UserAvatar from "../shared/UserAvatar";
import { useAppDispatch } from "@/store/hooks";
import { setSelectedConversation } from "@/features/chat/chatSlice";

interface UserStatusProps {
  user: {
    name: string;
    status: string;
    isOnline: boolean;
    avatar: string;
  };
}

const UserStatus = ({ user }: UserStatusProps) => {
  const dispatch = useAppDispatch();

  const handleBack = () => {
    dispatch(setSelectedConversation(null));
    localStorage.removeItem("activeConversationId");
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mobile Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-9 h-9 -ml-2 text-gray-500 rounded-full md:hidden hover:bg-gray-100 active:scale-95 transition-all duration-200 dark:hover:bg-gray-800 dark:text-gray-400 cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="flex items-center gap-3.5 group cursor-pointer p-1 -ml-1 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-200">
        {/* Avatar */}
        <div className="transition-transform duration-300 group-hover:scale-105">
          <UserAvatar
            name={user.name}
            imageUrl={user.avatar}
            isOnline={user.isOnline}
            size="md"
          />
        </div>

        {/* Name & Status */}
        <div className="flex flex-col justify-center">
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
            {user.name}
          </h2>

          <span
            className={`text-[12px] mt-0.5 tracking-wide ${
              user.status.toLowerCase().includes("typing")
                ? "text-emerald-500 dark:text-emerald-400 font-semibold animate-pulse"
                : user.status === "Online"
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-gray-400 dark:text-gray-500 font-medium"
            }`}
          >
            {user.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserStatus;
