"use client";

import { ReactNode, useEffect } from "react";
import Cookies from "js-cookie";

import { useLazyGetProfileQuery } from "@/features/auth/authApi";
import { setCredentials, logout } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { connectSocket } from "@/services/socket";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) return;

        const response = await getProfile().unwrap();

        dispatch(
          setCredentials({
            user: response.data.userObj,
            token,
          }),
        );

        connectSocket(token)
      } catch (error) {
        Cookies.remove("token");
        dispatch(logout());
      }
    };

    restoreSession();
  }, [dispatch, getProfile]);

  return <>{children}</>;
}
