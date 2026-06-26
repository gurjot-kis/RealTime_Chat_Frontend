"use client";

import { useRegisterMutation } from "@/features/auth/authApi";

export default function Home() {
  const [register] = useRegisterMutation();

  return (
    <div className="p-10">
      <h1>Redux RTK Query Connected Successfully 🚀</h1>
    </div>
  );
}