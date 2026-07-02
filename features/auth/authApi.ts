import { baseApi } from "@/store/api/baseApi";
import {
  ApiResponse,
  LoginData,
  LoginRequest,
  ProfileResponse,
  RegisterRequest,
  User,
} from "./authTypes";

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
    login: builder.mutation<ApiResponse<LoginData>, LoginRequest>({
      query: (body) => ({
        url: "/users/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    getProfile: builder.query<ApiResponse<ProfileResponse>, void>({
      query: () => ({
        url: "/users/profile-details",
        method: "GET",
      }),
      extraOptions: {
        requiresAuth: true,
      },
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useLazyGetProfileQuery } =
  authApi;
