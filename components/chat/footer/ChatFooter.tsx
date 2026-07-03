// components/chat/footer/ChatFooter.tsx
import React from 'react';
import AttachmentButton from './AttachmentButton';
import EmojiPicker from './EmojiPicker';
import MessageInput from './MessageInput';
import SendButton from './SendButton';

const ChatFooter = () => {
  return (
    <footer className="flex items-center px-4 py-3 bg-white border-t border-gray-100 dark:bg-gray-900 dark:border-gray-800 w-full transition-colors duration-200 shrink-0">
      <AttachmentButton />
      <MessageInput />
      <EmojiPicker />
      <div className="ml-1 sm:ml-2">
        <SendButton disabled={false} />
      </div>
    </footer>
  );
};

export default ChatFooter;