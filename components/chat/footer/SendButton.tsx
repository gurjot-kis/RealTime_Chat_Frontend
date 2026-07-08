import React from "react";
import { IoSend } from "react-icons/io5";

interface SendButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

const SendButton: React.FC<SendButtonProps> = ({
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2.5 rounded-full flex items-center justify-center transition-all active:scale-95 hover:scale-105 ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10"
      }`}
    >
      <IoSend className="w-4 h-4" />
    </button>
  );
};

export default SendButton;
