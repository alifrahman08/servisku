import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CustomerCancelServiceButton } from "./CustomerCancelServiceButton";
import { formatTanggal, formatRupiah } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Search, Laptop, Smartphone, Eye, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    q?: string;
    status?: string;
  };
}

export default async function CustomerServisPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "";

  const services = await prisma.serviceRequest.findMany({
    where: {
      customerId: user.id,
      ...(query
        ? {
            OR: [
              { serviceNumber: { contains: query } },
              { brand: { contains: query } },
              { model: { contains: query } },
            ],
          }
        : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      technician: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daftar Servis Saya
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh tiket perbaikan perangkat yang pernah Anda ajukan di ServisKu
          </p>
        </div>

        <Link href="/customer/ajukan">
          <Button size="sm" className="gap-1.5 shadow-sm text-xs">
            <PlusCircle className="h-4 w-4" />
            Ajukan Servis Baru
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <Card className="p-4 bg-white">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari nomor servis atau nama perangkat..."
              className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <div className="sm:col-span-3">
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu Pemeriksaan</option>
              <option value="ASSIGNED">Teknisi Ditugaskan</option>
              <option value="IN_DIAGNOSIS">Sedang Diperiksa</option>
              <option value="WAITING_FOR_APPROVAL">Menunggu Persetujuan</option>
              <option value="IN_REPAIR">Sedang Diperbaiki</option>
              <option value="READY_FOR_PICKUP">Siap Diambil</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="submit" size="sm" className="w-full h-10 text-xs">
              Filter
            </Button>
            {(query || statusFilter) && (
              <Link href="/customer/servis">
                <Button variant="ghost" size="sm" className="h-10 text-xs">
                  Reset
                </Button>
              </Link>
            )}
          </div>
        </form>
      </Card>

      {/* Services Table */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Estimasi / Biaya</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data servis yang sesuai.
                  </td>
                </tr>
              ) : (
                services.map((req) => {
                  const canCancel = ["PENDING", "ASSIGNED", "WAITING_FOR_APPROVAL"].includes(
                    req.status
                  ) && !req.isCancelled;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {req.serviceNumber}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {req.deviceType === "LAPTOP" ? (
                            <Laptop className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          ) : (
                            <Smartphone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span>{req.brand} {req.model}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {formatTanggal(req.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {req.finalCost ? (
                          <span className="text-teal-700">{formatRupiah(req.finalCost)}</span>
                        ) : req.estimatedCost ? (
                          <span className="text-slate-600">Est. {formatRupiah(req.estimatedCost)}</span>
                        ) : (
                          <span className="text-slate-400">Menunggu Diagnosis</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/customer/tracking?search=${req.serviceNumber}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                              <Search className="h-3 w-3 mr-1 text-blue-600" />
                              Lacak
                            </Button>
                          </Link>

                          {canCancel && (
                            <CustomerCancelServiceButton
                              serviceId={req.id}
                              serviceNumber={req.serviceNumber}
                            />
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
  );
}
