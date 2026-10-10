import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatTanggalWaktu, formatRupiah } from "@/lib/utils";
import {
  ArrowLeft,
  Laptop,
  Smartphone,
  CheckCircle2,
  FileText,
  Wrench,
  CreditCard,
  Activity,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function CustomerRiwayatDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  const service = await prisma.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      technician: {
        select: {
          name: true,
          phone: true,
          technicianProfile: { select: { specialization: true } },
        },
      },
      serviceType: true,
      diagnosis: true,
      costEstimates: { orderBy: { createdAt: "desc" } },
      repairLogs: { orderBy: { createdAt: "desc" } },
      statusHistories: {
        include: { actor: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!service) notFound();

  // Strict IDOR protection: Verify customer owns this service record
  if (service.customerId !== user.id) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 mt-1">
          Anda tidak memiliki izin untuk melihat riwayat servis pelanggan lain.
        </p>
        <Link href="/customer/riwayat" className="mt-4 inline-block text-xs text-blue-600 font-semibold underline">
          Kembali ke Riwayat Saya
        </Link>
      </div>
    );
  }

  const isPaid = service.payments.some((p) => p.paymentStatus === "PAID");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/riwayat"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-slate-900">
                {service.serviceNumber}
              </h1>
              <StatusBadge status={service.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian Dokumen Servis & Garansi Toko Resmi
            </p>
          </div>
        </div>

        <Link href={`/customer/tracking?search=${service.serviceNumber}`}>
          <Button variant="outline" size="sm" className="text-xs">
            Buka Pelacakan Timeline
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Perangkat, Diagnosis, & Tindakan */}
        <div className="lg:col-span-8 space-y-6">
          {/* Info Unit */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                {service.deviceType === "LAPTOP" ? (
                  <Laptop className="h-4 w-4 text-blue-600" />
                ) : (
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                )}
                Informasi Unit Perangkat
              </CardTitle>
            </CardHeader>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Merek & Model
                </span>
                <p className="font-bold text-slate-900 mt-0.5">{service.brand} {service.model}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Nomor Seri / IMEI
                </span>
                <p className="font-mono text-slate-700 mt-0.5">{service.serialNumber || "-"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                  Waktu Pengerjaan
                </span>
                <p className="text-slate-700 mt-0.5">
                  {formatTanggalWaktu(service.createdAt)} - {formatTanggalWaktu(service.updatedAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-800">Keluhan Awal Customer:</span>
                <p className="mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                  {service.complaint}
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-800">Kondisi Awal Perangkat:</span>
                <p className="mt-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                  {service.initialCondition}
                </p>
              </div>
            </div>
          </Card>

          {/* Hasil Diagnosis */}
          {service.diagnosis && (
            <Card className="p-6 bg-white">
              <CardHeader className="border-b border-slate-100 pb-3 mb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Hasil Diagnosis Kerusakan
                </CardTitle>
              </CardHeader>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800">Ringkasan Masalah:</span>
                  <p className="mt-1 text-slate-700 font-medium">{service.diagnosis.summary}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-800">Detail Temuan:</span>
                  <p className="mt-1 text-slate-600 p-2.5 rounded-lg bg-slate-50 border border-slate-100 leading-relaxed">
                    {service.diagnosis.detailedFindings}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tindakan Perbaikan Yang Dilakukan */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-teal-600" />
                Tindakan Perbaikan & Komponen Terpasang
              </CardTitle>
            </CardHeader>

            {service.repairLogs.length > 0 ? (
              <div className="space-y-3">
                {service.repairLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <p className="font-bold text-slate-900">{log.actionTaken}</p>
                    {log.partsReplaced && (
                      <p className="text-slate-700 mt-1">
                        <strong>Komponen Diganti:</strong> {log.partsReplaced}
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
                Tidak ada data log tindakan khusus.
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Biaya, Pembayaran, Garansi */}
        <div className="lg:col-span-4 space-y-6">
          {/* Biaya & Pembayaran */}
          <Card className="p-5 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Rincian Biaya & Pembayaran</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi Awal:</span>
                <span className="text-slate-700">
                  {service.estimatedCost ? formatRupiah(service.estimatedCost) : "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Biaya Akhir Disetujui:</span>
                <span className="font-bold text-slate-900">
                  {service.finalCost ? formatRupiah(service.finalCost) : "-"}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-500">Status Pembayaran:</span>
                {isPaid ? (
                  <span className="font-bold text-emerald-700">LUNAS</span>
                ) : (
                  <span className="font-bold text-amber-700">BELUM LUNAS</span>
                )}
              </div>

              {service.payments.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-900 space-y-0.5">
                  <div className="flex justify-between font-mono font-bold">
                    <span>{p.invoiceNumber}</span>
                    <span>{formatRupiah(p.amount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 text-[10px]">
                    <span>Metode: {p.paymentMethod}</span>
                    <span>{formatTanggalWaktu(p.paidAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Garansi Toko ServisKu */}
          <Card className="p-5 bg-blue-50/50 border-blue-200">
            <div className="flex items-center gap-2 text-blue-900 mb-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h4 className="text-xs font-bold">Garansi Resmi Toko ServisKu</h4>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Perangkat ini dilindungi garansi servis dan suku cadang toko selama 30 - 90 hari terhitung sejak tanggal unit diambil. Tunjukkan nomor servis ini jika terjadi kendala serupa.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
