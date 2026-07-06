import { baseApi } from "@/store/api/baseApi";
import {
  GetConversationResponse,
  GetMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "./chatTypes";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations
    getConversations: builder.query<GetConversationResponse, void>({
      query: () => ({
        url: "/conversations",
        method: "GET",
      }),
      extraOptions: {
        requiresAuth: true,
      },
      providesTags: ["Conversation"],
    }),

    // Get messages of a conversation
    getMessages: builder.query<
      GetMessagesResponse,
      {
        conversationId: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ conversationId, page = 1, limit = 20 }) => ({
        url: `/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      extraOptions: {
        requiresAuth: true,
      },
      providesTags: (_result, _error, { conversationId }) => [
        { type: "Message", id: conversationId },
      ],
    }),

    // Send message (REST)
    sendMessage: builder.mutation<
      SendMessageResponse,
      SendMessageRequest
    >({
      query: (body) => ({
        url: "/messages",
        method: "POST",
        body,
      }),
      extraOptions: {
        requiresAuth: true,
      },

      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Message", id: conversationId },
        "Conversation",
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useLazyGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;