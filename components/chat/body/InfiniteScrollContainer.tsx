"use client";

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  onScrollTop: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  messages: any[];
  conversationId?: string;
  unreadCount: number;
  onMarkAsRead: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  loggedInUserId?: string;
}

export default function InfiniteScrollContainer({
  children,
  onScrollTop,
  hasMore,
  isLoadingMore,
  messages,
  conversationId,
  unreadCount,
  onMarkAsRead,
  scrollRef,
  loggedInUserId,
}: InfiniteScrollContainerProps) {
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  const scrollHeightBeforeRef = useRef<number>(0);
  const scrollTopBeforeRef = useRef<number>(0);
  const hasInitialScrolledRef = useRef<boolean>(false);
  const prevLastMsgIdRef = useRef<string | null>(null);
  const isFetchingOlderRef = useRef<boolean>(false);

  // Reset scroll reference flags on conversation change
  useEffect(() => {
    hasInitialScrolledRef.current = false;
    setShowScrollArrow(false);
    prevLastMsgIdRef.current = null;
    isFetchingOlderRef.current = false;
  }, [conversationId]);

  // Adjust scroll position after prepending older messages or on initial mount / new message
  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const currentLastMsgId = lastMessage?._id || null;
    const isNewMessageAppend =
      prevLastMsgIdRef.current !== null &&
      currentLastMsgId !== null &&
      currentLastMsgId !== prevLastMsgIdRef.current;

    prevLastMsgIdRef.current = currentLastMsgId;

    // IMPORTANT: we intentionally do NOT branch on the `isLoadingMore` prop here.
    // React 18 batches the parent's `dispatch(prependMessages(...))` together with
    // its `setLoadingOlder(false)` (they run back-to-back with no await between
    // them), so by the time this effect runs after a prepend, `isLoadingMore` has
    // *already* flipped back to false in the very same render. Branching on it
    // would silently skip the anchor adjustment below, which is exactly the "jumps
    // to the top of the newly loaded page" bug.
    //
    // `isFetchingOlderRef` is a plain ref (not React state), so it isn't subject to
    // batching timing: it's set to true before the fetch starts and only reset to
    // false in `handleScroll`'s own `finally`, which runs strictly after this
    // effect has already committed. That makes it a reliable signal that "messages"
    // just changed because of a prepend.
    if (isFetchingOlderRef.current) {
      // Anchoring scroll: calculate height difference and adjust scroll top so the
      // content the user was looking at stays in the same visual position.
      const heightDifference =
        container.scrollHeight - scrollHeightBeforeRef.current;
      container.scrollTop = scrollTopBeforeRef.current + heightDifference;
    } else {
      const isMessagesForCurrentConversation =
        messages.length > 0 && messages[0].conversation === conversationId;

      if (!hasInitialScrolledRef.current && isMessagesForCurrentConversation) {
        container.scrollTop = container.scrollHeight;
        hasInitialScrolledRef.current = true;
      } else if (isNewMessageAppend) {
        const lastMessageSenderId =
          typeof lastMessage?.sender === "object"
            ? lastMessage.sender?._id
            : lastMessage?.sender;
        const isOwn = lastMessageSenderId === loggedInUserId;

        if (isOwn) {
          // Always scroll to bottom smoothly when own message is sent
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        } else {
          // If a new message arrived and user is near bottom, scroll to bottom smoothly
          const isNearBottom =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            200;
          if (isNearBottom) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }
    }
  }, [messages, conversationId, loggedInUserId]);

  const handleScroll = async () => {
    const container = scrollRef.current;
    if (!container) return;

    // Load older messages if scrolled to top
    if (
      container.scrollTop <= 5 &&
      hasMore &&
      !isLoadingMore &&
      !isFetchingOlderRef.current
    ) {
      isFetchingOlderRef.current = true;
      scrollHeightBeforeRef.current = container.scrollHeight;
      scrollTopBeforeRef.current = container.scrollTop;
      try {
        await onScrollTop();
      } finally {
        // Reset happens AFTER the parent's fetch has fully resolved (including its
        // dispatch + setLoadingOlder(false)), i.e. after the anchoring effect above
        // has already run and used isFetchingOlderRef.current === true.
        isFetchingOlderRef.current = false;
      }
    }

    // Toggle arrow button visibility
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      200;
    const shouldShow = !isNearBottom;
    setShowScrollArrow((prev) => (prev !== shouldShow ? shouldShow : prev));

    // Mark as read if user is scrolled to bottom
    if (isNearBottom && document.hasFocus() && unreadCount > 0) {
      onMarkAsRead();
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
    onMarkAsRead();
  };

  return (
    <div className="relative flex-1 min-h-0 w-full bg-[#f3f7f4] dark:bg-[#000000] bg-whatsapp-pattern">
      {/* Floating history loading overlay */}
      {isLoadingMore && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-slate-100 dark:border-gray-700 animate-fadeIn">
          <div className="flex space-x-1 items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300 tracking-wider uppercase">
            Loading Earlier Messages...
          </span>
        </div>
      )}

      {/* Main hardware accelerated scroll container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-full px-6 py-6 smooth-scroll-container transition-colors duration-200"
      >
        <div className="w-full flex flex-col justify-end min-h-full px-2 sm:px-4 md:px-8">
          <div className="pt-4">{children}</div>
        </div>
      </div>

      {/* Floating down arrow badge */}
      {showScrollArrow && (
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to latest messages"
          className="absolute bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 shadow-lg shadow-black/10 border border-slate-100 dark:border-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer animate-scaleIn"
        >
          <MdKeyboardDoubleArrowDown className="w-6 h-6" />

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5  min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 px-1 text-[10.5px] font-bold text-white shadow-sm shadow-emerald-500/30 ring-2 ring-white dark:ring-gray-900 animate-scaleIn">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
