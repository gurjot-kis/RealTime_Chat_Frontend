import ChatSidebar from "./sidebar/ChatSidebar";
// import ChatHeader from "./header/ChatHeader";
// import ChatBody from "./body/ChatBody";
// import ChatFooter from "./footer/ChatFooter";

export default function ChatLayout() {
  return (
    <div className="flex h-screen bg-slate-100">
      <ChatSidebar />

      {/* <div className="flex flex-1 flex-col">
        <ChatHeader />

        <ChatBody />

        <ChatFooter />
      </div> */}

      chat section
    </div>
  );
}