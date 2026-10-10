import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminServiceDetailActions } from "./AdminServiceDetailActions";
import { formatRupiah, formatTanggalWaktu } from "@/lib/utils";
import {
  ArrowLeft,
  Laptop,
  Smartphone,
  User,
  Wrench,
  Clock,
  CreditCard,
  FileText,
  Activity,
  CheckCircle2,
  Receipt,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function AdminServiceDetailPage({ params }: Props) {
  const [service, technicians] = await Promise.all([
    prisma.serviceRequest.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        technician: { include: { technicianProfile: true } },
        serviceType: true,
        diagnosis: true,
        costEstimates: { orderBy: { createdAt: "desc" } },
        repairLogs: { orderBy: { createdAt: "desc" } },
        statusHistories: {
          include: { actor: { select: { name: true, role: true } } },
          orderBy: { createdAt: "desc" },
        },
        payments: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIAN", isActive: true },
      include: { technicianProfile: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!service) notFound();

  const isPaid = service.payments.some((p) => p.paymentStatus === "PAID");
  const totalPaid = service.payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back button & Title header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/servis"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono tracking-tight text-slate-900">
                {service.serviceNumber}
              </h1>
              <StatusBadge status={service.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dibuat pada {formatTanggalWaktu(service.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Controls for Admin */}
        <AdminServiceDetailActions
          service={{
            id: service.id,
            serviceNumber: service.serviceNumber,
            status: service.status,
            technicianId: service.technicianId,
            estimatedCost: service.estimatedCost,
            finalCost: service.finalCost,
          }}
          technicians={technicians.map((t) => ({
            id: t.id,
            name: t.name,
            technicianProfile: t.technicianProfile
              ? { specialization: t.technicianProfile.specialization }
              : null,
          }))}
          isPaid={isPaid}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Perangkat, Keluhan, Diagnosis, & Log Perbaikan */}
        <div className="lg:col-span-8 space-y-6">
          {/* Informasi Perangkat & Kerusakan */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                {service.deviceType === "LAPTOP" ? (
                  <Laptop className="h-4 w-4 text-blue-600" />
                ) : (
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                )}
                Spesifikasi & Kondisi Perangkat
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Merek & Model
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {service.brand} {service.model}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Nomor Seri
                </span>
                <p className="font-mono text-slate-700 mt-0.5">
                  {service.serialNumber || "Tidak tertera"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Metode Penyerahan
                </span>
                <p className="font-medium text-slate-900 mt-0.5">
                  {service.handoverMethod === "DROP_OFF" ? "Antar Langsung (Workshop)" : "Dijemput / Ekspedisi"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="font-bold text-slate-800">Keluhan Kerusakan:</span>
                <p className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                  {service.complaint}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800">Kondisi Awal Fisik:</span>
                <p className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                  {service.initialCondition}
                </p>
              </div>
            </div>
          </Card>

          {/* Hasil Diagnosis Teknisi */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Hasil Pemeriksaan & Diagnosis Teknisi
              </CardTitle>
            </CardHeader>

            {service.diagnosis ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800">Ringkasan Masalah:</span>
                  <p className="mt-1 text-slate-700 font-medium">{service.diagnosis.summary}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-800">Temuan Kerusakan Mendalam:</span>
                  <p className="mt-1 text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {service.diagnosis.detailedFindings}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-800">Rekomendasi Tindakan:</span>
                  <p className="mt-1 text-slate-600 leading-relaxed bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-blue-900 font-medium">
                    {service.diagnosis.recommendedAction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Teknisi belum mengunggah hasil diagnosis resmi untuk unit ini.
              </div>
            )}
          </Card>

          {/* Log Pengerjaan Perbaikan */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-teal-600" />
                Riwayat Tindakan Perbaikan (Repair Logs)
              </CardTitle>
            </CardHeader>

            {service.repairLogs.length > 0 ? (
              <div className="space-y-3">
                {service.repairLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{formatTanggalWaktu(log.createdAt)}</span>
                    </div>
                    <p className="font-bold text-slate-900">{log.actionTaken}</p>
                    {log.partsReplaced && (
                      <p className="text-slate-600 mt-1">
                        <strong className="text-slate-700">Komponen Diganti:</strong> {log.partsReplaced}
                      </p>
                    )}
                    {log.notes && (
                      <p className="text-slate-500 mt-1 italic">
                        Catatan: {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada catatan log tindakan perbaikan.
              </div>
            )}
          </Card>

          {/* Audit Trail Histori Perubahan Status */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                Histori Perubahan Status & Audit Log
              </CardTitle>
            </CardHeader>

            <div className="space-y-4">
              {service.statusHistories.map((hist, idx) => (
                <div key={hist.id} className="relative flex items-start gap-3 pl-4 border-l-2 border-blue-500/30 pb-4 last:pb-0">
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-600" />
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{hist.toStatus}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatTanggalWaktu(hist.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{hist.notes || "-"}</p>
                    {hist.actor && (
                      <span className="text-[10px] text-slate-400 block">
                        Aktor: {hist.actor.name} ({hist.actor.role})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Customer, Teknisi, & Pembayaran */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Card */}
          <Card className="p-5 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <User className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Informasi Customer</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">Nama Lengkap</span>
                <p className="font-bold text-slate-900">{service.customer.name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Email</span>
                <p className="text-slate-700">{service.customer.email}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Nomor WhatsApp</span>
                <p className="text-slate-700 font-medium">{service.customer.phone || "-"}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Alamat</span>
                <p className="text-slate-600 leading-relaxed">{service.customer.address || "Tidak dicantumkan"}</p>
              </div>
            </div>
          </Card>

          {/* Teknisi Card */}
          <Card className="p-5 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Wrench className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Teknisi Bertanggung Jawab</h3>
            </div>
            {service.technician ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Nama Teknisi</span>
                  <p className="font-bold text-slate-900">{service.technician.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Spesialisasi</span>
                  <p className="text-slate-700">
                    {service.technician.technicianProfile?.specialization || "Umum"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Kontak</span>
                  <p className="text-slate-700">{service.technician.phone || "-"}</p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-200">
                Belum ada teknisi yang ditugaskan. Gunakan tombol aksi di atas untuk menugaskan.
              </div>
            )}
          </Card>

          {/* Status Pembayaran & Kasir */}
          <Card className="p-5 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Rincian Keuangan & Kasir</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estimasi Biaya:</span>
                <span className="font-semibold text-slate-800">
                  {service.estimatedCost ? formatRupiah(service.estimatedCost) : "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Biaya Akhir Disetujui:</span>
                <span className="font-bold text-slate-900">
                  {service.finalCost ? formatRupiah(service.finalCost) : "-"}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Status Pembayaran:</span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" />
                    Lunas ({formatRupiah(totalPaid)})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px]">
                    Belum Lunas
                  </span>
                )}
              </div>

              {service.payments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <span className="font-bold text-slate-800 block text-[11px]">Riwayat Transaksi:</span>
                  {service.payments.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                        <span>{p.receiptNumber || p.invoiceNumber}</span>
                        <span>{formatRupiah(p.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>Metode: {p.paymentMethod}</span>
                        <span>{formatTanggalWaktu(p.paidAt || p.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.paymentStatus === "PENDING_VERIFICATION"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {p.paymentStatus === "PAID"
                            ? "Lunas"
                            : p.paymentStatus === "PENDING_VERIFICATION"
                            ? "Menunggu Verifikasi"
                            : "Ditolak"}
                        </span>

                        {p.paymentStatus === "PAID" ? (
                          <Link
                            href={`/struk/${p.receiptNumber || p.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                          >
                            <Receipt className="h-3 w-3" />
                            Lihat Struk
                          </Link>
                        ) : p.paymentStatus === "PENDING_VERIFICATION" ? (
                          <Link
                            href="/admin/pembayaran"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline"
                          >
                            Verifikasi di Menu Pembayaran &rarr;
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
