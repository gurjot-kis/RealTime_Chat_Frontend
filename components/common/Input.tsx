"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>

        <input
          ref={ref}
          {...props}
          className={`w-full rounded-lg border px-4 py-2 outline-none transition
            ${
              error
                ? "border-red-500 focus:ring-2 focus:ring-red-300"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
            }
            ${className}`}
        />

        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;