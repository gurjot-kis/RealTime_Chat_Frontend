"use client";
import React, { useState } from "react";
import ChatSidebar from "./sidebar/ChatSidebar";
import ChatHeader from "./header/ ChatHeader";
import ChatBody from "./body/ChatBody";
import ChatFooter from "./footer/ChatFooter";

// NOTE: All socket event listeners (presence + chat) are registered in
// AuthProvider immediately after connectSocket(), so they are always
// wired up before any component mounts — no race condition.

const ChatLayout = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>("1");

  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div
        className={`${activeChatId ? "hidden md:flex" : "flex w-full md:w-auto"} h-full`}
      >
        <ChatSidebar />
      </div>

      <div
        className={`${!activeChatId ? "hidden md:flex" : "flex"} flex-1 h-full bg-white dark:bg-gray-900`}
      >
        {!activeChatId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Your Messages
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full relative">
            <ChatHeader />

            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center justify-center h-full text-gray-400">
                <ChatBody />
              </div>
            </div>

            <div className="w-full shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 h-20 flex items-center justify-center text-gray-400">
              <ChatFooter />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
