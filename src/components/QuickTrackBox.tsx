"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";

export function QuickTrackBox() {
  const [serviceNumber, setServiceNumber] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceNumber.trim()) return;
    router.push(`/customer/tracking?search=${encodeURIComponent(serviceNumber.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-lg shadow-slate-200/50 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
    >
      <div className="flex items-center pl-3 pr-2 text-slate-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder="Masukkan nomor servis (cth: SRV-202610...)"
        value={serviceNumber}
        onChange={(e) => setServiceNumber(e.target.value)}
        className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      <Button type="submit" size="sm" className="shrink-0 gap-1 rounded-xl">
        <span>Lacak</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </form>
  );
}
