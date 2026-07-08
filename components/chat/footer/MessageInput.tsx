import React, { useRef, useEffect } from "react";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<Props> = ({
  value,
  onChange,
  onKeyDown,
  onPaste,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow height calculation based on content scrollHeight
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get accurate scrollHeight calculation
    textarea.style.height = "auto";

    // Min height = 40px (original size), Max height = 190px
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 190);
    textarea.style.height = `${newHeight}px`;

    // Show scrollbar only if the content height exceeds 190px
    if (textarea.scrollHeight > 190) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }
  }, [value]);

  return (
    <div className="flex-1 mx-1 sm:mx-2 min-w-0 flex items-center">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        disabled={disabled}
        placeholder="Type a message..."
        className={`w-full py-2.5 px-5 text-[14.5px] rounded-2xl resize-none transition-all duration-150 outline-none premium-textarea-scrollbar leading-relaxed
          ${
            disabled
              ? "bg-gray-100/80 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500"
              : "bg-gray-100/70 border border-transparent focus:border-emerald-500/30 focus:bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:focus:bg-gray-900 shadow-inner focus:shadow-sm focus:ring-[3px] focus:ring-emerald-500/10"
          }`}
        style={{ height: "40px", overflowY: "hidden" }}
      />
    </div>
  );
};

export default MessageInput;
