"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { decideCostEstimateAction } from "@/actions/customer";
import { formatTanggalWaktu, formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Wrench,
  AlertCircle,
  CreditCard,
  User,
  ShieldCheck,
  Check,
  XCircle,
} from "lucide-react";
import { CustomerPaymentSection } from "@/components/payment/CustomerPaymentSection";

interface Props {
  service: any | null;
  myServices: {
    id: string;
    serviceNumber: string;
    brand: string;
    model: string;
    status: string;
  }[];
  initialSearch: string;
  storeSettings?: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    qrisMerchantName: string;
    qrisImageUrl: string;
  };
}

const STAGES = [
  { id: 1, label: "Permintaan Dibuat", statusKey: "PENDING" },
  { id: 2, label: "Pemeriksaan Admin", statusKey: "ASSIGNED" },
  { id: 3, label: "Teknisi Ditugaskan", statusKey: "ASSIGNED" },
  { id: 4, label: "Diagnosis Perangkat", statusKey: "IN_DIAGNOSIS" },
  { id: 5, label: "Persetujuan Biaya", statusKey: "WAITING_FOR_APPROVAL" },
  { id: 6, label: "Proses Perbaikan", statusKey: "IN_REPAIR" },
  { id: 7, label: "Perbaikan Selesai (QC)", statusKey: "REPAIR_COMPLETED" },
  { id: 8, label: "Siap Diambil", statusKey: "READY_FOR_PICKUP" },
  { id: 9, label: "Servis Selesai", statusKey: "COMPLETED" },
];

function getStageIndex(status: string): number {
  switch (status) {
    case "PENDING":
      return 1;
    case "ASSIGNED":
      return 3;
    case "IN_DIAGNOSIS":
      return 4;
    case "WAITING_FOR_APPROVAL":
      return 5;
    case "IN_REPAIR":
    case "WAITING_FOR_PARTS":
      return 6;
    case "REPAIR_COMPLETED":
      return 7;
    case "READY_FOR_PICKUP":
      return 8;
    case "COMPLETED":
      return 9;
    case "CANCELLED":
      return -1;
    default:
      return 1;
  }
}

