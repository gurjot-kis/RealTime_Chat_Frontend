"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { FiEye, FiEyeOff, FiUserPlus } from "react-icons/fi";

import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";

import { useRegisterMutation } from "@/features/auth/authApi";
import {
  registerSchema,
  RegisterFormData,
} from "@/features/auth/registerSchema";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [registerUser, { isLoading }] = useRegisterMutation();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerUser(data).unwrap();

      toast.success(response.message);

      reset();

      router.push("/login");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans selection:bg-blue-500 selection:text-white">
      {/* Decorative background shapes (optional but adds a premium feel) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[50vw] w-[50vw] rounded-full bg-blue-100/40 blur-3xl mix-blend-multiply" />
        <div className="absolute top-[20%] -right-[10%] h-[40vw] w-[40vw] rounded-full bg-indigo-100/40 blur-3xl mix-blend-multiply" />
      </div>

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 sm:p-10">
        {/* Header Section */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50">
            <FiUserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please enter your details to sign up and get started.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="e.g. Jane Doe"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Select
            label="Gender"
            {...register("gender")}
            error={errors.gender?.message}
            options={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Prefer not to say", value: "other" },
            ]}
          />

          <div className=" relative">
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Create a strong password"
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

          <div className="pt-2">
            <Button
              type="submit"
              loading={isLoading}
              // Assuming your Button component accepts className overrides for full width
              className="w-full flex justify-center py-3 text-sm font-semibold transition-all"
            >
              Register
            </Button>
          </div>
        </form>

        {/* Footer Section */}
        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-500 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
