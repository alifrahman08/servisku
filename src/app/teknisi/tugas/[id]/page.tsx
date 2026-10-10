import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TechnicianTaskWorkArea } from "./TechnicianTaskWorkArea";
import { formatTanggalWaktu, formatRupiah } from "@/lib/utils";
import {
  ArrowLeft,
  Laptop,
  Smartphone,
  User,
  Clock,
  Wrench,
  FileText,
  Activity,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function TechnicianTaskDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TECHNICIAN") redirect("/login");

  const service = await prisma.serviceRequest.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      serviceType: true,
      diagnosis: true,
      costEstimates: { orderBy: { createdAt: "desc" } },
      repairLogs: { orderBy: { createdAt: "desc" } },
      statusHistories: {
        include: { actor: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!service) notFound();

  // Strict RBAC: Technician can only access their assigned tasks
  if (service.technicianId !== user.id) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Akses Ditolak</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tiket perbaikan ini tidak ditugaskan kepada Anda.
        </p>
        <Link href="/teknisi/tugas" className="mt-4 inline-block text-xs text-blue-600 font-semibold underline">
          Kembali ke Daftar Tugas Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/teknisi/tugas"
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
              {service.brand} {service.model} • Masuk {formatTanggalWaktu(service.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE WORKBENCH ACTION CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Workbench Controls (Accept, Diagnosis, Repair Logs) */}
          <TechnicianTaskWorkArea
            service={{
              id: service.id,
              serviceNumber: service.serviceNumber,
              status: service.status,
              diagnosis: service.diagnosis,
              estimatedCost: service.estimatedCost,
            }}
          />

          {/* Log Pengerjaan Perbaikan Sebelumnya */}
          <Card className="p-6 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-teal-600" />
                Catatan Log Tindakan Pengerjaan Anda
              </CardTitle>
            </CardHeader>

            {service.repairLogs.length > 0 ? (
              <div className="space-y-3">
                {service.repairLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                    <span className="text-[10px] text-slate-400 block mb-1">
                      {formatTanggalWaktu(log.createdAt)}
                    </span>
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
                Belum ada tindakan perbaikan yang dicatat.
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: DETAIL PERANGKAT & CUSTOMER */}
        <div className="lg:col-span-5 space-y-6">
          {/* Spesifikasi Unit */}
          <Card className="p-5 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              {service.deviceType === "LAPTOP" ? (
                <Laptop className="h-4 w-4 text-blue-600" />
              ) : (
                <Smartphone className="h-4 w-4 text-indigo-600" />
              )}
              <h3 className="text-xs font-bold text-slate-900">Detail Unit Perangkat</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Merek / Seri:</span>
                <span className="font-bold text-slate-900">{service.brand} {service.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor Seri:</span>
                <span className="font-mono text-slate-700">{service.serialNumber || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode:</span>
                <span className="font-medium text-slate-800">
                  {service.handoverMethod === "DROP_OFF" ? "Antar Langsung" : "Dijemput"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-semibold block mb-1">Keluhan:</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                  {service.complaint}
                </p>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 font-semibold block mb-1">Kondisi Awal:</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                  {service.initialCondition}
                </p>
              </div>
            </div>
          </Card>

          {/* Info Customer */}
          <Card className="p-5 bg-white">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">Kontak Customer</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-900">{service.customer.name}</p>
              <p className="text-slate-600">{service.customer.phone || "-"}</p>
              <p className="text-slate-400 text-[11px]">{service.customer.email}</p>
            </div>
          </Card>

          {/* Histori Persetujuan Biaya */}
          {service.costEstimates.length > 0 && (
            <Card className="p-5 bg-white">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Status Persetujuan Biaya</h3>
              </div>
              <div className="space-y-3 text-xs">
                {service.costEstimates.map((est) => (
                  <div key={est.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{formatRupiah(est.estimatedAmount)}</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          est.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : est.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {est.status === "APPROVED"
                          ? "Disetujui"
                          : est.status === "REJECTED"
                          ? "Ditolak"
                          : "Menunggu Customer"}
                      </span>
                    </div>
                    {est.breakdown && (
                      <p className="text-slate-600 mt-1 text-[11px]">{est.breakdown}</p>
                    )}
                    {est.customerNotes && (
                      <p className="text-slate-500 mt-1 italic text-[11px]">
                        Catatan Customer: {est.customerNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
