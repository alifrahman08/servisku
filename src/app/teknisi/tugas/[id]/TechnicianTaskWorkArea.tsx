"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  acceptTaskAction,
  submitDiagnosisAction,
  addRepairLogAction,
} from "@/actions/technician";
import { toast } from "sonner";
import {
  Play,
  FileCheck2,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  Package,
} from "lucide-react";

interface Props {
  service: {
    id: string;
    serviceNumber: string;
    status: string;
    diagnosis: any;
    estimatedCost: number | null;
  };
}

export function TechnicianTaskWorkArea({ service }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Diagnosis form states
  const [needsApproval, setNeedsApproval] = useState(false);
  const [estAmount, setEstAmount] = useState("");
  const [breakdown, setBreakdown] = useState("");

  // 1. Accept Task Action
  async function handleAcceptTask() {
    setIsLoading(true);
    const res = await acceptTaskAction(service.id);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menerima tugas");
      return;
    }

    toast.success(res.message);
    router.refresh();
  }

  // 2. Submit Diagnosis
  async function handleDiagnosisSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("serviceRequestId", service.id);
    formData.append("needsApproval", String(needsApproval));
    if (needsApproval && estAmount) {
      formData.append("estimatedAmount", estAmount);
      formData.append("breakdown", breakdown);
    }

    const res = await submitDiagnosisAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan diagnosis");
      return;
    }

    toast.success(res.message);
    router.refresh();
  }

  // 3. Add Repair Log / Complete Repair
  async function handleRepairLogSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("serviceRequestId", service.id);

    const res = await addRepairLogAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mencatat progres");
      return;
    }

    toast.success(res.message);
    router.refresh();
  }

  return (
    <Card className="p-6 bg-white border-blue-200/80 shadow-md">
      {/* 1. STATE: ASSIGNED (Belum diterima) */}
      {service.status === "ASSIGNED" && (
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Tugas Baru Siap Diperiksa
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Klik tombol di bawah untuk menerima tugas dan memulai proses pemeriksaan fisik serta diagnosis hardware/software.
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleAcceptTask}
            isLoading={isLoading}
            className="gap-2 shadow-md shadow-blue-500/25"
          >
            <Play className="h-4 w-4" />
            Terima Tugas & Mulai Diagnosis
          </Button>
        </div>
      )}

      {/* 2. STATE: IN_DIAGNOSIS (Pemeriksaan & Form Diagnosis) */}
      {service.status === "IN_DIAGNOSIS" && (
        <div className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-3 mb-0">
            <CardTitle className="text-sm flex items-center gap-2 text-indigo-700">
              <FileCheck2 className="h-4 w-4" />
              Formulir Hasil Pemeriksaan & Diagnosis
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Ringkasan Masalah Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="summary"
                required
                defaultValue={service.diagnosis?.summary || ""}
                placeholder="cth: Short circuit jalur mosfet 19V / LCD pecah bergaris"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Temuan Kerusakan Mendalam <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="detailedFindings"
                required
                rows={3}
                defaultValue={service.diagnosis?.detailedFindings || ""}
                placeholder="Hasil tes multimeter, tegangan standby, visual board, dsb..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Rekomendasi Tindakan Perbaikan <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="recommendedAction"
                required
                rows={2}
                defaultValue={service.diagnosis?.recommendedAction || ""}
                placeholder="Solder ulang IC charger, ganti modul display, repaste pasta pendingin..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Opsi Persetujuan Biaya Tambahan */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsApproval}
                  onChange={(e) => setNeedsApproval(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                Memerlukan Pergantian Komponen Berbayar & Persetujuan Biaya Customer
              </label>

              {needsApproval && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Estimasi Total Biaya (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required={needsApproval}
                      value={estAmount}
                      onChange={(e) => setEstAmount(e.target.value)}
                      placeholder="cth: 850000"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Rincian Biaya (Sparepart + Jasa)
                    </label>
                    <input
                      type="text"
                      value={breakdown}
                      onChange={(e) => setBreakdown(e.target.value)}
                      placeholder="cth: Layar LCD Rp 600.000, Jasa Pasang Rp 150.000"
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading} className="gap-2 text-xs">
                <Save className="h-4 w-4" />
                {needsApproval ? "Kirim Diagnosis & Minta Persetujuan Customer" : "Simpan Diagnosis & Mulai Perbaikan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 3. STATE: WAITING_FOR_APPROVAL */}
      {service.status === "WAITING_FOR_APPROVAL" && (
        <div className="space-y-3 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Menunggu Persetujuan Customer
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Estimasi biaya telah diajukan ke akun customer. Anda dapat melanjutkan proses pengerjaan begitu customer menyetujui di sistem.
          </p>
        </div>
      )}

      {/* 4. STATE: IN_REPAIR / WAITING_FOR_PARTS */}
      {(service.status === "IN_REPAIR" || service.status === "WAITING_FOR_PARTS") && (
        <div className="space-y-4">
          <CardHeader className="border-b border-slate-100 pb-3 mb-0">
            <CardTitle className="text-sm flex items-center gap-2 text-sky-700">
              <Wrench className="h-4 w-4" />
              Perbarui Progres & Log Pengerjaan Perbaikan
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleRepairLogSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Tindakan Perbaikan yang Dilakukan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="actionTaken"
                required
                placeholder="cth: Pemasangan modul IC display baru dan pengetesan tegangan"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Komponen / Suku Cadang yang Diganti
              </label>
              <input
                type="text"
                name="partsReplaced"
                placeholder="cth: Layar OLED Super Retina, Seal Perekat Original"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Catatan Tambahan</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Hasil stress testing, temperatur normal, fungsi touch screen responsif..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Pembaruan Status</label>
              <select
                name="statusUpdate"
                defaultValue="IN_REPAIR"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="IN_REPAIR">Tetap Sedang Diperbaiki (In Progress)</option>
                <option value="WAITING_FOR_PARTS">Menunggu Ketersediaan Sparepart</option>
                <option value="REPAIR_COMPLETED">
                  ★ Perbaikan Selesai (Serahkan ke Admin untuk QC & Pickup)
                </option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isLoading} className="gap-2 text-xs">
                <Save className="h-4 w-4" />
                Simpan Log & Perbarui Progres
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 5. STATE: REPAIR_COMPLETED / READY_FOR_PICKUP / COMPLETED */}
      {["REPAIR_COMPLETED", "READY_FOR_PICKUP", "COMPLETED"].includes(service.status) && (
        <div className="space-y-3 py-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Perbaikan Telah Anda Selesaikan
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Pekerjaan Anda pada unit ini telah ditandai selesai. Unit sekarang berada di tahap Quality Control atau kasir penyerahan perangkat.
          </p>
        </div>
      )}
    </Card>
  );
}
