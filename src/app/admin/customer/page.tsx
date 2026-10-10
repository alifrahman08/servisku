import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTanggal } from "@/lib/utils";
import { Search, User, Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string };
}

export default async function AdminCustomerPage({ searchParams }: Props) {
  const query = searchParams.q || "";

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      serviceRequests: {
        select: { id: true, status: true, serviceNumber: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Data Customer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pelanggan terdaftar, riwayat servis, dan informasi kontak
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white">
        <form method="GET" className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari nama, email, nomor HP customer..."
              className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
          <Button type="submit" size="sm" className="h-10 px-5 text-xs">
            Cari
          </Button>
          {query && (
            <Link href="/admin/customer">
              <Button variant="ghost" size="sm" className="h-10 text-xs">
                Reset
              </Button>
            </Link>
          )}
        </form>
      </Card>

      {/* Customer List Table */}
      <Card className="p-0 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Kontak & Alamat</th>
                <th className="py-3 px-4">Bergabung</th>
                <th className="py-3 px-4">Total Tiket</th>
                <th className="py-3 px-4">Servis Terakhir</th>
                <th className="py-3 px-4 text-right">Status Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data customer yang cocok.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const lastService = cust.serviceRequests[0];
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700 text-xs shrink-0">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{cust.name}</p>
                            <p className="text-[11px] text-slate-400">{cust.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <p className="font-medium text-slate-800">{cust.phone || "-"}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {cust.address || "Belum ada alamat"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {formatTanggal(cust.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {cust.serviceRequests.length} Servis
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {lastService ? (
                          <Link
                            href={`/admin/servis/${lastService.id}`}
                            className="text-blue-600 font-mono font-medium hover:underline text-[11px]"
                          >
                            {lastService.serviceNumber}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum pernah</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            cust.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {cust.isActive ? "Aktif" : "Nonaktif"}
                        </span>
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
