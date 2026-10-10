import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTanggal, formatRupiah } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Search, Filter, Laptop, Smartphone, Eye, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: {
    q?: string;
    status?: string;
  };
}

export default async function TeknisiTugasPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TECHNICIAN") redirect("/login");

  const query = searchParams.q || "";
  const statusFilter = searchParams.status || "";

  const tasks = await prisma.serviceRequest.findMany({
    where: {
      technicianId: user.id,
      isCancelled: false,
      ...(query
        ? {
            OR: [
              { serviceNumber: { contains: query } },
              { brand: { contains: query } },
              { model: { contains: query } },
              { customer: { name: { contains: query } } },
            ],
          }
        : {}),
      ...(statusFilter
        ? { status: statusFilter }
        : {
            status: { in: ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "WAITING_FOR_PARTS", "REPAIR_COMPLETED"] },
          }),
    },
    include: {
      customer: { select: { name: true, phone: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Daftar Tugas Perbaikan Saya
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tugas perbaikan yang saat ini ditugaskan dan menjadi tanggung jawab Anda
        </p>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4 bg-white">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari nomor servis, customer, unit..."
              className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>

          <div className="sm:col-span-4">
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Semua Tugas Aktif</option>
              <option value="ASSIGNED">Tugas Baru (Belum Diperiksa)</option>
              <option value="IN_DIAGNOSIS">Sedang Diperiksa</option>
              <option value="WAITING_FOR_APPROVAL">Menunggu Persetujuan Biaya</option>
              <option value="IN_REPAIR">Sedang Diperbaiki</option>
              <option value="WAITING_FOR_PARTS">Menunggu Sparepart</option>
              <option value="REPAIR_COMPLETED">Perbaikan Selesai (Menunggu QC)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <Button type="submit" size="sm" className="w-full h-10 text-xs">
              Filter
            </Button>
            {(query || statusFilter) && (
              <Link href="/teknisi/tugas">
                <Button variant="ghost" size="sm" className="h-10 text-xs">
                  Reset
                </Button>
              </Link>
            )}
          </div>
        </form>
      </Card>

      {/* Task List Table */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Perangkat & Model</th>
                <th className="py-3 px-4">Keluhan Utama</th>
                <th className="py-3 px-4">Status Pekerjaan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada tugas yang sesuai filter.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900">{task.serviceNumber}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatTanggal(task.createdAt)}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{task.customer.name}</p>
                      <p className="text-[10px] text-slate-400">{task.customer.phone || "-"}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {task.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
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
                        <Button size="sm" className="h-8 text-xs px-3 gap-1">
                          Kerjakan
                          <ArrowRight className="h-3 w-3" />
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
