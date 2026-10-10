"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  assignTechnicianAction,
  updateServiceStatusByAdmin,
  recordPaymentAction,
} from "@/actions/admin";
import { toast } from "sonner";
import { UserCheck, RefreshCw, CreditCard, Ban } from "lucide-react";

interface AdminActionsProps {
  service: {
    id: string;
    serviceNumber: string;
    status: string;
    technicianId: string | null;
    estimatedCost: number | null;
    finalCost: number | null;
  };
  technicians: {
    id: string;
    name: string;
    technicianProfile: { specialization: string } | null;
  }[];
  isPaid: boolean;
}

export function AdminServiceDetailActions({
  service,
  technicians,
  isPaid,
}: AdminActionsProps) {
  const router = useRouter();

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedTech, setSelectedTech] = useState(service.technicianId || "");
  const [assignNotes, setAssignNotes] = useState("");

  const [newStatus, setNewStatus] = useState(service.status);
  const [statusNotes, setStatusNotes] = useState("");
  const [estCost, setEstCost] = useState(service.estimatedCost ? String(service.estimatedCost) : "");
  const [finalCost, setFinalCost] = useState(service.finalCost ? String(service.finalCost) : "");

  const [payAmount, setPayAmount] = useState(
    service.finalCost ? String(service.finalCost) : service.estimatedCost ? String(service.estimatedCost) : ""
  );
  const [payMethod, setPayMethod] = useState("CASH");
  const [payNotes, setPayNotes] = useState("Pembayaran diterima di kasir workshop");
  const [markCompleted, setMarkCompleted] = useState(true);

  // 1. Assign technician submit
  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("serviceRequestId", service.id);
    formData.append("technicianId", selectedTech);
    formData.append("notes", assignNotes);

    const res = await assignTechnicianAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menugaskan teknisi");
      return;
    }

    toast.success(res.message);
    setAssignModalOpen(false);
    router.refresh();
  }

  // 2. Status update submit
  async function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("serviceRequestId", service.id);
    formData.append("status", newStatus);
    formData.append("notes", statusNotes);
    if (estCost) formData.append("estimatedCost", estCost);
    if (finalCost) formData.append("finalCost", finalCost);

    const res = await updateServiceStatusByAdmin(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memperbarui status");
      return;
    }

    toast.success(res.message);
    setStatusModalOpen(false);
    router.refresh();
  }

  // 3. Payment submit
  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("serviceRequestId", service.id);
    formData.append("amount", payAmount);
    formData.append("paymentMethod", payMethod);
    formData.append("notes", payNotes);
    formData.append("markCompleted", String(markCompleted));

    const res = await recordPaymentAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mencatat pembayaran");
      return;
    }

    toast.success(res.message);
    setPaymentModalOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {/* Assign / Reassign Tech Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssignModalOpen(true)}
          className="gap-1.5 text-xs"
        >
          <UserCheck className="h-3.5 w-3.5 text-blue-600" />
          {service.technicianId ? "Ganti Teknisi" : "Tugaskan Teknisi"}
        </Button>

        {/* Update Status Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStatusModalOpen(true)}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-600" />
          Ubah Status Servis
        </Button>

        {/* Record Payment Button */}
        {!isPaid && service.status !== "CANCELLED" && (
          <Button
            size="sm"
            onClick={() => setPaymentModalOpen(true)}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Catat Pembayaran
          </Button>
        )}
      </div>

      {/* 1. MODAL TUGASKAN TEKNISI */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Penugasan Teknisi"
        description={`Tetapkan atau ganti teknisi untuk ${service.serviceNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Pilih Teknisi Workshop
            </label>
            <select
              required
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Pilih Teknisi --</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Spesialisasi: {t.technicianProfile?.specialization || "Umum"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Instruksi / Catatan untuk Teknisi
            </label>
            <textarea
              rows={3}
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              placeholder="Tambahkan arahan khusus pemeriksaan awal..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Simpan Penugasan
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. MODAL UBAH STATUS */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Pembaruan Status Servis"
        description={`Ubah status pengerjaan untuk ${service.serviceNumber}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Status Baru</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="PENDING">PENDING - Menunggu Pemeriksaan</option>
              <option value="ASSIGNED">ASSIGNED - Teknisi Ditugaskan</option>
              <option value="IN_DIAGNOSIS">IN_DIAGNOSIS - Sedang Diperiksa</option>
              <option value="WAITING_FOR_APPROVAL">WAITING_FOR_APPROVAL - Menunggu Persetujuan Customer</option>
              <option value="IN_REPAIR">IN_REPAIR - Sedang Diperbaiki</option>
              <option value="WAITING_FOR_PARTS">WAITING_FOR_PARTS - Menunggu Suku Cadang</option>
              <option value="REPAIR_COMPLETED">REPAIR_COMPLETED - Perbaikan Selesai (Menunggu QC)</option>
              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP - Siap Diambil di Counter</option>
              <option value="COMPLETED">COMPLETED - Servis Selesai & Ditutup</option>
              <option value="CANCELLED">CANCELLED - Servis Dibatalkan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Estimasi Biaya (Rp)</label>
              <input
                type="number"
                value={estCost}
                onChange={(e) => setEstCost(e.target.value)}
                placeholder="cth: 500000"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Biaya Akhir Disetujui (Rp)</label>
              <input
                type="number"
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                placeholder="cth: 500000"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Catatan Perubahan Status (Akan dicatat pada riwayat audit) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Berikan alasan perubahan status atau ringkasan tindakan..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStatusModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Perbarui Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. MODAL CATAT PEMBAYARAN */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Pencatatan Pembayaran Kasir"
        description={`Catat transaksi lunas untuk ${service.serviceNumber}`}
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Jumlah Pembayaran (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Metode Pembayaran</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="CASH">Tunai (Cash di Kasir)</option>
              <option value="TRANSFER">Transfer Bank</option>
              <option value="QRIS">QRIS / E-Wallet</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Catatan Kasir</label>
            <input
              type="text"
              value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="markCompleted"
              checked={markCompleted}
              onChange={(e) => setMarkCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="markCompleted" className="text-xs text-slate-700">
              Tandai status servis langsung menjadi <strong>COMPLETED (Selesai)</strong>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaymentModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              Konfirmasi & Cetak Kuitansi
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
