import Link from "next/link";
import { Wrench, Cpu } from "lucide-react";

export function BrandLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 focus:outline-none">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 transition group-hover:scale-105">
        <Wrench className="h-5 w-5 transform transition-transform group-hover:-rotate-12" />
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 ring-2 ring-white">
          <Cpu className="h-2.5 w-2.5 text-blue-400" />
        </span>
      </div>
      {!compact && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition">
            Servis<span className="text-blue-600">Ku</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 -mt-1">
            Laptop & HP Repair
          </span>
        </div>
      )}
    </Link>
  );
}
