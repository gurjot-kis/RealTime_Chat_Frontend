"use client";

import { useGetConversationsQuery } from "@/features/chat/chatApi";

import ConversationItem from "./ConversationItem";
import NewChatButton from "./NewChatButton";
import SearchConversation from "./SearchConversation";
import SidebarHeader from "./SidebarHeader";

const ChatSidebar = () => {
  const { data, isLoading } = useGetConversationsQuery();

  if (isLoading) {
    return (
      <aside className="w-80 border-r flex items-center justify-center">
        Loading...
      </aside>
    );
  }

  return (
    <aside className="flex flex-col w-full h-full md:w-80 lg:w-96 border-r bg-white">
      <SidebarHeader />

      <div className="px-4 py-3">
        <SearchConversation />

        <div className="mt-4">
          <NewChatButton />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {data?.data.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
          />
        ))}

      </div>
    </aside>
  );
};

export default ChatSidebar;