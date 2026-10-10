import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm shadow-slate-200/40 transition-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-center justify-between gap-4", className)}>{children}</div>;
}

export function CardTitle({ className, children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-slate-900 tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-slate-500 mt-0.5", className)}>{children}</p>;
}
