import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Conversation, Message } from "./chatTypes";

interface ChatState {
  selectedConversation: Conversation | null;
  messages: Message[];
  typingUsers: Record<string, Record<string, string>>; // conversationId -> { userId: userName }
  onlineUsers: string[]; // list of user IDs
}

const initialState: ChatState = {
  selectedConversation: null,
  messages: [],
  typingUsers: {},
  onlineUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedConversation: (
      state,
      action: PayloadAction<Conversation | null>,
    ) => {
      state.selectedConversation = action.payload;
    },

    clearSelectedConversation: (state) => {
      state.selectedConversation = null;
      state.messages = [];
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      if (
        state.selectedConversation &&
        action.payload.conversation === state.selectedConversation._id
      ) {
        state.messages.push(action.payload);
      }
    },

    clearMessages: (state) => {
      state.messages = [];
    },

    setUserTyping: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string; userName: string }>,
    ) => {
      const { conversationId, userId, userName } = action.payload;
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      state.typingUsers[conversationId][userId] = userName;
    },

    setUserStopTyping: (
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>,
    ) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        delete state.typingUsers[conversationId][userId];
      }
    },

    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },

    addUserOnline: (state, action: PayloadAction<string>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    removeUserOffline: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },
  },
});

export const {
  setSelectedConversation,
  clearSelectedConversation,
  setMessages,
  addMessage,
  clearMessages,
  setUserTyping,
  setUserStopTyping,
  setOnlineUsers,
  addUserOnline,
  removeUserOffline,
} = chatSlice.actions;

export default chatSlice.reducer;