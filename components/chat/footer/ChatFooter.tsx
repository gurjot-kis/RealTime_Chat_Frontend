"use client";

import { useState, useEffect, useRef } from "react";

import AttachmentButton from "./AttachmentButton";
// import EmojiPicker from "./EmojiPicker";
import PremiumEmojiPicker from "./PremiumEmojiPicker";
import MessageInput from "./MessageInput";
import SendButton from "./SendButton";

import { getSocket } from "@/services/socket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addMessage, setReplyingToMessage } from "@/features/chat/chatSlice";
import { Message } from "@/features/chat/chatTypes";
import {
  chatApi,
  useUploadMultipleMediaMutation,
} from "@/features/chat/chatApi";
import AttachmentMenu from "./AttachmentMenu";
import PastePreviewModal from "./PastePreviewModal";

const ChatFooter = () => {
  const dispatch = useAppDispatch();
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [pasteFiles, setPasteFiles] = useState<File[]>([]);
  const [uploadMultipleMedia, { isLoading: isUploading }] =
    useUploadMultipleMediaMutation();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversation = useAppSelector((state) => state.chat.selectedConversation);
  const replyingToMessage = useAppSelector((state) => state.chat.replyingToMessage);

  // Stop typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = (value: string) => {
    const socket = getSocket();
    if (!socket || !conversation) return;

    if (value.trim() && !isTyping) {
      socket.emit("typing", { conversationId: conversation._id });
      setIsTyping(true);
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
        parentMessageId: replyingToMessage?._id,
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

    setText("");
    dispatch(setReplyingToMessage(null));
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
              parentMessageId: replyingToMessage?._id,
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
      dispatch(setReplyingToMessage(null));
    }
  };
  const handleSelectEmoji = (emoji: string) => {
    const updatedText = text + emoji;
    setText(updatedText);
    handleTyping(updatedText);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardItems = e.clipboardData.items;
    const files: File[] = [];

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      setPasteFiles((prev) => [...prev, ...files]);
    }
  };

  const handlePasteSend = async (files: File[], caption: string) => {
    if (!conversation) return;

    try {
      // 1. Prepare files for upload
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      // 2. Upload media
      const uploadResponse = await uploadMultipleMedia(formData).unwrap();

      if (uploadResponse.success && uploadResponse.data) {
        const socket = getSocket();
        if (!socket) return;

        // 3. Emit media messages sequentially
        for (let i = 0; i < uploadResponse.data.length; i++) {
          const fileData = uploadResponse.data[i];
          const { mediaUrl, messageType } = fileData;
          
          // Attach caption to the first item
          const msgCaption = i === 0 ? caption : "";

          socket.emit(
            "send_message",
            {
              conversationId: conversation._id,
              text: msgCaption,
              messageType: messageType,
              mediaUrl: mediaUrl,
              parentMessageId: replyingToMessage?._id,
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
      console.error("Failed to send pasted media:", error);
    } finally {
      setPasteFiles([]);
      dispatch(setReplyingToMessage(null));
    }
  };

  return (
    <footer className="relative flex flex-col gap-2 px-3 sm:px-6 py-3 sm:py-4 bg-white/90 backdrop-blur-md dark:bg-gray-900/90 border-t border-slate-100 dark:border-gray-800/60 w-full shrink-0 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-200">
      {/* Replying Preview Container */}
      {replyingToMessage && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-l-4 border-emerald-500 rounded-lg animate-fadeIn select-none mb-1">
          <div className="flex flex-col text-xs text-left gap-0.5 min-w-0">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Replying to {replyingToMessage.sender.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-[400px]">
              {replyingToMessage.messageType === "image" ? "📷 Photo" :
               replyingToMessage.messageType === "video" ? "🎥 Video" :
               replyingToMessage.messageType === "file" ? "📄 File" :
               replyingToMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(setReplyingToMessage(null))}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="Cancel reply"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input Controls Row */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full">
        <AttachmentMenu
          isOpen={isAttachmentMenuOpen}
          onClose={() => setIsAttachmentMenuOpen(false)}
          onFileSelect={handleFileSelect}
        />
        {/* <EmojiPicker onSelectEmoji={handleSelectEmoji} disabled={isUploading} /> */}
        <PremiumEmojiPicker onSelectEmoji={handleSelectEmoji} disabled={isUploading} />
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
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onPaste={handlePaste}
          disabled={isUploading}
        />
        <SendButton disabled={!text.trim() || isUploading} onClick={handleSend} />
      </div>

      {pasteFiles.length > 0 && (
        <PastePreviewModal
          files={pasteFiles}
          onClose={() => setPasteFiles([])}
          onSend={(caption) => handlePasteSend(pasteFiles, caption)}
          isUploading={isUploading}
        />
      )}
    </footer>
  );
};

export default ChatFooter;
