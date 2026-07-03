"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

import { useLoginMutation } from "@/features/auth/authApi";
import { loginSchema, LoginFormData } from "@/features/auth/loginSchema";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";

import Cookies from "js-cookie";
import { setCredentials } from "@/features/auth/authSlice";
import { connectSocket } from "@/services/socket";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loginUser, { isLoading }] = useLoginMutation();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginUser(data).unwrap();

      Cookies.set("token", response.data.token, {
        expires: 7,
        sameSite: "strict",
      });

      dispatch(setCredentials(response.data));

      const socket = connectSocket(response.data.token);

      socket.on("connect", () => {
        console.log("✅ Socket Connected:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.log("❌ Socket Error:", err.message);
      });

      toast.success(response.message || "Welcome back!");

      reset();

      router.push("/chat/home");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Invalid credentials, please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans selection:bg-blue-500 selection:text-white">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[50vw] w-[50vw] rounded-full bg-blue-100/40 blur-3xl mix-blend-multiply" />
        <div className="absolute top-[20%] -right-[10%] h-[40vw] w-[40vw] rounded-full bg-indigo-100/40 blur-3xl mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 sm:p-10">
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50">
            <FiLogIn className="h-6 w-6 ml-1" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <div className="space-y-1">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                {...register("password")}
                error={errors.password?.message}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9.75 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5" />
                ) : (
                  <FiEye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              loading={isLoading}
              className="w-full flex justify-center py-3 text-sm font-semibold transition-all"
            >
              Sign In
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-500 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
