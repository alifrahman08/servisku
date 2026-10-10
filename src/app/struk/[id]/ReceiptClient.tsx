"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah, formatTanggalWaktu } from "@/lib/utils";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Laptop,
  Smartphone,
  Receipt,
  Download,
} from "lucide-react";

interface ReceiptClientProps {
  payment: any;
  service: any;
  storeSettings: any;
  verifierName: string;
  userRole: string;
}

export function ReceiptClient({
  payment,
  service,
  storeSettings,
  verifierName,
  userRole,
}: ReceiptClientProps) {
  const [layoutMode, setLayoutMode] = useState<"a4" | "thermal">("a4");

  const latestEstimate = service.costEstimates?.[service.costEstimates.length - 1];
  const latestRepair = service.repairLogs?.[service.repairLogs.length - 1];
  const diagnosis = service.diagnosis;

  const handlePrint = () => {
    window.print();
  };

  const backLink =
    userRole === "ADMIN"
      ? `/admin/servis/${service.id}`
      : userRole === "TECHNICIAN"
      ? `/teknisi/tugas/${service.id}`
      : `/customer/tracking?search=${service.serviceNumber}`;

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-4 print:p-0 print:bg-white text-slate-800">
      {/* ACTION BAR (Hidden in print) */}
      <div className="max-w-3xl mx-auto mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke{" "}
            {userRole === "ADMIN"
              ? "Detail Servis Admin"
              : userRole === "TECHNICIAN"
              ? "Detail Tugas Teknisi"
              : "Pelacakan Servis"}
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Format Layout Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setLayoutMode("a4")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  layoutMode === "a4"
                    ? "bg-white text-blue-600 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Format A4
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("thermal")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  layoutMode === "thermal"
                    ? "bg-white text-blue-600 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Struk Thermal (80mm)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Printer className="h-4 w-4" />
              Cetak Struk
            </button>
          </div>
        </div>
      </div>

      {/* RECEIPT CONTAINER */}
      <div
        className={`mx-auto bg-white transition-all ${
          layoutMode === "thermal"
            ? "max-w-[420px] p-6 shadow-md border border-slate-200 rounded-2xl font-mono print:max-w-full print:w-[80mm] print:p-2 print:border-none print:shadow-none"
            : "max-w-3xl p-8 sm:p-12 shadow-lg border border-slate-200 rounded-3xl print:max-w-none print:w-full print:p-6 print:border-none print:shadow-none"
        }`}
      >
        {/* ===================== A4 LAYOUT ===================== */}
        {layoutMode === "a4" ? (
          <div className="space-y-6">
            {/* STORE HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                    SK
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    {storeSettings.storeName}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                  {storeSettings.storeAddress}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                  <span>Telp: {storeSettings.storePhone}</span>
                  <span>Email: {storeSettings.storeEmail}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Lunas Terverifikasi
                </div>
                <h2 className="text-sm font-bold text-slate-700">STRUK PEMBAYARAN RESMI</h2>
                <p className="font-mono text-xs font-bold text-blue-600 mt-0.5">
                  {payment.receiptNumber || payment.invoiceNumber}
                </p>
              </div>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Nomor Servis
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {service.serviceNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Tanggal & Jam Bayar
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {formatTanggalWaktu(payment.paidAt || payment.updatedAt)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Metode Pembayaran
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {payment.paymentMethod === "TRANSFER"
                    ? `Transfer (${storeSettings.bankName})`
                    : payment.paymentMethod === "QRIS"
                    ? "QRIS Resmi"
                    : "Tunai (Kasir)"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Referensi Pembayaran
                </span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {payment.referenceNumber || payment.invoiceNumber}
                </span>
              </div>
            </div>

            {/* CUSTOMER & DEVICE INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Customer */}
              <div className="border border-slate-200 rounded-2xl p-4">
                <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 mb-2 uppercase tracking-wide">
                  Informasi Customer
                </h3>
                <dl className="space-y-1.5">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Nama Customer:</dt>
                    <dd className="font-bold text-slate-900">{service.customer?.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">No. Telepon:</dt>
                    <dd className="font-mono text-slate-700">{service.customer?.phone || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Email:</dt>
                    <dd className="text-slate-700">{service.customer?.email || "-"}</dd>
                  </div>
                  {service.customer?.address && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Alamat:</dt>
                      <dd className="text-slate-700 text-right max-w-[200px] truncate">
                        {service.customer.address}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Device */}
              <div className="border border-slate-200 rounded-2xl p-4">
                <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2 mb-2 uppercase tracking-wide flex items-center justify-between">
                  <span>Informasi Perangkat</span>
                  {service.deviceType === "LAPTOP" ? (
                    <Laptop className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Smartphone className="h-4 w-4 text-indigo-600" />
                  )}
                </h3>
                <dl className="space-y-1.5">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Tipe & Merek:</dt>
                    <dd className="font-bold text-slate-900">
                      {service.deviceType} — {service.brand} {service.model}
                    </dd>
                  </div>
                  {service.serialNumber && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Nomor Seri / IMEI:</dt>
                      <dd className="font-mono text-slate-700">{service.serialNumber}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Keluhan Awal:</dt>
                    <dd className="text-slate-700 text-right max-w-[200px] truncate">
                      {service.complaint}
                    </dd>
                  </div>
                  {diagnosis && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Diagnosa:</dt>
                      <dd className="text-slate-700 text-right max-w-[200px] truncate">
                        {diagnosis.summary}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* DETAILED COST BREAKDOWN TABLE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Deskripsi Tindakan & Suku Cadang</th>
                    <th className="py-2.5 px-4 text-center">Jenis</th>
                    <th className="py-2.5 px-4 text-right">Jumlah / Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Service type / Base */}
                  <tr>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">
                        {service.serviceType?.name || "Biaya Layanan & Pengerjaan Servis"}
                      </p>
                      {latestRepair?.actionTaken && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tindakan: {latestRepair.actionTaken}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">Jasa Servis</td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                      {formatRupiah(service.serviceType?.basePrice || payment.amount)}
                    </td>
                  </tr>

                  {/* Components or breakdown items if detailed */}
                  {latestEstimate?.breakdown && (
                    <tr>
                      <td className="py-3 px-4" colSpan={2}>
                        <p className="font-semibold text-slate-800">
                          Rincian Suku Cadang & Pengerjaan Tambahan
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {latestEstimate.breakdown}
                        </p>
                        {latestRepair?.partsReplaced && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            Part terpasang: {latestRepair.partsReplaced}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                        {formatRupiah(payment.amount - (service.serviceType?.basePrice || 0) > 0
                          ? payment.amount - (service.serviceType?.basePrice || 0)
                          : 0)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-800 text-xs font-bold">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-4 text-right uppercase">
                      Total Tagihan
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-900">
                      {formatRupiah(payment.amount)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-2 px-4 text-right uppercase text-emerald-700">
                      Total Telah Dibayar
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-emerald-700">
                      {formatRupiah(payment.amount)}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 text-sm">
                    <td colSpan={2} className="py-3 px-4 text-right uppercase">
                      Sisa Tagihan
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      Rp 0 (LUNAS)
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* FOOTER: VERIFICATION & WARRANTY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>Ketentuan Garansi Servis</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {storeSettings.warrantyTerms}
                </p>
                <p className="text-[10px] text-slate-400 italic">
                  * Garansi tidak berlaku untuk kelalaian penggunaan (terkena air, jatuh, segel toko rusak).
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end justify-center text-center sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Diverifikasi & Disahkan Oleh
                </span>
                <div className="h-12 flex items-center justify-center">
                  <span className="font-serif italic text-base text-slate-700 font-bold tracking-wider">
                    {verifierName}
                  </span>
                </div>
                <span className="font-bold text-slate-900 text-xs">{verifierName}</span>
                <span className="text-[10px] text-slate-500">
                  Staff Verifikasi Pembayaran — {storeSettings.storeName}
                </span>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              <p>Terima kasih telah mempercayakan perbaikan perangkat Anda pada {storeSettings.storeName}.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Dokumen ini merupakan struk bukti pelunasan transaksi digital resmi yang sah.
              </p>
            </div>
          </div>
        ) : (
          /* ===================== THERMAL 80MM LAYOUT ===================== */
          <div className="space-y-3 text-xs leading-tight">
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3">
              <h1 className="text-base font-black tracking-tight">{storeSettings.storeName}</h1>
              <p className="text-[10px] text-slate-600 mt-0.5">{storeSettings.storeAddress}</p>
              <p className="text-[10px] text-slate-600">Telp: {storeSettings.storePhone}</p>
              <div className="mt-2 font-bold uppercase text-[11px] tracking-wider">
                *** BUKTI PEMBAYARAN LUNAS ***
              </div>
            </div>

            {/* Metadata */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between">
                <span>No. Struk:</span>
                <span className="font-bold">{payment.receiptNumber || payment.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>No. Servis:</span>
                <span className="font-bold">{service.serviceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatTanggalWaktu(payment.paidAt || payment.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{service.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Perangkat:</span>
                <span>
                  {service.brand} {service.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span className="font-bold">
                  {payment.paymentMethod === "TRANSFER"
                    ? `Transfer (${storeSettings.bankName})`
                    : payment.paymentMethod === "QRIS"
                    ? "QRIS Resmi"
                    : "Tunai Kasir"}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="text-[11px] space-y-1.5 border-b border-dashed border-slate-400 pb-3">
              <div className="flex justify-between font-bold">
                <span>Layanan Servis</span>
                <span>{formatRupiah(payment.amount)}</span>
              </div>
              <p className="text-[10px] text-slate-600">
                {service.serviceType?.name || service.complaint}
              </p>
              {latestEstimate?.breakdown && (
                <p className="text-[10px] text-slate-500 italic">
                  Ket: {latestEstimate.breakdown}
                </p>
              )}
            </div>

            {/* Totals */}
            <div className="text-[11px] space-y-1 border-b border-dashed border-slate-400 pb-3 font-bold">
              <div className="flex justify-between">
                <span>TOTAL:</span>
                <span>{formatRupiah(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>BAYAR:</span>
                <span>{formatRupiah(payment.amount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>KEMBALI / SISA:</span>
                <span>Rp 0 (LUNAS)</span>
              </div>
            </div>

            {/* Warranty & Footer */}
            <div className="text-center text-[10px] space-y-1 pt-1">
              <p className="font-bold">GARANSI SERVIS TOKO</p>
              <p className="leading-snug text-slate-600">{storeSettings.warrantyTerms}</p>
              <div className="pt-2">
                <p>Kasir/Petugas: {verifierName}</p>
                <p className="font-bold mt-1">*** TERIMA KASIH ***</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRINT STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body {
                background-color: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              @page {
                margin: 10mm;
                size: ${layoutMode === "thermal" ? "80mm auto" : "A4 portrait"};
              }
            }
          `,
        }}
      />
    </div>
  );
}
