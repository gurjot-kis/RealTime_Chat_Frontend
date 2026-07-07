"use client";
import React from "react";
import ChatSidebar from "./sidebar/ChatSidebar";
import ChatHeader from "./header/ ChatHeader";
import ChatBody from "./body/ChatBody";
import ChatFooter from "./footer/ChatFooter";
import { useAppSelector } from "@/store/hooks";

// NOTE: All socket event listeners (presence + chat) are registered in
// AuthProvider immediately after connectSocket(), so they are always
// wired up before any component mounts — no race condition.

const ChatLayout = () => {
  const selectedConversation = useAppSelector(
    (state) => state.chat.selectedConversation
  );

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50 dark:bg-gray-950 transition-colors duration-200">
      <div
        className={`${selectedConversation ? "hidden md:flex" : "flex w-full md:w-auto"} h-full`}
      >
        <ChatSidebar />
      </div>

      <div
        className={`${!selectedConversation ? "hidden md:flex" : "flex"} flex-1 h-full bg-[#f8fafc] dark:bg-gray-950`}
      >
        {!selectedConversation ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-gray-950">
            <div className="text-center max-w-sm px-6">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Real-Time Chat App
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Select a conversation from the sidebar or click "Start New Chat" to begin messaging instantly.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full relative">
            <ChatHeader />

            <ChatBody />

            <ChatFooter />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
