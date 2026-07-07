"use client";

import { useState, useEffect, useRef } from "react";

import AttachmentButton from "./AttachmentButton";
import EmojiPicker from "./EmojiPicker";
import MessageInput from "./MessageInput";
import SendButton from "./SendButton";

import { getSocket } from "@/services/socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage } from "@/features/chat/chatSlice";
import { Message } from "@/features/chat/chatTypes";
import { chatApi } from "@/features/chat/chatApi";

const ChatFooter = () => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStateRef = useRef({ isTyping: false, conversationId: "" });

  const conversation = useAppSelector(
    (state) => state.chat.selectedConversation,
  );

  useEffect(() => {
    typingStateRef.current = { isTyping, conversationId: conversation?._id || "" };
  }, [isTyping, conversation?._id]);

  useEffect(() => {
    return () => {
      const { isTyping: wasTyping, conversationId } = typingStateRef.current;
      if (wasTyping && conversationId) {
        const socket = getSocket();
        socket?.emit("stop_typing", { conversationId });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsTyping(false);
    };
  }, [conversation?._id]);

  const handleTyping = (newText: string) => {
    const socket = getSocket();
    if (!socket || !conversation) return;

    if (newText.trim() === "") {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (isTyping) {
        socket.emit("stop_typing", { conversationId: conversation._id });
        setIsTyping(false);
      }
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { conversationId: conversation._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId: conversation._id });
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    console.log("Send clicked");

    if (!text.trim() || !conversation) return;

    const socket = getSocket();

    if (!socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTyping) {
      socket.emit("stop_typing", { conversationId: conversation._id });
      setIsTyping(false);
    }

    socket.emit(
      "send_message",
      {
        conversationId: conversation._id,
        text,
      },
      (response: { success: boolean; data?: { message: Message } }) => {
        console.log("ACK =>", response);

        if (response.success && response.data?.message) {
          const sentMessage = response.data.message;
          dispatch(addMessage(sentMessage));
          
          // Update last message in sidebar
          dispatch(
            chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
              const conv = draft.data.find((c) => c._id === conversation._id);
              if (conv) {
                conv.lastMessage = {
                  _id: sentMessage._id,
                  conversation: sentMessage.conversation,
                  sender: sentMessage.sender._id,
                  messageType: sentMessage.messageType,
                  text: sentMessage.text,
                  readBy: sentMessage.readBy,
                  deliveredTo: sentMessage.deliveredTo,
                  createdAt: sentMessage.createdAt,
                  updatedAt: sentMessage.updatedAt,
                };
                
                // Move conversation to the top
                const index = draft.data.indexOf(conv);
                if (index > -1) {
                  draft.data.splice(index, 1);
                  draft.data.unshift(conv);
                }
              }
            })
          );

          setText("");
        }
      },
    );
  };

  return (
    <footer className="flex items-center px-4 py-3 bg-white border-t w-full">
      <AttachmentButton />

      <MessageInput
        value={text}
        onChange={(e) => {
          const newText = e.target.value;
          setText(newText);
          handleTyping(newText);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
      />

      <EmojiPicker />

      <SendButton disabled={!text.trim()} onClick={handleSend} />
    </footer>
  );
};

export default ChatFooter;
