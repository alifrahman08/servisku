import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminCreateServiceForm } from "./AdminCreateServiceForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCreateServicePage() {
  const [customers, technicians, serviceCatalog] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER", isActive: true },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIAN", isActive: true },
      select: {
        id: true,
        name: true,
        technicianProfile: { select: { specialization: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.serviceType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/servis"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pendaftaran Servis Baru (Atas Nama Customer)
          </h1>
          <p className="text-xs text-slate-500">
            Daftarkan perangkat pelanggan yang datang langsung (walk-in) ke workshop
          </p>
        </div>
      </div>

      <Card className="p-6 bg-white">
        <AdminCreateServiceForm
          customers={customers}
          technicians={technicians}
          serviceCatalog={serviceCatalog}
        />
      </Card>
    </div>
  );
}
