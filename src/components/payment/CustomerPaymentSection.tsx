"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatRupiah, formatTanggalWaktu, getPaymentStatusBadge } from "@/lib/utils";
import { submitPaymentProofAction } from "@/actions/payment";
import { toast } from "sonner";
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Download,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface CustomerPaymentSectionProps {
  service: any;
  storeSettings: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    qrisMerchantName: string;
    qrisImageUrl: string;
  };
  onSuccess?: () => void;
}

export function CustomerPaymentSection({
  service,
  storeSettings,
  onSuccess,
}: CustomerPaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<"TRANSFER" | "QRIS">("TRANSFER");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const billAmount = service.finalCost || service.estimatedCost || 0;

  // Latest payment record
  const latestPayment = service.payments?.[0];
  const paymentStatus = latestPayment ? latestPayment.paymentStatus : "UNPAID";
  const isPaid = paymentStatus === "PAID";
  const isPendingVerification = paymentStatus === "PENDING_VERIFICATION";
  const isRejected = paymentStatus === "REJECTED";

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(storeSettings.bankAccountNumber);
      setCopiedAccount(true);
      toast.success("Nomor rekening Mandiri berhasil disalin ke clipboard!");
      setTimeout(() => setCopiedAccount(false), 2500);
    } catch {
      toast.error("Gagal menyalin nomor rekening");
    }
  };

  const handleCopyAmount = async () => {
    try {
      await navigator.clipboard.writeText(billAmount.toString());
      setCopiedAmount(true);
      toast.success("Nominal tagihan berhasil disalin!");
      setTimeout(() => setCopiedAmount(false), 2500);
    } catch {
      toast.error("Gagal menyalin nominal");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5 MB. Harap pilih file yang lebih kecil.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Harap pilih file JPG, JPEG, PNG, atau PDF.");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null); // PDF file
    }
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = storeSettings.qrisImageUrl || "/images/qris-merchant.png";
    link.download = `QRIS-ServisKu-${service.serviceNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Gambar QRIS berhasil diunduh");
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Harap pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("serviceRequestId", service.id);
    formData.append("paymentMethod", selectedMethod);
    formData.append("referenceNumber", referenceNumber);
    formData.append("notes", notes);
    formData.append("proof", selectedFile);

    const res = await submitPaymentProofAction(formData);
    setIsUploading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengunggah bukti pembayaran");
      return;
    }

    toast.success(res.message);
    setSelectedFile(null);
    setPreviewUrl(null);
    setReferenceNumber("");
    setNotes("");
    if (onSuccess) onSuccess();
  };

  const statusBadge = getPaymentStatusBadge(paymentStatus);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Pembayaran Tagihan Servis</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
            >
              {statusBadge.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tiket: <strong className="font-mono text-slate-700">{service.serviceNumber}</strong> —{" "}
            {service.brand} {service.model}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">
            Total Yang Harus Dibayar
          </span>
          <div className="flex items-center sm:justify-end gap-2 mt-0.5">
            <span className="text-xl font-black font-mono text-blue-600">
              {formatRupiah(billAmount)}
            </span>
            <button
              onClick={handleCopyAmount}
              title="Salin Nominal"
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
            >
              {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 1. STATE: PAID (LUNAS) */}
      {isPaid && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Pembayaran Terverifikasi LUNAS
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Pembayaran Anda telah diverifikasi dan dicatat pada{" "}
                  <strong>{formatTanggalWaktu(latestPayment?.paidAt)}</strong> via{" "}
                  <strong>{latestPayment?.paymentMethod}</strong>.
                </p>
                <p className="text-xs text-emerald-700 mt-1 font-mono">
                  No. Struk Resmi: <strong>{latestPayment?.receiptNumber || latestPayment?.invoiceNumber}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href={`/struk/${latestPayment?.receiptNumber || latestPayment?.id}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Receipt className="h-4 w-4" />
                Lihat & Cetak Struk
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATE: PENDING VERIFICATION */}
      {isPendingVerification && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Clock className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                Bukti Pembayaran Sedang Diverifikasi Admin
              </h4>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                Terima kasih! Bukti transfer Anda sebesar{" "}
                <strong>{formatRupiah(latestPayment?.amount || billAmount)}</strong> telah berhasil diunggah dan sedang dalam proses peninjauan oleh tim admin workshop.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-amber-800 font-mono">
                <span>Invoice: {latestPayment?.invoiceNumber}</span>
                {latestPayment?.referenceNumber && <span>Ref: {latestPayment.referenceNumber}</span>}
                {latestPayment?.proofUrl && (
                  <a
                    href={latestPayment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 underline font-sans font-semibold hover:text-blue-900"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Buka Bukti Unggahan
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STATE: REJECTED BANNER */}
      {isRejected && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-950">
                Bukti Pembayaran Ditolak Oleh Admin
              </h4>
              <p className="text-xs text-rose-800 mt-1">
                Alasan Penolakan:{" "}
                <span className="font-semibold text-rose-900 bg-rose-100/70 px-2 py-0.5 rounded-md border border-rose-200">
                  {latestPayment?.rejectionReason || "Bukti transfer tidak terbaca atau nominal tidak sesuai."}
                </span>
              </p>
              <p className="text-xs text-rose-700 mt-2">
                Silakan lakukan transfer ulang atau unggah kembali bukti pembayaran yang sah dan valid melalui formulir di bawah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT METHOD SELECTION & INSTRUCTIONS (Show if unpaid or rejected) */}
      {(!isPaid && !isPendingVerification) && (
        <div className="space-y-6">
          {/* METHOD TOGGLE BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod("TRANSFER")}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 transition text-xs font-bold ${
                selectedMethod === "TRANSFER"
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Transfer Bank Mandiri
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod("QRIS")}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 transition text-xs font-bold ${
                selectedMethod === "QRIS"
                  ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <QrCode className="h-4 w-4" />
              QRIS (DANA / E-Wallet)
            </button>
          </div>

          {/* METHOD DETAILS */}
          {selectedMethod === "TRANSFER" ? (
            /* ============= TRANSFER BANK MANDIRI ============= */
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100/80 pb-3">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  Rekening Resmi Workshop
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {storeSettings.bankName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Nama Bank
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {storeSettings.bankName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                    Atas Nama Rekening
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {storeSettings.bankAccountHolder}
                  </span>
                </div>

                <div className="sm:col-span-2 bg-white p-3.5 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Nomor Rekening
                    </span>
                    <span className="font-mono text-lg font-black text-slate-900 tracking-wider">
                      {storeSettings.bankAccountNumber}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    {copiedAccount ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedAccount ? "Tersalin!" : "Salin No. Rekening"}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100/80 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Petunjuk Transfer Bank:</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Buka aplikasi Mobile Banking (Livin by Mandiri atau bank lainnya) atau ATM.</li>
                  <li>Transfer tepat sejumlah <strong>{formatRupiah(billAmount)}</strong> ke rekening di atas.</li>
                  <li>Cantumkan nomor servis <strong>{service.serviceNumber}</strong> pada berita transfer jika memungkinkan.</li>
                  <li>Simpan bukti transfer berupa struk/tangkapan layar (screenshot), lalu unggah pada form di bawah.</li>
                </ol>
              </div>
            </div>
          ) : (
            /* ============= QRIS METHOD ============= */
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100/80 pb-3">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  QRIS Resmi Workshop
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  DANA / Semua E-Wallet
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* QR Image Container */}
                <div className="bg-white p-3 rounded-2xl border border-blue-200 shadow-sm shrink-0 text-center">
                  <div className="relative w-48 h-64 sm:w-52 sm:h-72 rounded-xl overflow-hidden bg-slate-100 mx-auto">
                    <img
                      src={storeSettings.qrisImageUrl || "/images/qris-merchant.png"}
                      alt="QRIS Merchant ServisKu"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="mt-2.5 inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh Gambar QRIS
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-3 text-xs flex-1">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Nama Merchant
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {storeSettings.qrisMerchantName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Nominal Pembayaran
                    </span>
                    <span className="font-bold font-mono text-blue-600 text-base mt-0.5 block">
                      {formatRupiah(billAmount)}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-xl border border-blue-100/80 text-[11px] text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">Petunjuk Pembayaran QRIS:</p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>Buka aplikasi <strong>DANA, GoPay, OVO, ShopeePay, Livin&apos; Mandiri, BCA</strong>, atau mobile banking apapun.</li>
                      <li>Pilih menu <strong>Scan / Bayar QR</strong> lalu scan kode QR di samping.</li>
                      <li>Masukkan nominal tepat sejumlah <strong>{formatRupiah(billAmount)}</strong>.</li>
                      <li>Selesaikan pembayaran dan simpan bukti tangkapan layar/struk transfer.</li>
                      <li>Unggah bukti pembayaran pada formulir verifikasi di bawah.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UPLOAD PROOF FORM */}
          <form onSubmit={handleSubmitProof} className="rounded-2xl border border-slate-200 p-5 bg-slate-50 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
              <UploadCloud className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Formulir Unggah Bukti Pembayaran
              </h4>
            </div>

            <div className="space-y-3">
              {/* File upload input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  File Bukti Transfer (JPG, JPEG, PNG, atau PDF — Maks 5 MB) *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-white transition cursor-pointer">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {previewUrl ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={previewUrl}
                            alt="Preview bukti transfer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <FileText className="h-10 w-10 text-rose-500" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {selectedFile.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Klik untuk ganti file
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-xs text-slate-500">
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        Klik atau seret file bukti transfer ke sini
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Format JPG, PNG, atau PDF hingga 5 MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference number and notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Referensi Transaksi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="cth: 20261011009182 atau no. mutasi"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Pembayaran (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="cth: Transfer dari rekening a/n Budi"
                    className="w-full h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[10px] text-slate-500 text-center sm:text-left">
                Setelah diunggah, pembayaran akan diverifikasi oleh Admin Workshop sebelum status berubah menjadi Lunas.
              </span>

              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 text-xs font-bold shadow-sm transition active:scale-95 shrink-0"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Mengunggah Bukti...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {selectedMethod === "TRANSFER" ? "Saya Sudah Transfer & Kirim Bukti" : "Saya Sudah Bayar QRIS & Kirim Bukti"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
