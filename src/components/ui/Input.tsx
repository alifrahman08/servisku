import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helper, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75 shadow-sm",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15",
            className
          )}
          {...props}
        />
        {helper && !error && <p className="text-[11px] text-slate-500">{helper}</p>}
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
