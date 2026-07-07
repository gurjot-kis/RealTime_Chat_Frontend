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

import { useRegisterMutation, useUploadAvatarMutation } from "@/features/auth/authApi";
import {
  registerSchema,
  RegisterFormData,
} from "@/features/auth/registerSchema";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [registerUser, { isLoading }] = useRegisterMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      let avatarUrl = "";
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        const uploadRes = await uploadAvatar(formData).unwrap();
        if (uploadRes.success) {
          avatarUrl = uploadRes.data.avatarUrl;
        }
      }

      const response = await registerUser({
        ...data,
        avatar: avatarUrl || undefined,
      }).unwrap();

      toast.success(response.message);

      reset();
      setAvatarFile(null);
      setAvatarPreview(null);

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
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center space-y-2 pb-2">
            <div 
              onClick={() => document.getElementById("avatar-input")?.click()}
              className="group relative flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-blue-400 hover:bg-slate-100"
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-medium mt-1">Upload</span>
                </div>
              )}
              {/* Overlay on hover when preview exists */}
              {avatarPreview && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs font-semibold text-white">Change</span>
                </div>
              )}
            </div>
            <input 
              id="avatar-input"
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <span className="text-xs text-slate-500">Profile Picture (Optional)</span>
          </div>

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
