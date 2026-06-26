"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";

import { useRegisterMutation } from "@/features/auth/authApi";
import {
  registerSchema,
  RegisterFormData,
} from "@/features/auth/registerSchema";

export default function RegisterPage() {
  const router = useRouter();

  const [registerUser, { isLoading }] = useRegisterMutation();

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
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Register
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Select
            label="Gender"
            {...register("gender")}
            error={errors.gender?.message}
            options={[
              {
                label: "Male",
                value: "male",
              },
              {
                label: "Female",
                value: "female",
              },
            ]}
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter password"
            {...register("password")}
            error={errors.password?.message}
          />

          <Button
            type="submit"
            loading={isLoading}
          >
            Register
          </Button>
        </form>
      </div>
    </div>
  );
}