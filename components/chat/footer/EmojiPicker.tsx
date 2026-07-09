// components/chat/footer/EmojiPicker.tsx
import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmile, BsEmojiSmileFill } from "react-icons/bs";

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

const EMOJI_CATEGORIES = [
  {
    title: "Smileys & Emotion",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", 
      "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", 
      "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
      "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓"
    ]
  },
  {
    title: "Hands & Gestures",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", 
      "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", 
      "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "🫶", "🙏"
    ]
  },
  {
    title: "Hearts & Expressions",
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", 
      "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", 
      "💥", "💫", "✨", "💯", "💢", "💬", "👁️", "🧠", "💅", "🔥"
    ]
  },
  {
    title: "Animals & Nature",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", 
      "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦅", 
      "🐝", "🦋", "🐌", "🐞", "🐜", "🕷️", "🐢", "🐍", "🐙", "🐬",
      "🍀", "🌸", "🌹", "🌻", "🍂", "🍁", "🌲", "🌴", "🌵", "🌾"
    ]
  }
];

export default function EmojiPicker({ onSelectEmoji, disabled = false }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const categoriesEndRef = useRef<HTMLDivElement>(null);

  // Close picker on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleCategoryClick = (index: number) => {
    setActiveCategory(index);
    const categoryEl = containerRef.current?.querySelector(`#emoji-category-${index}`);
    if (categoryEl) {
      categoryEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        <div
          className="absolute bottom-14 left-0 sm:left-[-10px] z-50 w-72 sm:w-80 h-96 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-gray-100/80 dark:border-gray-700/50 flex flex-col overflow-hidden animate-scaleIn origin-bottom-left"
        >
          {/* Header tabs */}
          <div className="flex border-b border-gray-100/80 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 px-2 py-1.5 shrink-0 select-none overflow-x-auto [scrollbar-width:none]">
            {EMOJI_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.title}
                type="button"
                onClick={() => handleCategoryClick(idx)}
                className={`flex-1 text-[13px] py-1 px-1.5 text-center font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === idx
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                {cat.emojis[0]}
              </button>
            ))}
          </div>

          {/* Emoji Lists (Scroll Area) */}
          <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent] dark:[scrollbar-color:rgba(255,255,255,0.1)_transparent]">
            {EMOJI_CATEGORIES.map((category, catIdx) => (
              <div key={category.title} id={`emoji-category-${catIdx}`} className="mb-4">
                <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 select-none">
                  {category.title}
                </h4>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
                  {category.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onSelectEmoji(emoji)}
                      className="text-2xl h-9 w-9 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 active:scale-90 transition-all cursor-pointer duration-150 hover:-translate-y-0.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div ref={categoriesEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}