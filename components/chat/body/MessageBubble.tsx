import React from 'react';
import { useAppSelector } from "@/store/hooks";
import SeenIndicator from './SeenIndicator';
import UserAvatar from "../shared/UserAvatar";

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    time: string;
    isOwn: boolean;
    status?: 'sent' | 'delivered' | 'seen';
    messageType?: string;
    mediaUrl?: string;
    senderAvatar?: string;
    senderName?: string;
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { isOwn, text, time, status, messageType = "text", mediaUrl } = message;

  const getMediaUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getFileName = (url?: string) => {
    if (!url) return "File";
    const fullName = url.substring(url.lastIndexOf("/") + 1);
    const parts = fullName.split("-");
    if (parts.length >= 3) {
      return parts.slice(2).join("-");
    }
    return fullName;
  };

  const renderContent = () => {
    switch (messageType) {
      case "image":
        return (
          <div className="flex flex-col gap-1.5">
            <img
              src={getMediaUrl(mediaUrl)}
              alt="Image attachment"
              className="max-w-full max-h-64 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity duration-200"
              onClick={() => window.open(getMediaUrl(mediaUrl), "_blank")}
            />
            {text && <p className="mt-1 leading-relaxed whitespace-pre-wrap px-2 pb-1">{text}</p>}
          </div>
        );
      case "video":
        return (
          <div className="flex flex-col gap-1.5">
            <video
              src={getMediaUrl(mediaUrl)}
              controls
              className="max-w-full max-h-64 rounded-xl shadow-sm"
            />
            {text && <p className="mt-1 leading-relaxed whitespace-pre-wrap px-2 pb-1">{text}</p>}
          </div>
        );
      case "file":
        return (
          <div className="flex flex-col gap-1.5 min-w-[220px] max-w-sm">
            <a
              href={getMediaUrl(mediaUrl)}
              download
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 transition-colors duration-200 rounded-xl border ${
                isOwn
                  ? "bg-blue-700/50 border-blue-500/30 hover:bg-blue-700/70 text-white"
                  : "bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-900 dark:bg-gray-900/50 dark:border-gray-800 dark:hover:bg-gray-800/80"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 shadow-sm ${
                isOwn ? "bg-blue-500 text-white" : "bg-indigo-500 text-white"
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 overflow-hidden text-left">
                <p className={`text-sm font-medium truncate ${
                  isOwn ? "text-white" : "text-gray-900 dark:text-gray-100"
                }`}>
                  {getFileName(mediaUrl)}
                </p>
                <p className={`text-xs ${
                  isOwn ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                }`}>Click to open/download</p>
              </div>
            </a>
            {text && <p className="mt-1 leading-relaxed whitespace-pre-wrap px-1">{text}</p>}
          </div>
        );
      case "text":
      default:
        return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>;
    }
  };

  const loggedInUser = useAppSelector((state) => state.auth.user);
  const { senderAvatar, senderName } = message;
  const useCompactPadding = (messageType === "image" || messageType === "video") && !text;

  if (isOwn) {
    return (
      <div className="flex w-full mb-4 justify-end items-end gap-2.5">
        <div className="flex flex-col max-w-[75%] sm:max-w-[60%] items-end">
          {/* Message Box */}
          <div 
            className={`relative rounded-2xl shadow-sm overflow-hidden
              ${useCompactPadding ? 'p-1' : 'px-4 py-2.5'}
              bg-gradient-to-br from-emerald-600 to-teal-500 text-white rounded-br-none shadow-md shadow-emerald-500/5
            `}
          >
            {renderContent()}
          </div>

          {/* Timestamp & Status */}
          <div className="flex items-center mt-1 space-x-1.5 px-1">
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              {time}
            </span>
            {isOwn && status && <SeenIndicator status={status} />}
          </div>
        </div>

        {/* Sender Avatar (Own) */}
        <UserAvatar
          name={loggedInUser?.name || "Me"}
          imageUrl={loggedInUser?.avatar}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full mb-4 justify-start items-end gap-2.5">
      {/* Sender Avatar (Other) */}
      <UserAvatar
        name={senderName || "User"}
        imageUrl={senderAvatar}
        size="sm"
      />

      <div className="flex flex-col max-w-[75%] sm:max-w-[60%] items-start">
        {/* Message Box */}
        <div 
          className={`relative rounded-2xl shadow-sm overflow-hidden
            ${useCompactPadding ? 'p-1' : 'px-4 py-2.5'}
            bg-white border border-slate-100 text-gray-900 rounded-bl-none dark:bg-gray-800 dark:border-gray-700/50 dark:text-gray-100 shadow-sm
          `}
        >
          {renderContent()}
        </div>

        {/* Timestamp */}
        <div className="flex items-center mt-1 space-x-1.5 px-1">
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;