"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { formatRupiah, formatTanggalWaktu, getPaymentStatusBadge } from "@/lib/utils";
import {
  verifyPaymentAction,
  rejectPaymentAction,
  updateStorePaymentSettingsAction,
} from "@/actions/payment";
import { toast } from "sonner";
import {
  CreditCard,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Eye,
  ExternalLink,
  Settings,
  Banknote,
  AlertCircle,
  FileText,
  Filter,
  Check,
  RefreshCw,
} from "lucide-react";

interface AdminPaymentClientProps {
  initialPayments: any[];
  storeSettings: any;
  metrics: {
    totalRevenue: number;
    pendingCount: number;
    paidCount: number;
    rejectedCount: number;
    totalTransactions: number;
  };
}

export function AdminPaymentClient({
  initialPayments,
  storeSettings,
  metrics,
}: AdminPaymentClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"TRANSAKSI" | "PENGATURAN">("TRANSAKSI");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Proof Modal state
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [activeProof, setActiveProof] = useState<{
    url: string;
    invoice: string;
    amount: number;
    customerName: string;
    method: string;
  } | null>(null);

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPaymentForReject, setSelectedPaymentForReject] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Verify action state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Settings form state
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    storeName: storeSettings.storeName || "ServisKu Workshop",
    storeAddress: storeSettings.storeAddress || "Jl. Sudirman No. 45, Jakarta Pusat",
    storePhone: storeSettings.storePhone || "0812-3456-7890",
    storeEmail: storeSettings.storeEmail || "layanan@servisku.com",
    bankName: storeSettings.bankName || "Bank Mandiri",
    bankAccountNumber: storeSettings.bankAccountNumber || "1440028395116",
    bankAccountHolder: storeSettings.bankAccountHolder || "ALIF NOOR RAHMAN HAMID",
    qrisMerchantName: storeSettings.qrisMerchantName || "ServisKu / ALIF NOOR RAHMAN HAMID",
    qrisImageUrl: storeSettings.qrisImageUrl || "/images/qris-merchant.png",
    warrantyTerms:
      storeSettings.warrantyTerms ||
      "Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.",
  });

  // Filter payments
  const filteredPayments = initialPayments.filter((p) => {
    // Status filter
    if (statusFilter !== "ALL" && p.paymentStatus !== statusFilter) {
      return false;
    }
    // Method filter
    if (methodFilter !== "ALL" && p.paymentMethod !== methodFilter) {
      return false;
    }
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchInvoice = p.invoiceNumber?.toLowerCase().includes(q);
      const matchReceipt = p.receiptNumber?.toLowerCase().includes(q);
      const matchService = p.serviceRequest?.serviceNumber?.toLowerCase().includes(q);
      const matchCustomer = p.serviceRequest?.customer?.name?.toLowerCase().includes(q);
      const matchPhone = p.serviceRequest?.customer?.phone?.toLowerCase().includes(q);
      const matchRef = p.referenceNumber?.toLowerCase().includes(q);
      return matchInvoice || matchReceipt || matchService || matchCustomer || matchPhone || matchRef;
    }
    return true;
  });

  const handleVerifyPayment = async (paymentId: string) => {
    setVerifyingId(paymentId);
    const res = await verifyPaymentAction({ paymentId });
    setVerifyingId(null);

    if (!res.success) {
      toast.error(res.error || "Gagal memverifikasi pembayaran");
      return;
    }

    toast.success(res.message);
    router.refresh();
  };

  const handleOpenRejectModal = (payment: any) => {
    setSelectedPaymentForReject(payment);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForReject) return;

    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toast.error("Harap isi alasan penolakan secara jelas (minimal 5 karakter)");
      return;
    }

    setIsSubmittingReject(true);
    const formData = new FormData();
    formData.append("paymentId", selectedPaymentForReject.id);
    formData.append("reason", rejectionReason.trim());

    const res = await rejectPaymentAction(formData);
    setIsSubmittingReject(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menolak pembayaran");
      return;
    }

    toast.success(res.message);
    setRejectModalOpen(false);
    setSelectedPaymentForReject(null);
    router.refresh();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    const formData = new FormData();
    formData.append("storeName", settingsForm.storeName);
    formData.append("storeAddress", settingsForm.storeAddress);
    formData.append("storePhone", settingsForm.storePhone);
    formData.append("storeEmail", settingsForm.storeEmail);
    formData.append("bankName", settingsForm.bankName);
    formData.append("bankAccountNumber", settingsForm.bankAccountNumber);
    formData.append("bankAccountHolder", settingsForm.bankAccountHolder);
    formData.append("qrisMerchantName", settingsForm.qrisMerchantName);
    formData.append("qrisImageUrl", settingsForm.qrisImageUrl);
    formData.append("warrantyTerms", settingsForm.warrantyTerms);

    const res = await updateStorePaymentSettingsAction(formData);
    setIsSavingSettings(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menyimpan pengaturan");
      return;
    }

    toast.success(res.message);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Penerimaan
              </p>
              <h3 className="text-lg font-black font-mono text-slate-900 mt-0.5">
                {formatRupiah(metrics.totalRevenue)}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Menunggu Verifikasi
              </p>
              <h3 className="text-lg font-black text-amber-700 mt-0.5">
                {metrics.pendingCount} Transaksi
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Lunas Terverifikasi
              </p>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {metrics.paidCount} Transaksi
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Bukti Ditolak
              </p>
              <h3 className="text-lg font-black text-rose-700 mt-0.5">
                {metrics.rejectedCount} Transaksi
              </h3>
            </div>
          </div>
        </Card>
      </div>

      {/* TOP TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("TRANSAKSI")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "TRANSAKSI"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Daftar Transaksi Pembayaran
          {metrics.pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              {metrics.pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PENGATURAN")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "PENGATURAN"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Settings className="h-4 w-4" />
          Pengaturan Bank Mandiri & QRIS
        </button>
      </div>

      {/* TAB 1: TRANSAKSI */}
      {activeTab === "TRANSAKSI" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS BAR */}
          <Card className="p-4 bg-white">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Cari no. struk, invoice, no. servis, nama customer, atau ref..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>

              {/* Status Filter */}
              <div className="w-full md:w-auto shrink-0 flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING_VERIFICATION">Menunggu Verifikasi</option>
                  <option value="PAID">Lunas</option>
                  <option value="REJECTED">Ditolak</option>
                </select>

                {/* Method Filter */}
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="ALL">Semua Metode</option>
                  <option value="TRANSFER">Transfer Mandiri</option>
                  <option value="QRIS">QRIS</option>
                  <option value="CASH">Tunai (Kasir)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* TABLE OF PAYMENTS */}
          <Card className="p-0 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">No. Transaksi / Struk</th>
                    <th className="py-3 px-4">Tiket Servis</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Metode & Waktu</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Bukti Transfer</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        Tidak ada transaksi pembayaran yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const badge = getPaymentStatusBadge(p.paymentStatus);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          {/* Invoice & Receipt */}
                          <td className="py-3.5 px-4 font-mono">
                            <span className="font-bold text-slate-900 block">{p.invoiceNumber}</span>
                            {p.receiptNumber && (
                              <span className="text-[10px] text-blue-600 font-bold block mt-0.5">
                                {p.receiptNumber}
                              </span>
                            )}
                          </td>

                          {/* Service Request Link */}
                          <td className="py-3.5 px-4">
                            <Link
                              href={`/admin/servis/${p.serviceRequestId}`}
                              className="font-mono font-bold text-blue-600 hover:underline block"
                            >
                              {p.serviceRequest?.serviceNumber}
                            </Link>
                            <span className="text-[11px] text-slate-500 block">
                              {p.serviceRequest?.brand} {p.serviceRequest?.model}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">
                              {p.serviceRequest?.customer?.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {p.serviceRequest?.customer?.phone || "-"}
                            </span>
                          </td>

                          {/* Method & PaidAt */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 block">
                              {p.paymentMethod === "TRANSFER"
                                ? "Transfer Mandiri"
                                : p.paymentMethod === "QRIS"
                                ? "QRIS DANA"
                                : "Tunai (Kasir)"}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {formatTanggalWaktu(p.paidAt || p.createdAt)}
                            </span>
                            {p.referenceNumber && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                Ref: {p.referenceNumber}
                              </span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                            {formatRupiah(p.amount)}
                          </td>

                          {/* Proof of Transfer Link / Thumbnail */}
                          <td className="py-3.5 px-4">
                            {p.proofUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveProof({
                                    url: p.proofUrl,
                                    invoice: p.invoiceNumber,
                                    amount: p.amount,
                                    customerName: p.serviceRequest?.customer?.name,
                                    method: p.paymentMethod,
                                  });
                                  setProofModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                              >
                                <Eye className="h-3 w-3" />
                                Lihat Bukti
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Tanpa File
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                            {p.rejectionReason && (
                              <p className="text-[10px] text-rose-600 mt-1 max-w-[150px] truncate" title={p.rejectionReason}>
                                Ket: {p.rejectionReason}
                              </p>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Pending Verification -> Verify or Reject */}
                              {p.paymentStatus === "PENDING_VERIFICATION" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerifyPayment(p.id)}
                                    isLoading={verifyingId === p.id}
                                    className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                  >
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                    Verifikasi
                                  </Button>

                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenRejectModal(p)}
                                    className="h-8 px-2 text-xs border-rose-200 text-rose-700 hover:bg-rose-50"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                    Tolak
                                  </Button>
                                </>
                              )}

                              {/* Paid -> Print Receipt */}
                              {p.paymentStatus === "PAID" && (
                                <Link
                                  href={`/struk/${p.receiptNumber || p.id}`}
                                  target="_blank"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2.5 text-xs text-blue-700 hover:bg-blue-50 border-blue-200 font-bold"
                                  >
                                    <Receipt className="h-3 w-3 mr-1" />
                                    Struk
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: PENGATURAN REKENING & QRIS */}
      {activeTab === "PENGATURAN" && (
        <Card className="p-6 bg-white max-w-3xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-6">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              Konfigurasi Rekening Bank, QRIS, & Identitas Struk
            </CardTitle>
          </CardHeader>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. BANK MANDIRI SETTINGS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Informasi Rekening Bank Transfer (Mandiri)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Bank *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Rekening *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bankAccountNumber}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bankAccountNumber: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Pemilik Rekening *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bankAccountHolder}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, bankAccountHolder: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 2. QRIS SETTINGS */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <QrCode className="h-4 w-4 text-emerald-600" />
                Informasi QRIS Resmi Merchant
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Merchant QRIS *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.qrisMerchantName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, qrisMerchantName: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Path Gambar QRIS</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.qrisImageUrl}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, qrisImageUrl: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* QR Preview */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-16 h-20 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={settingsForm.qrisImageUrl || "/images/qris-merchant.png"}
                    alt="Preview QRIS"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Status QRIS: Aktif</span>
                  <span className="text-[11px] text-slate-500">
                    File gambar QR tersimpan di direktori publik server dan langsung dapat dipindai oleh customer.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. STORE & RECEIPT INFO */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-100 pb-2">
                <Receipt className="h-4 w-4 text-indigo-600" />
                Identitas Toko Pada Header Struk
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Toko / Workshop</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeName: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storePhone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storePhone: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Layanan</label>
                  <input
                    type="email"
                    required
                    value={settingsForm.storeEmail}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeEmail: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Alamat Workshop</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeAddress}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeAddress: e.target.value })
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Ketentuan Garansi Pada Struk
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.warrantyTerms}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, warrantyTerms: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                size="sm"
                isLoading={isSavingSettings}
                className="bg-blue-600 hover:bg-blue-700 text-xs font-bold px-6"
              >
                Simpan Perubahan Pengaturan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* MODAL 1: VIEW PROOF OF PAYMENT */}
      <Modal
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        title="Pemeriksaan Bukti Pembayaran Customer"
        description={activeProof ? `Invoice: ${activeProof.invoice} — ${activeProof.customerName}` : ""}
      >
        {activeProof && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span>
                Nominal Tagihan: <strong className="font-mono">{formatRupiah(activeProof.amount)}</strong>
              </span>
              <span>
                Metode: <strong>{activeProof.method}</strong>
              </span>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-2 flex items-center justify-center">
              {activeProof.url.endsWith(".pdf") ? (
                <div className="p-8 text-center space-y-3">
                  <FileText className="h-16 w-16 text-rose-500 mx-auto" />
                  <p className="text-xs text-slate-600">Dokumen bukti transfer berupa file PDF.</p>
                  <a
                    href={activeProof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka File PDF di Tab Baru
                  </a>
                </div>
              ) : (
                <img
                  src={activeProof.url}
                  alt="Bukti Transfer"
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <a
                href={activeProof.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Buka Ukuran Asli
              </a>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setProofModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: REJECT PAYMENT WITH REASON */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Tolak Bukti Pembayaran"
        description={
          selectedPaymentForReject
            ? `Tiket Servis: ${selectedPaymentForReject.serviceRequest?.serviceNumber} (${formatRupiah(selectedPaymentForReject.amount)})`
            : ""
        }
      >
        <form onSubmit={handleSubmitReject} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Harap tuliskan alasan penolakan dengan jelas. Customer akan menerima notifikasi dan dapat membaca alasan ini untuk mengunggah bukti pembayaran baru.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Alasan Penolakan (Wajib Diisi) *
            </label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="cth: Bukti transfer buram / nominal tidak sesuai / dana belum masuk ke mutasi Mandiri..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingReject}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              Konfirmasi Tolak Pembayaran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
