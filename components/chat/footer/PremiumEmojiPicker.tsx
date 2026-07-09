"use client";

import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmile, BsEmojiSmileFill } from "react-icons/bs";
import { Theme } from "emoji-picker-react";
import dynamic from "next/dynamic";

// Dynamic import with loading skeleton to optimize performance
const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-72 sm:w-80 h-96 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading emojis...</span>
      </div>
    </div>
  ),
});

interface PremiumEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

export default function PremiumEmojiPicker({
  onSelectEmoji,
  disabled = false,
}: PremiumEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Sync dark mode theme automatically
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? Theme.DARK : Theme.LIGHT);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleEmojiClick = (emojiData: any) => {
    onSelectEmoji(emojiData.emoji);
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle emoji picker"
        className={`p-2 transition-all duration-200 rounded-full active:scale-95 focus:outline-none ${
          isOpen
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isOpen ? (
          <BsEmojiSmileFill className="w-5.5 h-5.5 transition-transform duration-200 rotate-12" />
        ) : (
          <BsEmojiSmile className="w-5.5 h-5.5 transition-transform duration-200" />
        )}
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-14 left-0 sm:left-[-10px] z-50 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-gray-100/80 dark:border-gray-700/50 animate-scaleIn origin-bottom-left">
          <Picker
            onEmojiClick={handleEmojiClick}
            theme={theme}
            autoFocusSearch={false}
            skinTonesDisabled={false}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
            height={380}
            width={320}
          />
        </div>
      )}
    </div>
  );
}
