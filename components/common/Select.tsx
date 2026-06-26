"use client";

import React, { forwardRef } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: Option[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>

        <select
          ref={ref}
          {...props}
          className={`w-full rounded-lg border px-4 py-2 outline-none
            ${
              error
                ? "border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
        >
          <option value="">Select</option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;