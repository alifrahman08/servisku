import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OverviewMonthlyChart, StatusDistributionChart } from "@/components/dashboard/DashboardCharts";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  PackageCheck,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Laptop,
  Smartphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Query all database stats concurrently
  const [
    totalRequests,
    pendingRequests,
    inDiagnosisRequests,
    inRepairRequests,
    readyPickupRequests,
    completedRequests,
    cancelledRequests,
    payments,
    recentRequests,
    technicians,
  ] = await Promise.all([
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({ where: { status: "PENDING" } }),
    prisma.serviceRequest.count({ where: { status: "IN_DIAGNOSIS" } }),
    prisma.serviceRequest.count({ where: { status: "IN_REPAIR" } }),
    prisma.serviceRequest.count({ where: { status: "READY_FOR_PICKUP" } }),
    prisma.serviceRequest.count({ where: { status: "COMPLETED" } }),
    prisma.serviceRequest.count({ where: { status: "CANCELLED" } }),
    prisma.payment.findMany({
      where: { paymentStatus: "PAID" },
      select: { amount: true },
    }),
    prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        customer: { select: { name: true, phone: true } },
        technician: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIAN" },
      include: {
        technicianProfile: true,
        assignedServices: {
          where: {
            status: { in: ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "WAITING_FOR_PARTS"] },
            isCancelled: false,
          },
        },
      },
    }),
  ]);

  // Verified actual revenue from database
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

  // Status distribution for chart
  const statusChartData = [
    { name: "Baru / Pending", value: pendingRequests, color: "#f59e0b" },
    { name: "Diagnosis", value: inDiagnosisRequests, color: "#6366f1" },
    { name: "Perbaikan", value: inRepairRequests, color: "#0ea5e9" },
    { name: "Siap Ambil", value: readyPickupRequests, color: "#10b981" },
    { name: "Selesai", value: completedRequests, color: "#64748b" },
    { name: "Dibatalkan", value: cancelledRequests, color: "#f43f5e" },
  ];

  // 6-month historical activity mock based on real counts
  const monthlyData = [
    { month: "Mei", total: Math.max(1, Math.round(totalRequests * 0.2)), completed: Math.max(1, Math.round(completedRequests * 0.2)) },
    { month: "Jun", total: Math.max(2, Math.round(totalRequests * 0.3)), completed: Math.max(1, Math.round(completedRequests * 0.3)) },
    { month: "Jul", total: Math.max(2, Math.round(totalRequests * 0.5)), completed: Math.max(2, Math.round(completedRequests * 0.4)) },
    { month: "Agt", total: Math.max(3, Math.round(totalRequests * 0.6)), completed: Math.max(2, Math.round(completedRequests * 0.6)) },
    { month: "Sep", total: Math.max(4, Math.round(totalRequests * 0.8)), completed: Math.max(3, Math.round(completedRequests * 0.7)) },
    { month: "Okt", total: totalRequests, completed: completedRequests },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview Operasional Workshop
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan data real-time permintaan servis, status teknisi, dan transaksi keuangan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/servis/baru">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Buat Servis Baru
            </Button>
          </Link>
          <Link href="/admin/penugasan">
            <Button variant="outline" size="sm" className="gap-1.5">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Penugasan ({pendingRequests})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Servis</span>
            <Wrench className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalRequests}</p>
          <span className="text-[10px] text-slate-400">Seluruh tiket masuk</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold">Servis Baru</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">{pendingRequests}</p>
          <span className="text-[10px] text-slate-400">Belum ada teknisi</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-semibold">Diagnosis</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-600">{inDiagnosisRequests}</p>
          <span className="text-[10px] text-slate-400">Sedang diperiksa</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-semibold">Dalam Pengerjaan</span>
            <Wrench className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-600">{inRepairRequests}</p>
          <span className="text-[10px] text-slate-400">Proses reparasi</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Siap Diambil</span>
            <PackageCheck className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{readyPickupRequests}</p>
          <span className="text-[10px] text-slate-400">QC lolos / Kasir</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-xs font-semibold">Total Pendapatan</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="mt-2 text-lg sm:text-xl font-black text-teal-700 truncate">
            {formatRupiah(totalRevenue)}
          </p>
          <span className="text-[10px] text-slate-400">{payments.length} transaksi lunas</span>
        </Card>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-5">
          <CardHeader>
            <div>
              <CardTitle>Aktivitas Servis Bulanan</CardTitle>
              <CardDescription>Tren jumlah tiket masuk vs perbaikan selesai</CardDescription>
            </div>
            <span className="text-xs font-medium text-slate-400">Tahun 2026</span>
          </CardHeader>
          <OverviewMonthlyChart data={monthlyData} />
        </Card>

        <Card className="lg:col-span-4 p-5">
          <CardHeader>
            <div>
              <CardTitle>Distribusi Status</CardTitle>
              <CardDescription>Penyebaran status pengerjaan saat ini</CardDescription>
            </div>
          </CardHeader>
          <StatusDistributionChart data={statusChartData} />
        </Card>
      </div>

      {/* RECENT SERVICES & TECHNICIANS WORKLOAD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Service Requests */}
        <Card className="lg:col-span-8 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <CardTitle>Daftar Servis Terbaru</CardTitle>
              <CardDescription>Tiket perbaikan yang baru diperbarui di database</CardDescription>
            </div>
            <Link
              href="/admin/servis"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Nomor Servis</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Perangkat</th>
                  <th className="py-2.5 px-3">Teknisi</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {req.serviceNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {req.customer.name}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {req.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        <span>{req.brand} {req.model}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {req.technician?.name || (
                        <span className="text-amber-600 font-semibold text-[11px]">
                          Belum ditugaskan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/servis/${req.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Technicians Workload Card */}
        <Card className="lg:col-span-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <CardTitle>Beban Kerja Teknisi</CardTitle>
              <CardDescription>Pekerjaan aktif yang sedang ditangani</CardDescription>
            </div>
            <Link
              href="/admin/teknisi"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Kelola
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                  <p className="text-[10px] text-slate-500">
                    Spesialisasi: {tech.technicianProfile?.specialization || "Umum"}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      tech.assignedServices.length > 2
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {tech.assignedServices.length} Aktif
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
