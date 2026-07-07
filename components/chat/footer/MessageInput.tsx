import React from "react";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<Props> = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
}) => {
  return (
    <div className="flex-1 mx-1 sm:mx-2 min-w-0">
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type a message..."
        className={`w-full py-2.5 px-5 text-[14.5px] rounded-full transition-all duration-300 outline-none
          ${
            disabled
              ? "bg-gray-100/80 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500"
              : "bg-gray-100/70 border border-transparent focus:border-emerald-500/30 focus:bg-white dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:focus:bg-gray-900 shadow-inner focus:shadow-sm focus:ring-[3px] focus:ring-emerald-500/10"
          }`}
      />
    </div>
  );
};

export default MessageInput;
