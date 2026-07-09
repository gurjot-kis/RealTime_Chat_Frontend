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
  hasUnreads: boolean;
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
  hasUnreads,
  onMarkAsRead,
  scrollRef,
  loggedInUserId,
}: InfiniteScrollContainerProps) {
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [floatingDate, setFloatingDate] = useState<string>("");
  const [showFloatingDate, setShowFloatingDate] = useState<boolean>(false);

  const scrollHeightBeforeRef = useRef<number>(0);
  const scrollTopBeforeRef = useRef<number>(0);
  const hasInitialScrolledRef = useRef<boolean>(false);
  const prevLastMsgIdRef = useRef<string | null>(null);
  const isFetchingOlderRef = useRef<boolean>(false);
  
  const floatingDateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (floatingDateTimeoutRef.current) {
        clearTimeout(floatingDateTimeoutRef.current);
      }
    };
  }, []);

  // Reset scroll reference flags on conversation change
  useEffect(() => {
    hasInitialScrolledRef.current = false;
    setShowScrollArrow(false);
    prevLastMsgIdRef.current = null;
    isFetchingOlderRef.current = false;
    setFloatingDate("");
    setShowFloatingDate(false);
    if (floatingDateTimeoutRef.current) {
      clearTimeout(floatingDateTimeoutRef.current);
      floatingDateTimeoutRef.current = null;
    }
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

    if (isFetchingOlderRef.current) {
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
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        } else {
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
    if (isNearBottom && document.hasFocus() && (hasUnreads || unreadCount > 0)) {
      onMarkAsRead();
    }

    // Floating Date calculation (WhatsApp Style)
    const dividers = container.querySelectorAll(".date-divider-element");
    let currentActiveDate = "";
    const containerTop = container.getBoundingClientRect().top;

    if (dividers.length > 0) {
      // Default to the first divider date initially
      currentActiveDate = dividers[0].getAttribute("data-date") || "";

      dividers.forEach((divider) => {
        const rect = divider.getBoundingClientRect();
        // If the divider reaches or crosses the top of the container scroll space
        if (rect.top <= containerTop + 40) {
          currentActiveDate = divider.getAttribute("data-date") || "";
        }
      });
    }

    if (currentActiveDate) {
      setFloatingDate(currentActiveDate);
      setShowFloatingDate(true);

      if (floatingDateTimeoutRef.current) {
        clearTimeout(floatingDateTimeoutRef.current);
      }

      floatingDateTimeoutRef.current = setTimeout(() => {
        setShowFloatingDate(false);
      }, 1500);
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
      {/* Dynamic Floating Date Badge (WhatsApp Style) */}
      {floatingDate && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center transition-all duration-300 pointer-events-none select-none ${
          showFloatingDate 
            ? "opacity-100 translate-y-0 scale-100" 
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        }`}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-bold tracking-wide uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/90 backdrop-blur-md rounded-full shadow-lg shadow-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10">
            <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2.5} />
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2.5} />
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2.5} />
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2.5} />
            </svg>
            <span>{floatingDate}</span>
          </div>
        </div>
      )}

      {/* Floating history loading overlay */}
      {isLoadingMore && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-slate-100 dark:border-gray-700 animate-fadeIn">
          <div className="flex space-x-1 items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 dark:text-gray-300 tracking-wider uppercase">
            Loading...
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
