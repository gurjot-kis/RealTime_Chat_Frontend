import React, { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import TypingIndicator from "./TypingIndicator";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { getSocket } from "@/services/socket";
import { useLazyGetMessagesQuery } from "@/features/chat/chatApi";
import { prependMessages } from "@/features/chat/chatSlice";

// Stable reference so the selector never returns a brand-new `{}` on every render,
// which would trigger unnecessary rerenders (Redux selector equality check).
const EMPTY_TYPING_MAP: Record<string, string> = {};

const ChatBody = () => {
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [getMessages, { isFetching: isFetchingMore }] =
    useLazyGetMessagesQuery();
  const [loadingOlder, setLoadingOlder] = useState(false);

  const scrollHeightBeforeRef = useRef<number>(0);
  const scrollTopBeforeRef = useRef<number>(0);
  const prevConversationIdRef = useRef<string | null>(null);

  const selectedConversation = useAppSelector(
    (state) => state.chat.selectedConversation,
  );
  const loggedInUser = useAppSelector((state) => state.auth.user);
  const messages = useAppSelector((state) => state.chat.messages);
  const currentPage = useAppSelector((state) => state.chat.currentPage);
  const hasMore = useAppSelector((state) => state.chat.hasMore);

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMarkerId, setUnreadMarkerId] = useState<string | null>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
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
  const hasInitialScrolledRef = useRef<boolean>(false);

  const startClearUnreadsTimer = () => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }
    clearTimerRef.current = setTimeout(() => {
      setUnreadCount(0);
      setUnreadMarkerId(null);
      clearTimerRef.current = null;
    }, 10000); // 30 seconds display duration
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
    hasInitialScrolledRef.current = false;
    setUnreadCount(0);
    setUnreadMarkerId(null);
    setShowScrollArrow(false);
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
  }, [conversationId, isFocused]);

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

  // Adjust scroll position after prepending older messages or on initial mount / new message
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (loadingOlder) {
      // Anchoring scroll: calculate height difference and adjust scroll top
      const heightDifference =
        container.scrollHeight - scrollHeightBeforeRef.current;
      container.scrollTop = scrollTopBeforeRef.current + heightDifference;
      setLoadingOlder(false);
    } else {
      // Check if messages in Redux belong to the currently selected conversation
      const isMessagesForCurrentConversation =
        messages.length > 0 && messages[0].conversation === conversationId;

      if (!hasInitialScrolledRef.current && isMessagesForCurrentConversation) {
        container.scrollTop = container.scrollHeight;
        hasInitialScrolledRef.current = true;
      } else {
        // If a new message arrived and user is near bottom, scroll to bottom
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          200;
        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  }, [messages, loadingOlder, conversationId]);

  // Auto-scroll to bottom on typing updates if user is near bottom
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200;
    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [isSomeoneElseTyping]);

  const handleScroll = async () => {
    const container = scrollRef.current;
    if (!container) return;

    // If user scrolled to the top (scrollTop <= 5) and hasMore is true
    if (
      container.scrollTop <= 5 &&
      hasMore &&
      !isFetchingMore &&
      !loadingOlder
    ) {
      if (!conversationId) return;

      // Save the current height and scroll position before calling API
      scrollHeightBeforeRef.current = container.scrollHeight;
      scrollTopBeforeRef.current = container.scrollTop;
      setLoadingOlder(true);

      try {
        const nextPage = currentPage + 1;
        const response = await getMessages({
          conversationId,
          page: nextPage,
          limit: 20,
        }).unwrap();

        dispatch(
          prependMessages({
            messages: response.data.messages,
            hasMore: response.data.hasMore,
            page: response.data.page,
          }),
        );
      } catch (error) {
        console.error("Failed to load older messages:", error);
        setLoadingOlder(false);
      }
    }

    // Show/hide scroll arrow based on scroll position
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200;
    setShowScrollArrow(!isNearBottom);

    // If they scrolled to the bottom, mark messages as read and start clear delay!
    if (isNearBottom && document.hasFocus()) {
      handleMarkAsRead();
    }
  };

  const scrollToBottom = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
    handleMarkAsRead();
  };

  return (
    <div className="relative flex-1 min-h-0 w-full bg-whatsapp-pattern">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full px-6 py-6 overflow-y-auto transition-colors duration-200"
      >
        <div className="w-full flex flex-col justify-end min-h-full px-2 sm:px-4 md:px-8">
          {/* A little padding at the top so messages don't stick to the header */}
          <div className="pt-4">
            {loadingOlder && (
              <div className="flex flex-col items-center justify-center py-4 animate-fadeIn">
                <div className="flex space-x-1.5 items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600/70 mt-2 tracking-wide uppercase">Loading older messages</span>
              </div>
            )}

            <MessageList
              unreadMarkerId={unreadMarkerId}
              unreadCount={unreadCount}
            />

            {isSomeoneElseTyping && (
              <div className="mt-2">
                <TypingIndicator />
              </div>
            )}
          </div>
        </div>
      </div>

      {showScrollArrow && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md border border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all duration-200 animate-bounce cursor-pointer group"
        >
          <svg
            className="w-5 h-5 group-hover:translate-y-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-800">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatBody;
