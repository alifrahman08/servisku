import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 focus:ring-blue-500",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300",
      outline:
        "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm focus:ring-slate-300",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20 focus:ring-rose-500",
      ghost:
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 focus:ring-slate-300",
      link:
        "text-blue-600 underline-offset-4 hover:underline p-0 h-auto focus:ring-0",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
      md: "h-10 px-4 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
