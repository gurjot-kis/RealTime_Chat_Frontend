"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hooks";
import { useGetUsersQuery, useCreatePrivateConversationMutation, useLazyGetMessagesQuery } from "@/features/chat/chatApi";
import { setSelectedConversation, setMessages } from "@/features/chat/chatSlice";
import { User } from "@/features/auth/authTypes";
import UserAvatar from "../shared/UserAvatar";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState("");

  const { data: usersResponse, isLoading } = useGetUsersQuery(search, { skip: !isOpen });
  const [createConversation, { isLoading: isCreating }] = useCreatePrivateConversationMutation();
  const [getMessages] = useLazyGetMessagesQuery();

  if (!isOpen) return null;

  const handleSelectUser = async (receiverId: string) => {
    try {
      const response = await createConversation({ receiverId }).unwrap();
      if (response.success && response.data) {
        const conversation = response.data;
        dispatch(setSelectedConversation(conversation));
        localStorage.setItem("activeConversationId", conversation._id);

        // Fetch messages for the conversation
        const messagesRes = await getMessages({
          conversationId: conversation._id,
          page: 1,
          limit: 20,
        }).unwrap();

        dispatch(
          setMessages({
            messages: messagesRes.data.messages,
            hasMore: messagesRes.data.hasMore,
            page: messagesRes.data.page,
          })
        );

        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start conversation");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 dark:bg-gray-900 dark:border-gray-800 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-500">
          <h2 className="text-lg font-bold text-white">Start New Chat</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full text-white/90 hover:bg-white/15 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 pb-4 flex flex-col flex-1 overflow-hidden">
          {/* Search Input */}
          <div className="relative mb-4 shrink-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[300px]">
            {isLoading || isCreating ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-sm text-gray-400">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Loading users...
              </div>
            ) : usersResponse?.data && usersResponse.data.length > 0 ? (
              usersResponse.data.map((user: User) => (
                <div
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50/60 dark:hover:from-emerald-500/10 dark:hover:to-teal-500/[0.04] cursor-pointer transition-colors duration-150"
                >
                  <UserAvatar name={user.name} imageUrl={user.avatar} size="md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-950 dark:text-gray-50 truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.bio || "Hey there! I am using Chat."}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-1">
                <span className="text-2xl mb-1">🔍</span>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No users found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Try a different name or phone number</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
