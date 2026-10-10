"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createServiceByAdminAction } from "@/actions/admin";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { Laptop, Smartphone, Save } from "lucide-react";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface TechnicianItem {
  id: string;
  name: string;
  technicianProfile: { specialization: string } | null;
}

interface ServiceTypeItem {
  id: string;
  name: string;
  deviceType: string;
  basePrice: number;
}

export function AdminCreateServiceForm({
  customers,
  technicians,
  serviceCatalog,
}: {
  customers: CustomerItem[];
  technicians: TechnicianItem[];
  serviceCatalog: ServiceTypeItem[];
}) {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState<"LAPTOP" | "SMARTPHONE">("LAPTOP");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("deviceType", deviceType);

    const res = await createServiceByAdminAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal membuat servis");
      return;
    }

    toast.success(res.message);
    router.push(`/admin/servis/${res.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pilih Customer */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          Pilih Customer Terdaftar <span className="text-rose-500">*</span>
        </label>
        <select
          name="customerId"
          required
          className="w-full h-11 rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
        >
          <option value="">-- Pilih Customer --</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email}) {c.phone ? `- ${c.phone}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Pilihan Jenis Perangkat */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          Jenis Perangkat <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeviceType("LAPTOP")}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border font-semibold text-xs transition ${
              deviceType === "LAPTOP"
                ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Laptop</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceType("SMARTPHONE")}
            className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border font-semibold text-xs transition ${
              deviceType === "SMARTPHONE"
                ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Smartphone</span>
          </button>
        </div>
      </div>

      {/* Detail Perangkat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Merek Perangkat <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="brand"
            required
            placeholder="cth: Asus, Apple, Lenovo, Samsung"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Model / Seri <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="model"
            required
            placeholder="cth: ROG Strix G15, iPhone 13"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">Nomor Seri (Opsional)</label>
          <input
            type="text"
            name="serialNumber"
            placeholder="cth: SN-92182012"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Keluhan & Kondisi Fisik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Keluhan Kerusakan <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="complaint"
            required
            rows={3}
            placeholder="Jelaskan masalah, gejala, atau kronologi kerusakan yang dialami customer..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Kondisi Awal Perangkat <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="initialCondition"
            required
            rows={3}
            placeholder="Kondisi fisik saat diterima (cth: ada goresan di casing bawah, layar mulus, baut lengkap)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Katalog Layanan & Teknisi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">Paket Layanan Terkait</label>
          <select
            name="serviceTypeId"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="">-- Pilih Paket Layanan (Opsional) --</option>
            {serviceCatalog.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({formatRupiah(s.basePrice)})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">Langsung Tugaskan Teknisi</label>
          <select
            name="technicianId"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="">-- Belum Ditugaskan --</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (Spesialis: {t.technicianProfile?.specialization || "Umum"})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">Tingkat Prioritas</label>
          <select
            name="priority"
            defaultValue="NORMAL"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
          >
            <option value="NORMAL">Normal</option>
            <option value="HIGH">Tinggi (High)</option>
            <option value="URGENT">Mendesak (Urgent)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="text-xs"
        >
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading} className="gap-2 text-xs">
          <Save className="h-4 w-4" />
          Simpan & Terbitkan Nomor Tiket Servis
        </Button>
      </div>
    </form>
  );
}
