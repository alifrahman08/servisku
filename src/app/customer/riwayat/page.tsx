import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTanggal, formatRupiah } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Laptop, Smartphone, Eye, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerRiwayatPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  const historyServices = await prisma.serviceRequest.findMany({
    where: {
      customerId: user.id,
      status: { in: ["COMPLETED", "CANCELLED"] },
    },
    include: {
      technician: { select: { name: true } },
      serviceType: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Daftar Riwayat Servis Selesai & Ditutup
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Seluruh rekaman perbaikan masa lalu untuk klaim garansi toko dan dokumentasi perangkat
        </p>
      </div>

      <Card className="p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Layanan</th>
                <th className="py-3 px-4">Teknisi</th>
                <th className="py-3 px-4">Total Biaya</th>
                <th className="py-3 px-4">Status Akhir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Belum ada riwayat servis yang telah selesai atau ditutup.
                  </td>
                </tr>
              ) : (
                historyServices.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.serviceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatTanggal(req.createdAt)}</td>
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
                    <td className="py-3.5 px-4 text-slate-600">{req.serviceType?.name || "-"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{req.technician?.name || "-"}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {req.finalCost ? formatRupiah(req.finalCost) : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/customer/riwayat/${req.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                          <Eye className="h-3 w-3 mr-1" />
                          Rincian
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
