interface NewChatButtonProps {
  onClick?: () => void;
}

const NewChatButton = ({ onClick }: NewChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 cursor-pointer"
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/25 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </span>
      Start New Chat
    </button>
  );
};

export default NewChatButton;
