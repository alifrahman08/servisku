import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminServiceCatalogActions } from "./AdminServiceCatalogActions";
import { formatRupiah } from "@/lib/utils";
import { Laptop, Smartphone, Wrench, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayananPage() {
  const services = await prisma.serviceType.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Katalog Layanan & Tarif Dasar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar paket servis perbaikan yang tampil pada landing page dan formulir pendaftaran
          </p>
        </div>

        <AdminServiceCatalogActions mode="CREATE" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((item) => (
          <Card key={item.id} className="p-5 bg-white flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {item.deviceType === "LAPTOP" ? (
                    <Laptop className="h-3 w-3 text-blue-600" />
                  ) : item.deviceType === "SMARTPHONE" ? (
                    <Smartphone className="h-3 w-3 text-indigo-600" />
                  ) : (
                    <Wrench className="h-3 w-3 text-teal-600" />
                  )}
                  {item.deviceType === "BOTH" ? "Laptop & HP" : item.deviceType}
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {item.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>Estimasi: {item.estimatedDuration}</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Harga Dasar
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatRupiah(item.basePrice)}
                </span>
              </div>

              <AdminServiceCatalogActions mode="EDIT" catalog={item} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
