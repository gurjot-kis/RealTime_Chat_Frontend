"use client";

import { useEffect } from "react";

import { useLazyGetMessagesQuery } from "@/features/chat/chatApi";
import { setMessages } from "@/features/chat/chatSlice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import MessageBubble from "./MessageBubble";
import DateDivider from "./DateDivider";

interface MessageListProps {
  unreadMarkerId?: string | null;
  unreadCount?: number;
}

const MessageList = ({ unreadMarkerId, unreadCount = 0 }: MessageListProps) => {
  const dispatch = useAppDispatch();

  const [getMessages] = useLazyGetMessagesQuery();

  const messages = useAppSelector((state) => state.chat.messages);

  const selectedConversation = useAppSelector(
    (state) => state.chat.selectedConversation
  );

  const loggedInUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const response = await getMessages({
          conversationId: selectedConversation._id,
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
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();
  }, [selectedConversation, getMessages, dispatch]);

  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a conversation
      </div>
    );
  }

  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    
    // Set times to midnight to do date-only comparison
    const dMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowMidnight.getTime() - dMidnight.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays > 1 && diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month} ${day} ${year}`;
    }
  };

  const renderMessages = () => {
    const elements: React.ReactNode[] = [];
    let lastDateLabel = "";

    messages.forEach((message) => {
      const dateLabel = formatDateLabel(message.createdAt);

      if (dateLabel !== lastDateLabel) {
        elements.push(
          <DateDivider key={`divider-${message._id}`} date={dateLabel} />
        );
        lastDateLabel = dateLabel;
      }

      if (message._id === unreadMarkerId && unreadCount > 0) {
        elements.push(
          <div key={`unread-divider-${message._id}`} className="flex items-center justify-center my-4 animate-fadeIn">
            <div className="flex-1 border-t border-red-200 dark:border-red-900/30"></div>
            <span className="mx-4 text-xs font-semibold px-3 py-1 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/30">
              {unreadCount} Unread Message{unreadCount > 1 ? 's' : ''}
            </span>
            <div className="flex-1 border-t border-red-200 dark:border-red-900/30"></div>
          </div>
        );
      }

      const getMessageStatus = (msg: typeof message) => {
        const isOwn = msg.sender._id === loggedInUser?._id;
        if (!isOwn) return undefined;

        const hasBeenRead = msg.readBy && msg.readBy.some((r: any) => {
          const readerId = typeof r === "string" ? r : r.user;
          return readerId !== loggedInUser?._id;
        });

        if (hasBeenRead) return "seen";

        const hasBeenDelivered = msg.deliveredTo && msg.deliveredTo.some((d: any) => {
          const receiverId = typeof d === "string" ? d : d.user;
          return receiverId !== loggedInUser?._id;
        });

        if (hasBeenDelivered) return "delivered";

        return "sent";
      };

      elements.push(
        <MessageBubble
          key={message._id}
          message={{
            id: message._id,
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isOwn: message.sender._id === loggedInUser?._id,
            status: getMessageStatus(message),
            messageType: message.messageType,
            mediaUrl: message.mediaUrl,
            senderAvatar: message.sender.avatar || "",
            senderName: message.sender.name,
          }}
        />
      );
    });

    return elements;
  };

  return (
    <div className="flex flex-col w-full">
      {renderMessages()}
    </div>
  );
};

export default MessageList;