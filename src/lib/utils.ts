import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return "-";
  }
}

export function formatTanggalWaktu(date: Date | string | null | undefined): string {
  if (!date) return "-";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(d);
  } catch {
    return "-";
  }
}

export function getStatusBadge(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case "PENDING":
      return {
        label: "Menunggu Pemeriksaan",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "ASSIGNED":
      return {
        label: "Teknisi Ditugaskan",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    case "IN_DIAGNOSIS":
      return {
        label: "Sedang Diperiksa",
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      };
    case "WAITING_FOR_APPROVAL":
      return {
        label: "Menunggu Persetujuan",
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
      };
    case "IN_REPAIR":
      return {
        label: "Sedang Diperbaiki",
        bg: "bg-sky-50",
        text: "text-sky-700",
        border: "border-sky-200",
      };
    case "WAITING_FOR_PARTS":
      return {
        label: "Menunggu Sparepart",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    case "REPAIR_COMPLETED":
      return {
        label: "Perbaikan Selesai",
        bg: "bg-teal-50",
        text: "text-teal-700",
        border: "border-teal-200",
      };
    case "READY_FOR_PICKUP":
      return {
        label: "Siap Diambil",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    case "COMPLETED":
      return {
        label: "Servis Selesai",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
      };
    case "CANCELLED":
      return {
        label: "Dibatalkan",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      };
    default:
      return {
        label: status,
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
      };
  }
}

export function getPaymentStatusBadge(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case "PAID":
      return {
        label: "Lunas",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    case "PENDING_VERIFICATION":
      return {
        label: "Menunggu Verifikasi",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    case "REJECTED":
      return {
        label: "Ditolak",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      };
    case "FAILED":
      return {
        label: "Gagal",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
      };
    case "REFUNDED":
      return {
        label: "Dikembalikan",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    case "UNPAID":
    default:
      return {
        label: "Belum Dibayar",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-200",
      };
  }
}
