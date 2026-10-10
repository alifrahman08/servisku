import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { CustomerAjukanForm } from "./CustomerAjukanForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { serviceTypeId?: string };
}

export default async function CustomerAjukanPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  const serviceCatalog = await prisma.serviceType.findMany({
    where: { isActive: true },
    orderBy: { basePrice: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Ajukan Permintaan Servis Baru
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Isi detail perangkat dan keluhan kerusakan untuk menerbitkan nomor tiket servis workshop
        </p>
      </div>

      <Card className="p-6 bg-white">
        <CustomerAjukanForm
          serviceCatalog={serviceCatalog}
          preselectedServiceId={searchParams.serviceTypeId}
          userAddress={user.address || ""}
        />
      </Card>
    </div>
  );
}
