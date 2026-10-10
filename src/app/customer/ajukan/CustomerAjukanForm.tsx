"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createServiceRequestAction } from "@/actions/customer";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { Laptop, Smartphone, Send, ShieldAlert } from "lucide-react";

interface ServiceTypeItem {
  id: string;
  name: string;
  deviceType: string;
  basePrice: number;
  estimatedDuration: string;
}

interface Props {
  serviceCatalog: ServiceTypeItem[];
  preselectedServiceId?: string;
  userAddress: string;
}

export function CustomerAjukanForm({
  serviceCatalog,
  preselectedServiceId,
  userAddress,
}: Props) {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState<"LAPTOP" | "SMARTPHONE">("LAPTOP");
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || "");
  const [handoverMethod, setHandoverMethod] = useState("DROP_OFF");
  const [isLoading, setIsLoading] = useState(false);

  // Selected service item estimate
  const selectedService = serviceCatalog.find((s) => s.id === selectedServiceId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("deviceType", deviceType);
    formData.set("handoverMethod", handoverMethod);

    const res = await createServiceRequestAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengajukan servis");
      return;
    }

    toast.success(res.message);
    router.push(`/customer/tracking?search=${res.serviceNumber}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. PILIH JENIS PERANGKAT */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          Jenis Perangkat yang Ingin Diservis <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeviceType("LAPTOP")}
            className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border font-bold text-xs transition ${
              deviceType === "LAPTOP"
                ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Laptop className="h-5 w-5" />
            <span>Laptop / Komputer</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceType("SMARTPHONE")}
            className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border font-bold text-xs transition ${
              deviceType === "SMARTPHONE"
                ? "border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Smartphone className="h-5 w-5" />
            <span>Smartphone (HP)</span>
          </button>
        </div>
      </div>

      {/* 2. SPESIFIKASI PERANGKAT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Merek Perangkat <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="brand"
            required
            placeholder="cth: Asus, Lenovo, Apple, Samsung"
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
          <label className="block text-xs font-bold text-slate-800">
            Nomor Seri (Serial Number / IMEI)
          </label>
          <input
            type="text"
            name="serialNumber"
            placeholder="Opsional (lihat stiker unit)"
            className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 3. KELUHAN & KONDISI AWAL */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Keluhan Kerusakan / Masalah yang Dialami <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="complaint"
            required
            rows={3}
            placeholder="Jelaskan secara detail apa yang terjadi (cth: layar tiba-tiba blank setelah jatuh, baterai drop dari 80% ke 10%, dsb)..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Kondisi Awal Fisik Perangkat Saat Ini <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="initialCondition"
            required
            rows={2}
            placeholder="cth: Kaca depan retak tipis di sudut, lampu indikator charger masih nyala, tombol power agak keras..."
            className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* 4. PILIHAN LAYANAN KATALOG (OPSIONAL) */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800">
          Pilihan Paket Layanan (Opsional)
        </label>
        <select
          name="serviceTypeId"
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">-- Diagnosis Mandiri / Belum Tahu Pasti --</option>
          {serviceCatalog.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({formatRupiah(s.basePrice)} • Est: {s.estimatedDuration})
            </option>
          ))}
        </select>
      </div>

      {/* ESTIMASI BIAYA & TRANSPARANSI NOTICE */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-2">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-900 block mb-0.5">
              Transparansi Biaya ServisKu:
            </span>
            {selectedService ? (
              <p>
                Estimasi tarif awal paket yang Anda pilih:{" "}
                <strong className="text-blue-700">{formatRupiah(selectedService.basePrice)}</strong>.
                Angka ini merupakan estimasi awal. Teknisi akan memeriksa komponen secara mendalam dan
                biaya akhir tidak akan ditagihkan sebelum Anda memberikan persetujuan resmi.
              </p>
            ) : (
              <p>
                Biaya awal belum ditentukan. Teknisi workshop akan melakukan diagnosis gratis terlebih
                dahulu dan mengirimkan rincian estimasi biaya ke dashboard Anda untuk disetujui.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5. METODE PENYERAHAN */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800">
          Metode Penyerahan Unit <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setHandoverMethod("DROP_OFF")}
            className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
              handoverMethod === "DROP_OFF"
                ? "border-blue-600 bg-blue-50/70 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Antar Langsung ke Counter Workshop
          </button>
          <button
            type="button"
            onClick={() => setHandoverMethod("PICKUP")}
            className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
              handoverMethod === "PICKUP"
                ? "border-blue-600 bg-blue-50/70 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Kirim Ekspedisi / Kurir
          </button>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          className="w-full sm:w-auto gap-2 shadow-md shadow-blue-500/20"
        >
          <Send className="h-4 w-4" />
          Kirim Pengajuan Servis Sekarang
        </Button>
      </div>
    </form>
  );
}
