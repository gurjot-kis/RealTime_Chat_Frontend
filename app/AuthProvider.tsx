"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  markMessagesAsRead,
  resetChatState,
} from "@/features/chat/chatSlice";
import { Message } from "@/features/chat/chatTypes";
import { chatApi } from "@/features/chat/chatApi";
import { baseApi } from "@/store/api/baseApi";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const selectedConversation = useAppSelector((state) => state.chat.selectedConversation);
  const selectedConversationRef = useRef(selectedConversation);
  const user = useAppSelector((state) => state.auth.user);
  const userRef = useRef(user);

  const [isRestoring, setIsRestoring] = useState(true);

  const token = useAppSelector((state) => state.auth.token) ?? Cookies.get("token");

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [getProfile] = useLazyGetProfileQuery();

  // 1. Session Restoration on Initial Load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = Cookies.get("token");

        if (!savedToken) {
          setIsRestoring(false);
          return;
        }

        const response = await getProfile().unwrap();

        dispatch(
          setCredentials({
            user: response.data.userObj,
            token: savedToken,
          }),
        );
      } catch (error) {
        Cookies.remove("token");
        localStorage.removeItem("activeConversationId");
        dispatch(logout());
        dispatch(resetChatState());
        dispatch(baseApi.util.resetApiState());
        disconnectSocket();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [dispatch, getProfile]);

  // 2. Reactive Socket Connection & Listeners Registration
  useEffect(() => {
    if (isRestoring) return;

    if (!isAuthenticated || !token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    // Presence events
    socket.on("get_online_users", (userIds: string[]) => {
      console.log("✅ Online users received:", userIds);
      dispatch(setOnlineUsers(userIds));
    });

    socket.on("user_online", (data: { userId: string }) => {
      console.log("🟢 User came online:", data.userId);
      dispatch(addUserOnline(data.userId));
    });

    socket.on("user_offline", (data: { userId: string }) => {
      console.log("🔴 User went offline:", data.userId);
      dispatch(removeUserOffline(data.userId));
    });

    // Chat events
    socket.on("new_message", (response: { conversationId: string; message: Message }) => {
      console.log("💬 New message:", response);
      if (!response?.message) return;

      const currentSelected = selectedConversationRef.current;

      dispatch(addMessage(response.message));

      dispatch(
        chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
          const conv = draft.data.find((c) => c._id === response.conversationId);
          if (conv) {
            conv.lastMessage = {
              _id: response.message._id,
              conversation: response.message.conversation,
              sender: response.message.sender._id,
              messageType: response.message.messageType,
              text: response.message.text,
              mediaUrl: response.message.mediaUrl,
              readBy: response.message.readBy,
              deliveredTo: response.message.deliveredTo,
              createdAt: response.message.createdAt,
              updatedAt: response.message.updatedAt,
            };

            const senderId =
              typeof response.message.sender === "object"
                ? response.message.sender._id
                : response.message.sender;
            const currentUser = userRef.current;

            if (
              senderId !== currentUser?._id &&
              (!currentSelected || response.conversationId !== currentSelected._id)
            ) {
              conv.unreadCount = (conv.unreadCount || 0) + 1;
            }

            const index = draft.data.indexOf(conv);
            if (index > -1) {
              draft.data.splice(index, 1);
              draft.data.unshift(conv);
            }
          } else {
            dispatch(chatApi.util.invalidateTags(["Conversation"]));
          }
        })
      );
    });

    socket.on("messages_read", (data: { conversationId: string; userId: string }) => {
      console.log("👁️ Messages read in conversation:", data.conversationId);
      const currentUser = userRef.current;
      dispatch(
        chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
          const conv = draft.data.find((c) => c._id === data.conversationId);
          if (conv) {
            if (data.userId === currentUser?._id) {
              conv.unreadCount = 0;
            }

            if (conv.lastMessage) {
              const alreadyRead = conv.lastMessage.readBy.some((r: any) => {
                const readerId = typeof r === "string" ? r : r.user;
                return readerId === data.userId;
              });

              if (!alreadyRead) {
                conv.lastMessage.readBy.push({
                  user: data.userId,
                  readAt: new Date().toISOString(),
                });
              }
            }
          }
        })
      );

      dispatch(markMessagesAsRead(data));
    });

    socket.on("user_typing", (data: { conversationId: string; userId: string; userName: string }) => {
      console.log("✍️ User typing:", data);
      dispatch(setUserTyping(data));
    });

    socket.on("user_stop_typing", (data: { conversationId: string; userId: string }) => {
      console.log("✋ User stopped typing:", data);
      dispatch(setUserStopTyping(data));
    });

    return () => {
      socket.off("get_online_users");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("new_message");
      socket.off("messages_read");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      disconnectSocket();
    };
  }, [isAuthenticated, token, isRestoring, dispatch]);

  // 3. Routing Guards
  useEffect(() => {
    if (isRestoring) return;

    const isAuthPath = pathname.startsWith("/auth");
    const isChatPath = pathname.startsWith("/chat") || pathname === "/";

    if (token && isAuthenticated) {
      if (isAuthPath) {
        router.push("/chat/home");
      }
    } else {
      if (isChatPath) {
        router.push("/auth/login");
      }
    }
  }, [pathname, isAuthenticated, isRestoring, token, router]);

  if (isRestoring) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
