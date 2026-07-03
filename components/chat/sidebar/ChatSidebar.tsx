import ConversationItem from "./ConversationItem";
import NewChatButton from "./NewChatButton";
import SearchConversation from "./SearchConversation";
import SidebarHeader from "./SidebarHeader";

// Temporary mock data to visualize the UI
const DUMMY_CONVERSATIONS = [
  {
    id: "1",
    name: "Design Team",
    lastMessage: "Let me know when the assets are ready.",
    time: "10:42 AM",
    unread: 3,
    isOnline: true,
    isGroup: true,
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    lastMessage: "Sounds good! See you tomorrow.",
    time: "Yesterday",
    unread: 0,
    isOnline: false,
    isGroup: false,
  },
  {
    id: "3",
    name: "Alex Mercer",
    lastMessage: "Can you send over the latest API docs?",
    time: "Tuesday",
    unread: 1,
    isOnline: true,
    isGroup: false,
  },
];

const ChatSidebar = () => {
  return (
    <aside className="flex flex-col w-full h-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200">
      <SidebarHeader />

      <div className="px-4 py-3 space-y-4">
        <SearchConversation />
        <NewChatButton />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        <h3 className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Messages
        </h3>
        <div className="flex flex-col space-y-1 px-2">
          {DUMMY_CONVERSATIONS.map((chat) => (
            <ConversationItem key={chat.id} data={chat} />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
