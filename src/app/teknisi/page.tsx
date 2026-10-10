import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTanggal, formatRupiah } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Laptop,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeknisiOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TECHNICIAN") redirect("/login");

  // Query tasks strictly for this technician
  const [activeTasks, assignedTasks, inRepairTasks, completedTasks, recentTasks] =
    await Promise.all([
      prisma.serviceRequest.count({
        where: {
          technicianId: user.id,
          status: { in: ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "WAITING_FOR_PARTS"] },
          isCancelled: false,
        },
      }),
      prisma.serviceRequest.count({
        where: { technicianId: user.id, status: "ASSIGNED", isCancelled: false },
      }),
      prisma.serviceRequest.count({
        where: { technicianId: user.id, status: "IN_REPAIR", isCancelled: false },
      }),
      prisma.serviceRequest.count({
        where: { technicianId: user.id, status: { in: ["REPAIR_COMPLETED", "READY_FOR_PICKUP", "COMPLETED"] } },
      }),
      prisma.serviceRequest.findMany({
        where: { technicianId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          customer: { select: { name: true, phone: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workbench Teknisi — {user.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola antrean diagnosis perangkat, perbaikan hardware, dan pencatatan log suku cadang
          </p>
        </div>

        <Link href="/teknisi/tugas">
          <Button size="sm" className="gap-1.5 shadow-sm text-xs">
            <ClipboardList className="h-4 w-4" />
            Buka Daftar Tugas ({activeTasks})
          </Button>
        </Link>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold">Tugas Aktif</span>
            <ClipboardList className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{activeTasks}</p>
          <span className="text-[10px] text-slate-400">Total pekerjaan aktif Anda</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold">Tugas Baru Masuk</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">{assignedTasks}</p>
          <span className="text-[10px] text-slate-400">Perlu diterima & diperiksa</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-semibold">Sedang Diperbaiki</span>
            <Wrench className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-600">{inRepairTasks}</p>
          <span className="text-[10px] text-slate-400">Dalam tahap pengerjaan</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Pekerjaan Selesai</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{completedTasks}</p>
          <span className="text-[10px] text-slate-400">Perbaikan sukses terselesaikan</span>
        </Card>
      </div>

      {/* RECENT ASSIGNED TASKS TABLE */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <CardTitle>Antrean Tugas Servis Terbaru</CardTitle>
            <CardDescription>Perangkat yang ditugaskan kepada Anda oleh admin</CardDescription>
          </div>
          <Link
            href="/teknisi/tugas"
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Semua Tugas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Keluhan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada tugas yang sedang aktif saat ini.
                  </td>
                </tr>
              ) : (
                recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {task.serviceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{task.customer.name}</p>
                      <p className="text-[10px] text-slate-400">{task.customer.phone || "-"}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {task.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        <span>{task.brand} {task.model}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {task.complaint}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/teknisi/tugas/${task.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3">
                          Buka Kerja
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
