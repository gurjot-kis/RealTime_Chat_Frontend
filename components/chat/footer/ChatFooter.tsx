"use client";

import { useState } from "react";

import AttachmentButton from "./AttachmentButton";
import EmojiPicker from "./EmojiPicker";
import MessageInput from "./MessageInput";
import SendButton from "./SendButton";

import { getSocket } from "@/services/socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage } from "@/features/chat/chatSlice";

const ChatFooter = () => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");

  const conversation = useAppSelector(
    (state) => state.chat.selectedConversation,
  );

  const handleSend = () => {
    console.log("Send clicked");

    if (!text.trim() || !conversation) return;

    const socket = getSocket();

    if (!socket) return;

    socket.emit(
      "send_message",
      {
        conversationId: conversation._id,
        text,
      },
      (response: any) => {
        console.log("ACK =>", response);

     if (response.success && response.data?.message) {
  dispatch(addMessage(response.data.message)); // 🔥 FIX
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
        onChange={(e) => setText(e.target.value)}
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
