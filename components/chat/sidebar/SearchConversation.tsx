interface SearchConversationProps {
  value: string;
  onChange: (val: string) => void;
}

const SearchConversation: React.FC<SearchConversationProps> = ({ value, onChange }) => {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-100/80 dark:bg-gray-800 border border-transparent focus:border-emerald-500/40 focus:bg-white dark:focus:bg-gray-900 rounded-2xl text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:text-white dark:placeholder-gray-500 transition-all duration-200"
        placeholder="Search or start a new chat"
      />
    </div>
  );
};

export default SearchConversation;
