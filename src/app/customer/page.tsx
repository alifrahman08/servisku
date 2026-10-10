import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTanggal, formatRupiah } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  PlusCircle,
  Search,
  Clock,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Laptop,
  Smartphone,
  ArrowRight,
  Shield,
  Receipt,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  // Query stats strictly for this customer
  const [totalServices, activeServices, waitingApproval, readyPickup, completedServices, recentServices] =
    await Promise.all([
      prisma.serviceRequest.count({ where: { customerId: user.id } }),
      prisma.serviceRequest.count({
        where: { customerId: user.id, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      }),
      prisma.serviceRequest.count({
        where: { customerId: user.id, status: "WAITING_FOR_APPROVAL" },
      }),
      prisma.serviceRequest.count({
        where: { customerId: user.id, status: "READY_FOR_PICKUP" },
      }),
      prisma.serviceRequest.count({
        where: { customerId: user.id, status: "COMPLETED" },
      }),
      prisma.serviceRequest.findMany({
        where: { customerId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          technician: { select: { name: true } },
          payments: { orderBy: { createdAt: "desc" } },
        },
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Selamat Datang, {user.name} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status perbaikan perangkat Anda secara real-time dan transparan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/customer/ajukan">
            <Button size="sm" className="gap-1.5 shadow-sm text-xs">
              <PlusCircle className="h-4 w-4" />
              Ajukan Servis Baru
            </Button>
          </Link>
          <Link href="/customer/tracking">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Search className="h-4 w-4 text-blue-600" />
              Lacak Servis
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold">Total Servis</span>
            <Shield className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{totalServices}</p>
          <span className="text-[10px] text-slate-400">Semua tiket Anda</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-semibold">Servis Aktif</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-sky-600">{activeServices}</p>
          <span className="text-[10px] text-slate-400">Dalam proses workshop</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-xs font-semibold">Persetujuan Biaya</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-orange-600">{waitingApproval}</p>
          <span className="text-[10px] text-slate-400">Memerlukan konfirmasi Anda</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold">Siap Diambil</span>
            <PackageCheck className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{readyPickup}</p>
          <span className="text-[10px] text-slate-400">Siap di counter workshop</span>
        </Card>

        <Card className="p-4 bg-white border-slate-200">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold">Selesai</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-800">{completedServices}</p>
          <span className="text-[10px] text-slate-400">Riwayat tuntas</span>
        </Card>
      </div>

      {/* RECENT ORDERS TABLE */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <CardTitle>Pesanan Servis Terakhir Anda</CardTitle>
            <CardDescription>Status terkini dari perangkat yang Anda percayakan kepada kami</CardDescription>
          </div>
          <Link
            href="/customer/servis"
            className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Estimasi Biaya</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p>Anda belum memiliki riwayat pengajuan servis.</p>
                    <Link href="/customer/ajukan" className="mt-3 inline-block">
                      <Button size="sm" className="text-xs">Ajukan Servis Sekarang</Button>
                    </Link>
                  </td>
                </tr>
              ) : (
                recentServices.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.serviceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {req.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        <span>{req.brand} {req.model}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatTanggal(req.createdAt)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {req.finalCost
                        ? formatRupiah(req.finalCost)
                        : req.estimatedCost
                        ? `Est. ${formatRupiah(req.estimatedCost)}`
                        : "Menunggu Diagnosis"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {req.payments && req.payments.some((p: any) => p.paymentStatus === "PAID") && (
                          <Link
                            href={`/struk/${req.payments.find((p: any) => p.paymentStatus === "PAID")?.receiptNumber || req.payments.find((p: any) => p.paymentStatus === "PAID")?.id}`}
                            target="_blank"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs px-2.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              Struk
                            </Button>
                          </Link>
                        )}
                        <Link href={`/customer/tracking?search=${req.serviceNumber}`}>
                          <Button variant="outline" size="sm" className="h-8 text-xs px-2.5 gap-1">
                            <Search className="h-3 w-3 text-blue-600" />
                            Lacak Progres
                          </Button>
                        </Link>
                      </div>
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
