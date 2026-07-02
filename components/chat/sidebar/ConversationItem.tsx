
interface ConversationItemProps {
  data: {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    isOnline: boolean;
    isGroup: boolean;
  };
}

const ConversationItem: React.FC<ConversationItemProps> = ({ data }) => {
  return (
    <div className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
      {/* Avatar Section */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200 font-semibold text-lg">
          {data.name.charAt(0)}
        </div>
        {data.isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
        )}
      </div>

      {/* Text Content Section */}
      <div className="flex-1 min-w-0 ml-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {data.name}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
            {data.time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate pr-2">
            {data.lastMessage}
          </p>
          {data.unread > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-600 rounded-full flex-shrink-0">
              {data.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;