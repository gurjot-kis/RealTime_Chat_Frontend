"use client";

import { ReactNode, useEffect, useRef } from "react";
import Cookies from "js-cookie";

import { useLazyGetProfileQuery } from "@/features/auth/authApi";
import { setCredentials, logout } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSocket, disconnectSocket } from "@/services/socket";
import {
  setOnlineUsers,
  addUserOnline,
  removeUserOffline,
  addMessage,
  setUserTyping,
  setUserStopTyping,
} from "@/features/chat/chatSlice";
import { Message } from "@/features/chat/chatTypes";
import { chatApi } from "@/features/chat/chatApi";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const selectedConversation = useAppSelector((state) => state.chat.selectedConversation);
  const selectedConversationRef = useRef(selectedConversation);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) return;

        const response = await getProfile().unwrap();

        dispatch(
          setCredentials({
            user: response.data.userObj,
            token,
          }),
        );

        const socket = connectSocket(token);

        // ── Presence events (mirror backend presence.socket.js) ──────────────
        // Backend emits this once on connect with the full list of online user IDs
        socket.on("get_online_users", (userIds: string[]) => {
          console.log("✅ Online users received:", userIds);
          dispatch(setOnlineUsers(userIds));
        });

        // Backend broadcasts this when a user's FIRST socket connects
        socket.on("user_online", (data: { userId: string }) => {
          console.log("🟢 User came online:", data.userId);
          dispatch(addUserOnline(data.userId));
        });

        // Backend broadcasts this when a user's LAST socket disconnects
        socket.on("user_offline", (data: { userId: string }) => {
          console.log("🔴 User went offline:", data.userId);
          dispatch(removeUserOffline(data.userId));
        });

        // ── Chat events ────────────────────────────────────────────────────────
        socket.on("new_message", (response: { conversationId: string; message: Message }) => {
          console.log("💬 New message:", response);
          if (!response?.message) return;

          const currentSelected = selectedConversationRef.current;

          // Add to redux store (chatSlice handles filtering if it matches active conversation)
          dispatch(addMessage(response.message));

          // Update sidebar conversations list cache
          dispatch(
            chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
              const conv = draft.data.find((c) => c._id === response.conversationId);
              if (conv) {
                // Update the last message
                conv.lastMessage = {
                  _id: response.message._id,
                  conversation: response.message.conversation,
                  sender: response.message.sender._id,
                  messageType: response.message.messageType,
                  text: response.message.text,
                  readBy: response.message.readBy,
                  deliveredTo: response.message.deliveredTo,
                  createdAt: response.message.createdAt,
                  updatedAt: response.message.updatedAt,
                };

                // Increment unread count if it's not the selected conversation
                if (!currentSelected || response.conversationId !== currentSelected._id) {
                  conv.unreadCount = (conv.unreadCount || 0) + 1;
                }

                // Move conversation to the top
                const index = draft.data.indexOf(conv);
                if (index > -1) {
                  draft.data.splice(index, 1);
                  draft.data.unshift(conv);
                }
              } else {
                // If it's a new conversation, invalidate conversation list tags to fetch from DB
                dispatch(chatApi.util.invalidateTags(["Conversation"]));
              }
            })
          );
        });

        socket.on("user_typing", (data: { conversationId: string; userId: string; userName: string }) => {
          console.log("✍️ User typing:", data);
          dispatch(setUserTyping(data));
        });

        socket.on("user_stop_typing", (data: { conversationId: string; userId: string }) => {
          console.log("✋ User stopped typing:", data);
          dispatch(setUserStopTyping(data));
        });
      } catch (error) {
        Cookies.remove("token");
        dispatch(logout());
      }
    };

    restoreSession();
  }, [dispatch, getProfile]);

  return <>{children}</>;
}
