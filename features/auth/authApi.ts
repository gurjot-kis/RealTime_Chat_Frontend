import { baseApi } from "@/store/api/baseApi";
import { ApiResponse, RegisterRequest, User } from "./authTypes";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<User>, RegisterRequest>({
      query: (body) => ({
        url: "/users/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
} = authApi;