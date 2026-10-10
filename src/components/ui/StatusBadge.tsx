import { getStatusBadge } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const badge = getStatusBadge(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        badge.bg,
        badge.text,
        badge.border,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {badge.label}
    </span>
  );
}
