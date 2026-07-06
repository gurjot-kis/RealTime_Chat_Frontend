export interface ConversationUser {
  _id: string;
  name: string;
  phone: string;
  gender: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LastMessage {
  _id: string;
  conversation: string;
  sender: string;
  messageType: string;
  text: string;
  readBy: string[];
  deliveredTo: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  type: "private" | "group";
  groupName: string | null;
  groupImage: string | null;
  admin: string | null;

  user: ConversationUser;

  lastMessage: LastMessage | null;

  createdAt: string;
  updatedAt: string;
}

export interface GetConversationResponse {
  success: boolean;
  message: string;
  data: Conversation[];
}

/* -------------------------------- Messages -------------------------------- */

export interface MessageSender {
  _id: string;
  name: string;
  phone: string;
}

export interface Message {
  _id: string;
  conversation: string;

  sender: MessageSender;

  messageType: string;
  text: string;

  readBy: string[];
  deliveredTo: string[];

  createdAt: string;
  updatedAt: string;
}

export interface MessagesData {
  messages: Message[];
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface GetMessagesResponse {
  success: boolean;
  message: string;
  data: MessagesData;
}

/* ------------------------------ Send Message ------------------------------ */

export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}