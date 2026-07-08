"use client";

import { useEffect, useState } from "react";
import { useGetConversationsQuery, useLazyGetMessagesQuery, useGetUsersQuery, useCreatePrivateConversationMutation } from "@/features/chat/chatApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSelectedConversation, setMessages } from "@/features/chat/chatSlice";
import { User } from "@/features/auth/authTypes";
import UserAvatar from "../shared/UserAvatar";
import { toast } from "sonner";

import ConversationItem from "./ConversationItem";
import NewChatButton from "./NewChatButton";
import SearchConversation from "./SearchConversation";
import SidebarHeader from "./SidebarHeader";
import NewChatModal from "./NewChatModal";

const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-gray-800 shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-slate-200 dark:bg-gray-800" />
        <div className="h-2.5 w-8 rounded bg-slate-200 dark:bg-gray-800" />
      </div>
      <div className="h-2.5 w-40 rounded bg-slate-100 dark:bg-gray-800/70" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full px-8 py-16 text-center">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 mb-4">
      <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.083 0-2.12-.17-3.08-.484L3 20l1.514-4.03A7.947 7.947 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">No conversations yet</h3>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[220px]">
      Start a new chat to connect with someone.
    </p>
  </div>
);

const ChatSidebar = () => {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector((state) => state.chat.selectedConversation);
  const [getMessages] = useLazyGetMessagesQuery();

  const { data, isLoading } = useGetConversationsQuery();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersResponse, isLoading: isUsersLoading } = useGetUsersQuery(searchQuery, {
    skip: !searchQuery.trim(),
  });
  const [createConversation, { isLoading: isCreating }] = useCreatePrivateConversationMutation();

  useEffect(() => {
    if (isLoading || !data?.data || selectedConversation) return;

    const savedId = localStorage.getItem("activeConversationId");
    if (savedId) {
      const savedConv = data.data.find((c) => c._id === savedId);
      if (savedConv) {
        const autoSelect = async () => {
          try {
            dispatch(setSelectedConversation(savedConv));
            const response = await getMessages({
              conversationId: savedConv._id,
              page: 1,
              limit: 20,
            }).unwrap();
            dispatch(
              setMessages({
                messages: response.data.messages,
                hasMore: response.data.hasMore,
                page: response.data.page,
              })
            );
          } catch (error) {
            console.error("Auto load messages failed", error);
          }
        };
        autoSelect();
      }
    }
  }, [data, isLoading, selectedConversation, dispatch, getMessages]);

  const handleSelectUser = async (user: User) => {
    try {
      // If conversation already exists with this user, select it immediately
      const existingConv = data?.data?.find((c) => c.user._id === user._id);
      if (existingConv) {
        dispatch(setSelectedConversation(existingConv));
        localStorage.setItem("activeConversationId", existingConv._id);

        const response = await getMessages({
          conversationId: existingConv._id,
          page: 1,
          limit: 20,
        }).unwrap();

        dispatch(
          setMessages({
            messages: response.data.messages,
            hasMore: response.data.hasMore,
            page: response.data.page,
          })
        );

        setSearchQuery("");
        return;
      }

      // Otherwise, create a new conversation thread
      const response = await createConversation({ receiverId: user._id }).unwrap();
      if (response.success && response.data) {
        const conversation = response.data;
        dispatch(setSelectedConversation(conversation));
        localStorage.setItem("activeConversationId", conversation._id);

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

        setSearchQuery("");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start conversation");
    }
  };

  return (
    <aside className="flex flex-col w-full h-full md:w-[380px] lg:w-[420px] border-r border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-200">
      <SidebarHeader />

      <div className="px-4 py-3.5 border-b border-slate-50 dark:border-gray-800/30">
        <SearchConversation value={searchQuery} onChange={setSearchQuery} />

        <div className="mt-3">
          <NewChatButton onClick={() => setIsNewChatModalOpen(true)} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-gray-800/40 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] dark:[scrollbar-color:theme(colors.gray.700)_transparent]">
        {searchQuery.trim() ? (
          isUsersLoading || isCreating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-sm text-gray-400 select-none">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Loading users...
            </div>
          ) : usersResponse?.data && usersResponse.data.length > 0 ? (
            usersResponse.data.map((user: User) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors duration-150 select-none animate-fadeIn"
              >
                <UserAvatar name={user.name} imageUrl={user.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[14px] text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </h4>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user.bio || "Hey there! I am using Chat."}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-1 select-none animate-fadeIn">
              <span className="text-2xl mb-1">🔍</span>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No users found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Try a different name or phone number</p>
            </div>
          )
        ) : isLoading ? (
          <>
            {Array.from({ length: 7 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </>
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((conversation) => (
            <ConversationItem key={conversation._id} conversation={conversation} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </aside>
  );
};

export default ChatSidebar;