export function CustomerTrackingClient({
  service,
  myServices,
  initialSearch,
  storeSettings,
}: Props) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/customer/tracking?search=${encodeURIComponent(searchInput.trim())}`);
  }

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Data berhasil diperbarui dari database");
    }, 500);
  }

  async function handleConfirmDecision(e: React.FormEvent) {
    e.preventDefault();
    if (!service || !pendingEstimate) return;

    setIsSubmittingApproval(true);
    const formData = new FormData();
    formData.append("estimateId", pendingEstimate.id);
    formData.append("decision", approvalDecision);
    formData.append("customerNotes", customerNotes);

    const res = await decideCostEstimateAction(formData);
    setIsSubmittingApproval(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memproses persetujuan");
      return;
    }

    toast.success(res.message);
    setApprovalModalOpen(false);
    router.refresh();
  }

  // Active estimate awaiting approval
  const pendingEstimate = service?.costEstimates?.find(
    (e: any) => e.status === "PENDING"
  );

  const currentStage = service ? getStageIndex(service.status) : 0;
  const isCancelled = service?.status === "CANCELLED";
  const isPaid = service?.payments?.some((p: any) => p.paymentStatus === "PAID");
  const latestPayment = service?.payments?.[0];
  const paymentStatus = latestPayment ? latestPayment.paymentStatus : "UNPAID";

  return (
    <div className="space-y-6">
      {/* Search & Selector Bar */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Masukkan nomor tiket servis (cth: SRV-202610...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4 text-xs shrink-0">
              Cari Tiket
            </Button>
          </form>

          {/* Switcher among my services */}
          {myServices.length > 0 && (
            <div className="w-full sm:w-auto">
              <select
                value={service?.serviceNumber || ""}
                onChange={(e) => router.push(`/customer/tracking?search=${e.target.value}`)}
                className="w-full sm:w-64 h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">-- Pilih Dari Tiket Saya --</option>
                {myServices.map((s) => (
                  <option key={s.id} value={s.serviceNumber}>
                    {s.serviceNumber} ({s.brand} {s.model})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="h-10 px-3 text-xs shrink-0 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </Card>

      {!service ? (
        <Card className="p-12 text-center bg-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tiket Servis Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Periksa kembali nomor servis yang Anda masukkan atau pilih dari daftar tiket servis Anda di atas.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* NOTICE: WAITING FOR APPROVAL ACTION BANNER */}
          {service.status === "WAITING_FOR_APPROVAL" && pendingEstimate && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-orange-900">
                      Konfirmasi Persetujuan Biaya Perbaikan Diperlukan!
                    </h3>
                    <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                      Teknisi telah menyelesaikan diagnosis dan mengajukan rincian biaya perbaikan sebesar{" "}
                      <strong className="text-base text-slate-900">{formatRupiah(pendingEstimate.estimatedAmount)}</strong>.
                    </p>
                    {pendingEstimate.breakdown && (
                      <p className="text-xs text-slate-600 mt-1 bg-white/70 p-2.5 rounded-xl border border-orange-200/60 font-mono">
                        Rincian: {pendingEstimate.breakdown}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => {
                      setApprovalDecision("APPROVED");
                      setApprovalModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs shadow-sm"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Setujui Biaya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setApprovalDecision("REJECTED");
                      setApprovalModalOpen(true);
                    }}
                    className="text-xs border-orange-300 text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Tolak / Batalkan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* NOTICE: CANCELLED BANNER */}
          {isCancelled && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900">Tiket Servis Ini Telah Dibatalkan</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Alasan: {service.cancellationReason || "Dibatalkan atas permintaan customer / workshop."}
                </p>
              </div>
            </div>
          )}

          {/* UNIT OVERVIEW SUMMARY CARD */}
          <Card className="p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-mono text-slate-900">
                    {service.serviceNumber}
                  </h2>
                  <StatusBadge status={service.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unit Diterima Workshop: {formatTanggalWaktu(service.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {service.deviceType === "LAPTOP" ? (
                  <Laptop className="h-5 w-5 text-blue-600" />
                ) : (
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                )}
                <span className="font-bold text-slate-900 text-sm">
                  {service.brand} {service.model}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Teknisi Menangani
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {service.technician ? service.technician.name : "Sedang dijadwalkan"}
                </p>
                {service.technician && (
                  <span className="text-[10px] text-slate-500">
                    Spesialis {service.technician.technicianProfile?.specialization || "Umum"}
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Estimasi Biaya
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {service.estimatedCost ? formatRupiah(service.estimatedCost) : "Menunggu Diagnosis"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Biaya Akhir Disetujui
                </span>
                <p className="font-bold text-blue-600 mt-0.5">
                  {service.finalCost ? formatRupiah(service.finalCost) : "-"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Status Pembayaran
                </span>
                <p className="mt-0.5 font-bold">
                  {isPaid ? (
                    <span className="text-emerald-700">Lunas Terverifikasi</span>
                  ) : paymentStatus === "PENDING_VERIFICATION" ? (
                    <span className="text-amber-700">Menunggu Verifikasi</span>
                  ) : paymentStatus === "REJECTED" ? (
                    <span className="text-rose-700">Bukti Ditolak</span>
                  ) : (
                    <span className="text-slate-700">Belum Dibayar</span>
                  )}
                </p>
              </div>
            </div>
          </Card>

          {/* CUSTOMER PAYMENT SECTION (Bank Mandiri & QRIS) */}
          {storeSettings && !isCancelled && (service.finalCost || service.estimatedCost || service.payments?.length > 0) && (
            <CustomerPaymentSection
              service={service}
              storeSettings={storeSettings}
              onSuccess={() => router.refresh()}
            />
          )}

          {/* 9-STAGE TIMELINE TRACKER */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Timeline Tahapan Pengerjaan Servis
              </CardTitle>
            </CardHeader>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {STAGES.map((stage) => {
                const isPassed = !isCancelled && currentStage >= stage.id;
                const isCurrent = !isCancelled && currentStage === stage.id;

                return (
                  <div key={stage.id} className="relative flex items-start gap-4">
                    {/* Circle icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                        isCurrent
                          ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md"
                          : isPassed
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : stage.id}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            isCurrent
                              ? "text-blue-600"
                              : isPassed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {stage.label}
                        </h4>
                        {isCurrent && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 animate-pulse">
                            Tahap Berjalan
                          </span>
                        )}
                      </div>

                      {/* Timeline contextual notes based on stage */}
                      {isCurrent && (
                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 mt-1">
                          {stage.id === 1 && "Tiket telah dibuat. Menunggu verifikasi admin workshop."}
                          {stage.id === 3 && `Teknisi ${service.technician?.name || "workshop"} telah ditugaskan untuk menangani unit.`}
                          {stage.id === 4 && "Teknisi sedang melakukan pengujian tegangan jalur dan komponen hardware."}
                          {stage.id === 5 && "Teknisi menunggu konfirmasi persetujuan biaya dari Anda sebelum mengganti suku cadang."}
                          {stage.id === 6 && "Teknisi sedang melakukan proses reparasi dan perakitan komponen."}
                          {stage.id === 7 && "Perbaikan hardware selesai, unit melewati tahap stress testing 2 jam."}
                          {stage.id === 8 && "Unit telah lolos Quality Control dan dapat diambil di counter ServisKu."}
                          {stage.id === 9 && "Perangkat telah selesai diserahkan dan transaksi selesai."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* STATUS HISTORY AUDIT LOG */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
                Catatan Histori Resmi Workshop
              </CardTitle>
            </CardHeader>

            <div className="space-y-3">
              {service.statusHistories.map((h: any) => (
                <div key={h.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700">{h.toStatus}</span>
                    <span className="font-mono">{formatTanggalWaktu(h.createdAt)}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{h.notes || "-"}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR COST ESTIMATE */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title={
          approvalDecision === "APPROVED"
            ? "Konfirmasi Persetujuan Estimasi Biaya"
            : "Konfirmasi Penolakan Biaya / Pembatalan"
        }
        description={`Tiket Servis: ${service?.serviceNumber}`}
      >
        <form onSubmit={handleConfirmDecision} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {approvalDecision === "APPROVED"
              ? `Dengan menyetujui, teknisi akan segera melanjutkan proses perbaikan komponen sesuai estimasi ${formatRupiah(pendingEstimate?.estimatedAmount)}.`
              : "Jika Anda menolak estimasi biaya, tiket servis akan dibatalkan dan unit dapat diambil kembali di workshop."}
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Catatan untuk Teknisi (Opsional)
            </label>
            <textarea
              rows={3}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Tambahkan pesan atau instruksi tambahan jika ada..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setApprovalModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingApproval}
              className={approvalDecision === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
            >
              {approvalDecision === "APPROVED" ? "Ya, Saya Setuju" : "Konfirmasi Pembatalan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
