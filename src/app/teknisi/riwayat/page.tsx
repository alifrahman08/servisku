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

export default async function TeknisiRiwayatPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TECHNICIAN") redirect("/login");

  const completedTasks = await prisma.serviceRequest.findMany({
    where: {
      technicianId: user.id,
      status: { in: ["REPAIR_COMPLETED", "READY_FOR_PICKUP", "COMPLETED"] },
    },
    include: {
      customer: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Riwayat Pekerjaan Selesai
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Daftar seluruh pekerjaan reparasi yang sukses diselesaikan oleh Anda
        </p>
      </div>

      <Card className="p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Servis</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4">Status Akhir</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Belum ada riwayat pekerjaan yang selesai.
                  </td>
                </tr>
              ) : (
                completedTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {t.serviceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{t.customer.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {t.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        <span>{t.brand} {t.model}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatTanggal(t.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/teknisi/tugas/${t.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-2.5">
                          <Eye className="h-3 w-3 mr-1" />
                          Lihat Detail
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
