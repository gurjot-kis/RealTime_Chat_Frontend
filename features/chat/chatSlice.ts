import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Conversation, Message } from "./chatTypes";

interface ChatState {
  selectedConversation: Conversation | null;
  messages: Message[];
}

const initialState: ChatState = {
  selectedConversation: null,
  messages: [],
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
      state.messages.push(action.payload);
    },

    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setSelectedConversation,
  clearSelectedConversation,
  setMessages,
  addMessage,
  clearMessages,
} = chatSlice.actions;

export default chatSlice.reducer;