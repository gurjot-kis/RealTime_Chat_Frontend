"use client";

import React from "react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export default function Button({
  children,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}