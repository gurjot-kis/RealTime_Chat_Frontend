import React from "react";

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
      className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
        disabled
          ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
      }`}
    >
      <svg
        className="w-5 h-5 ml-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    </button>
  );
};

export default SendButton;