"use client";

import { useEffect } from "react";

import { useLazyGetMessagesQuery } from "@/features/chat/chatApi";
import { setMessages } from "@/features/chat/chatSlice";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import MessageBubble from "./MessageBubble";
import DateDivider from "./DateDivider";

const MessageList = () => {
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

        dispatch(setMessages(response.data.messages));
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

  return (
    <div className="flex flex-col w-full">
      <DateDivider date="Today" />

      {messages.map((message) => (
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
            status: "sent",
          }}
        />
      ))}
    </div>
  );
};

export default MessageList;