import React, { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import InfiniteScrollContainer from "./InfiniteScrollContainer";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getSocket } from "@/services/socket";
import { useLazyGetMessagesQuery, useUploadMultipleMediaMutation, chatApi } from "@/features/chat/chatApi";
import { prependMessages, addMessage } from "@/features/chat/chatSlice";
import { Message } from "@/features/chat/chatTypes";

// Stable reference so the selector never returns a brand-new `{}` on every render,
// which would trigger unnecessary rerenders (Redux selector equality check).
const EMPTY_TYPING_MAP: Record<string, string> = {};

const ChatBody = () => {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [getMessages, { isFetching: isFetchingMore }] =
    useLazyGetMessagesQuery();
  const [loadingOlder, setLoadingOlder] = useState(false);

  const selectedConversation = useAppSelector(
    (state) => state.chat.selectedConversation,
  );
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.chat.messages);
  const currentPage = useAppSelector((state) => state.chat.currentPage);
  const hasMore = useAppSelector((state) => state.chat.hasMore);

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMarkerId, setUnreadMarkerId] = useState<string | null>(null);
  
  const [uploadMultipleMedia, { isLoading: isUploading }] = useUploadMultipleMediaMutation();
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleUploadFiles = async (files: FileList) => {
    if (!conversationId) return;

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const uploadResponse = await uploadMultipleMedia(formData).unwrap();

      if (uploadResponse.success && uploadResponse.data) {
        const socket = getSocket();
        if (!socket) return;

        for (const fileData of uploadResponse.data) {
          const { mediaUrl, messageType } = fileData;
          socket.emit(
            "send_message",
            {
              conversationId,
              text: "",
              messageType,
              mediaUrl,
            },
            (response: { success: boolean; data?: { message: Message } }) => {
              if (response.success && response.data?.message) {
                const sentMessage = response.data.message;
                dispatch(addMessage(sentMessage));

                // Update last message in sidebar
                dispatch(
                  chatApi.util.updateQueryData(
                    "getConversations",
                    undefined,
                    (draft) => {
                      const conv = draft.data.find((c) => c._id === conversationId);
                      if (conv) {
                        conv.lastMessage = {
                          _id: sentMessage._id,
                          conversation: sentMessage.conversation,
                          sender: sentMessage.sender._id,
                          messageType: sentMessage.messageType,
                          text: sentMessage.text,
                          mediaUrl: sentMessage.mediaUrl,
                          readBy: sentMessage.readBy,
                          deliveredTo: sentMessage.deliveredTo,
                          createdAt: sentMessage.createdAt,
                          updatedAt: sentMessage.updatedAt,
                        };

                        const index = draft.data.indexOf(conv);
                        if (index > -1) {
                          draft.data.splice(index, 1);
                          draft.data.unshift(conv);
                        }
                      }
                    }
                  )
                );
              }
            }
          );
        }
      }
    } catch (error) {
      console.error("Failed to upload drag & drop files:", error);
    }
  };
  const [isFocused, setIsFocused] = useState(true);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const clearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const typingUsersMap = useAppSelector(
    (state) =>
      state.chat.typingUsers[selectedConversation?._id || ""] ??
      EMPTY_TYPING_MAP,
  );

  const typingUsers = Object.entries(typingUsersMap).filter(
    ([id]) => id !== loggedInUser?._id,
  );
  const isSomeoneElseTyping = typingUsers.length > 0;

  const conversationId = selectedConversation?._id;

  const startClearUnreadsTimer = () => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }
    clearTimerRef.current = setTimeout(() => {
      setUnreadCount(0);
      setUnreadMarkerId(null);
      clearTimerRef.current = null;
    }, 5000); 
  };

  const handleMarkAsRead = () => {
    if (unreadCount > 0 && conversationId && !clearTimerRef.current) {
      const socket = getSocket();
      if (socket) {
        socket.emit("mark_as_read", { conversationId });
      }
      startClearUnreadsTimer();
    }
  };

  // Monitor tab window focus
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Reset initial scroll and unread flags when conversation changes
  useEffect(() => {
    setUnreadCount(0);
    setUnreadMarkerId(null);
    prevLastMessageIdRef.current = null;

    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, [conversationId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  // Emit mark_as_read when active chat or focus changes, if user is already at the bottom
  useEffect(() => {
    if (conversationId && isFocused) {
      const container = scrollRef.current;
      const isNearBottom = container
        ? container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          200
        : true;
      if (isNearBottom) {
        handleMarkAsRead();
      }
    }
  }, [conversationId, isFocused, unreadCount]);

  // Listen to new incoming messages to count unreads if out of view or blurred
  useEffect(() => {
    if (messages.length === 0) {
      prevLastMessageIdRef.current = null;
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const currentLastMessageId = lastMessage._id;
    const prevLastMessageId = prevLastMessageIdRef.current;

    // Update ref with current last message ID
    prevLastMessageIdRef.current = currentLastMessageId;

    // Skip checking if it's the initial load or if the last message has not changed (e.g. loading older history)
    if (!prevLastMessageId || currentLastMessageId === prevLastMessageId) {
      return;
    }

    if (conversationId) {
      const isOwn = lastMessage.sender?._id === loggedInUser?._id;

      if (!isOwn) {
        const container = scrollRef.current;
        const isNearBottom = container
          ? container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            200
          : true;
        const tabFocused = document.hasFocus();

        if (isNearBottom && tabFocused) {
          const socket = getSocket();
          if (socket) {
            socket.emit("mark_as_read", { conversationId });
          }
        } else {
          // Cancel active timer since new unread arrived
          if (clearTimerRef.current) {
            clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
          }
          setUnreadCount((prev) => prev + 1);
          setUnreadMarkerId((prevMarker) => prevMarker || lastMessage._id);
        }
      }
    }
  }, [messages, conversationId, loggedInUser?._id]);

  const handleLoadMore = async () => {
    if (!conversationId || loadingOlder || !hasMore || isFetchingMore) return;
    setLoadingOlder(true);

    try {
      const nextPage = currentPage + 1;
      // Wait for both the API fetch and a minimum delay of 600ms to allow the dots to animate smoothly
      const [response] = await Promise.all([
        getMessages({
          conversationId,
          page: nextPage,
          limit: 20,
        }).unwrap(),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);

      dispatch(
        prependMessages({
          messages: response.data.messages,
          hasMore: response.data.hasMore,
          page: response.data.page,
        }),
      );
    } catch (error) {
      console.error("Failed to load older messages:", error);
    } finally {
      setLoadingOlder(false);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 flex flex-col min-h-0 relative w-full h-full"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-md border-2 border-dashed border-emerald-500 rounded-3xl m-3 animate-fadeIn select-none pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-white/95 dark:bg-gray-900/95 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
              📤
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Drag & Drop files here
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-[200px]">
              Upload images, videos, or documents to send them to this chat
            </p>
          </div>
        </div>
      )}

      {/* Uploading Progress Overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-3xl m-3 select-none pointer-events-none">
          <div className="flex flex-col items-center gap-3 bg-white dark:bg-gray-950 px-6 py-4 rounded-xl shadow-lg">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Sending files...
            </span>
          </div>
        </div>
      )}

      <InfiniteScrollContainer
        onScrollTop={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={loadingOlder}
        messages={messages}
        conversationId={conversationId}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        scrollRef={scrollRef}
        loggedInUserId={loggedInUser?._id}
      >
        <MessageList
          unreadMarkerId={unreadMarkerId}
          unreadCount={unreadCount}
        />

        {isSomeoneElseTyping && (
          <div className="mt-2">
            <TypingIndicator />
          </div>
        )}
      </InfiniteScrollContainer>
    </div>
  );
};

export default ChatBody;
