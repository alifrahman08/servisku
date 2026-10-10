import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Filter,
  Laptop,
  Smartphone,
  Eye,
  ArrowUpDown,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParamsProps {
  searchParams: {
    q?: string;
    status?: string;
    deviceType?: string;
    technicianId?: string;
  };
}

export default async function AdminServisListPage({ searchParams }: SearchParamsProps) {
  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "";
  const deviceTypeFilter = searchParams.deviceType || "";
  const technicianFilter = searchParams.technicianId || "";

  // Fetch filter options (technicians)
  const technicians = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
    select: { id: true, name: true },
  });

  // Query filtered services from database
  const services = await prisma.serviceRequest.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { serviceNumber: { contains: query } },
                { brand: { contains: query } },
                { model: { contains: query } },
                { customer: { name: { contains: query } } },
              ],
            }
          : {},
        statusFilter ? { status: statusFilter } : {},
        deviceTypeFilter ? { deviceType: deviceTypeFilter } : {},
        technicianFilter ? { technicianId: technicianFilter } : {},
      ],
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      technician: { select: { id: true, name: true } },
      payments: { select: { paymentStatus: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Data Servis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola seluruh tiket perbaikan, status pengerjaan, dan riwayat perangkat masuk
          </p>
        </div>

        <Link href="/admin/servis/baru">
          <Button size="sm" className="gap-1.5 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            Buat Servis Atas Nama Customer
          </Button>
        </Link>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <Card className="p-4 bg-white">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search text */}
          <div className="lg:col-span-2 relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari nomor servis, customer, unit..."
              className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          {/* Status filter */}
          <div>
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Menunggu Pemeriksaan</option>
              <option value="ASSIGNED">Teknisi Ditugaskan</option>
              <option value="IN_DIAGNOSIS">Sedang Diperiksa</option>
              <option value="WAITING_FOR_APPROVAL">Menunggu Persetujuan</option>
              <option value="IN_REPAIR">Sedang Diperbaiki</option>
              <option value="REPAIR_COMPLETED">Perbaikan Selesai</option>
              <option value="READY_FOR_PICKUP">Siap Diambil</option>
              <option value="COMPLETED">Servis Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          {/* Device Type filter */}
          <div>
            <select
              name="deviceType"
              defaultValue={deviceTypeFilter}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="">Semua Perangkat</option>
              <option value="LAPTOP">Laptop</option>
              <option value="SMARTPHONE">Smartphone</option>
            </select>
          </div>

          {/* Filter button */}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="w-full h-10 gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              Filter Data
            </Button>
            {(query || statusFilter || deviceTypeFilter || technicianFilter) && (
              <Link href="/admin/servis">
                <Button variant="ghost" size="sm" className="h-10 text-xs">
                  Reset
                </Button>
              </Link>
            )}
          </div>
        </form>
      </Card>

      {/* SERVICES TABLE */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis & Tanggal</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Teknisi</th>
                <th className="py-3 px-4">Biaya</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data servis yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                services.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900">{req.serviceNumber}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatTanggal(req.createdAt)}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{req.customer.name}</p>
                      <p className="text-[10px] text-slate-500">{req.customer.phone || "-"}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {req.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        )}
                        <span>{req.brand} {req.model}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">{req.complaint}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {req.technician ? (
                        <span className="font-medium text-slate-800">{req.technician.name}</span>
                      ) : (
                        <span className="inline-flex rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          Belum Ada
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {req.finalCost ? (
                        <span className="text-teal-700">{formatRupiah(req.finalCost)}</span>
                      ) : req.estimatedCost ? (
                        <span className="text-slate-600">Est. {formatRupiah(req.estimatedCost)}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/servis/${req.id}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                          <Eye className="h-3 w-3" />
                          Detail
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
