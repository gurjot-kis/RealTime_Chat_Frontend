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
import {
  chatApi,
  useUploadMultipleMediaMutation,
} from "@/features/chat/chatApi";
import AttachmentMenu from "./AttachmentMenu";

const ChatFooter = () => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [uploadMultipleMedia, { isLoading: isUploading }] =
    useUploadMultipleMediaMutation();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingStateRef = useRef({ isTyping: false, conversationId: "" });

  const conversation = useAppSelector(
    (state) => state.chat.selectedConversation,
  );

  useEffect(() => {
    typingStateRef.current = {
      isTyping,
      conversationId: conversation?._id || "",
    };
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
            chatApi.util.updateQueryData(
              "getConversations",
              undefined,
              (draft) => {
                const conv = draft.data.find((c) => c._id === conversation._id);
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

                  // Move conversation to the top
                  const index = draft.data.indexOf(conv);
                  if (index > -1) {
                    draft.data.splice(index, 1);
                    draft.data.unshift(conv);
                  }
                }
              },
            ),
          );

          setText("");
        }
      },
    );
  };

  const handleFileSelect = async (
    files: FileList,
    type: "document" | "media",
  ) => {
    if (!conversation) return;

    try {
      // 1. Prepare the files for upload
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      // 2. Upload the files via REST
      const uploadResponse = await uploadMultipleMedia(formData).unwrap();

      if (uploadResponse.success && uploadResponse.data) {
        const socket = getSocket();
        if (!socket) return;

        // 3. Emit the socket events with the media details sequentially (WhatsApp style)
        for (const fileData of uploadResponse.data) {
          const { mediaUrl, messageType } = fileData;
          socket.emit(
            "send_message",
            {
              conversationId: conversation._id,
              text: "", // Caption could be supported later
              messageType: messageType,
              mediaUrl: mediaUrl,
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
                      const conv = draft.data.find(
                        (c) => c._id === conversation._id,
                      );
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

                        // Move conversation to the top
                        const index = draft.data.indexOf(conv);
                        if (index > -1) {
                          draft.data.splice(index, 1);
                          draft.data.unshift(conv);
                        }
                      }
                    },
                  ),
                );
              }
            },
          );
        }
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
    } finally {
      // Close the menu whether it succeeded or failed
      setIsAttachmentMenuOpen(false);
    }
  };
  return (
    <footer className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border-t border-slate-100 dark:border-gray-800/60 w-full shrink-0 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-200">
      <AttachmentMenu
        isOpen={isAttachmentMenuOpen}
        onClose={() => setIsAttachmentMenuOpen(false)}
        onFileSelect={handleFileSelect}
      />
      <AttachmentButton
        isOpen={isAttachmentMenuOpen}
        onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
        disabled={isUploading}
      />
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
        disabled={isUploading}
      />
      <EmojiPicker />
      <SendButton disabled={!text.trim() || isUploading} onClick={handleSend} />
    </footer>
  );
};

export default ChatFooter;
