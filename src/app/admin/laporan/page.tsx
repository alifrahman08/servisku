import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ExportCsvButton } from "./ExportCsvButton";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import {
  TrendingUp,
  Calendar,
  Filter,
  CheckCircle2,
  Laptop,
  Smartphone,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    startDate?: string;
    endDate?: string;
  };
}

export default async function AdminLaporanPage({ searchParams }: Props) {
  const { startDate, endDate } = searchParams;

  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = new Date(startDate);
  }
  if (endDate) {
    // end of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  // Fetch all filtered service requests
  const services = await prisma.serviceRequest.findMany({
    where: {
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
    },
    include: {
      customer: { select: { name: true } },
      technician: { select: { name: true } },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate strict verified financial metrics
  // ONLY count payments where paymentStatus === 'PAID'
  // DO NOT count cancelled services or estimated costs as revenue!
  const paidPayments = await prisma.payment.findMany({
    where: {
      paymentStatus: "PAID",
      ...(Object.keys(dateFilter).length > 0 ? { paidAt: dateFilter } : {}),
    },
  });

  const verifiedRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  const laptopCount = services.filter((s) => s.deviceType === "LAPTOP").length;
  const hpCount = services.filter((s) => s.deviceType === "SMARTPHONE").length;

  const completedCount = services.filter((s) => s.status === "COMPLETED").length;
  const inProgressCount = services.filter((s) =>
    ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "READY_FOR_PICKUP"].includes(s.status)
  ).length;
  const cancelledCount = services.filter((s) => s.status === "CANCELLED").length;

  // Prepare export data
  const exportData = services.map((s) => {
    const isPaid = s.payments.some((p) => p.paymentStatus === "PAID");
    const amount = s.payments
      .filter((p) => p.paymentStatus === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      serviceNumber: s.serviceNumber,
      date: s.createdAt.toISOString().slice(0, 10),
      customer: s.customer.name,
      deviceType: s.deviceType,
      brandModel: `${s.brand} ${s.model}`,
      technician: s.technician?.name || "Belum Ditugaskan",
      status: s.status,
      cost: isPaid ? amount : s.finalCost || s.estimatedCost || 0,
      paymentStatus: isPaid ? "LUNAS" : "BELUM LUNAS",
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan Kinerja & Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan pendapatan riil dari kasir workshop dan statistik servis per periode
          </p>
        </div>

        <ExportCsvButton data={exportData} />
      </div>

      {/* Date Range Filter Bar */}
      <Card className="p-4 bg-white">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Dari:</span>
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Sampai:</span>
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className="h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button type="submit" size="sm" className="h-9 px-4 text-xs gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Terapkan Filter
          </Button>

          {(startDate || endDate) && (
            <a href="/admin/laporan" className="text-xs text-slate-500 hover:text-slate-800">
              Reset Tanggal
            </a>
          )}
        </form>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-xs font-bold uppercase tracking-wider">Pendapatan Riil Lunas</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{formatRupiah(verifiedRevenue)}</p>
          <span className="text-[10px] text-slate-400">
            Berdasarkan {paidPayments.length} transaksi kasir valid
          </span>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider">Total Servis Masuk</span>
            <Calendar className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{services.length}</p>
          <span className="text-[10px] text-slate-400">
            Laptop: {laptopCount} • HP: {hpCount}
          </span>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Perbaikan Selesai</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{completedCount}</p>
          <span className="text-[10px] text-slate-400">Unit sukses diserahkan</span>
        </Card>

        <Card className="p-5 bg-white border-slate-200">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold uppercase tracking-wider">Servis Dibatalkan</span>
            <span className="text-xs font-bold">🚫</span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-600">{cancelledCount}</p>
          <span className="text-[10px] text-slate-400">Tidak dihitung pendapatan</span>
        </Card>
      </div>

      {/* Laporan Detail Table */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Rincian Tiket Servis Terdata ({services.length})
          </h3>
          <span className="text-[11px] text-slate-400">Data bersumber dari database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Teknisi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Pendapatan Riil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi servis dalam rentang tanggal ini.
                  </td>
                </tr>
              ) : (
                services.map((req) => {
                  const paid = req.payments
                    .filter((p) => p.paymentStatus === "PAID")
                    .reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {req.serviceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatTanggal(req.createdAt)}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{req.customer.name}</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {req.brand} {req.model}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {req.technician?.name || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {paid > 0 ? (
                          <span className="text-teal-700">{formatRupiah(paid)}</span>
                        ) : (
                          <span className="text-slate-400 font-normal">-</span>
                        )}
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
  );
}
