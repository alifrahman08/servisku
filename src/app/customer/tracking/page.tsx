import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CustomerTrackingClient } from "./CustomerTrackingClient";
import { redirect } from "next/navigation";
import { getStorePaymentSettings } from "@/actions/payment";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { search?: string };
}

export default async function CustomerTrackingPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  const search = searchParams.search?.trim() || "";

  // If search query is provided, look up by serviceNumber
  let activeService: any = null;

  if (search) {
    activeService = await prisma.serviceRequest.findFirst({
      where: {
        customerId: user.id,
        serviceNumber: search,
      },
      include: {
        technician: {
          select: {
            name: true,
            phone: true,
            technicianProfile: { select: { specialization: true } },
          },
        },
        serviceType: true,
        diagnosis: true,
        costEstimates: { orderBy: { createdAt: "desc" } },
        statusHistories: {
          include: { actor: { select: { name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  // If no search query or not found, pick the latest active service request of this customer
  if (!activeService) {
    activeService = await prisma.serviceRequest.findFirst({
      where: {
        customerId: user.id,
      },
      include: {
        technician: {
          select: {
            name: true,
            phone: true,
            technicianProfile: { select: { specialization: true } },
          },
        },
        serviceType: true,
        diagnosis: true,
        costEstimates: { orderBy: { createdAt: "desc" } },
        statusHistories: {
          include: { actor: { select: { name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
        payments: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  // Fetch list of customer's service numbers for quick selector
  const myServices = await prisma.serviceRequest.findMany({
    where: { customerId: user.id },
    select: { id: true, serviceNumber: true, brand: true, model: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch store payment settings for Mandiri & QRIS details
  const storeSettings = await getStorePaymentSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tracking & Progres Servis Real-Time
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau setiap tahapan pemeriksaan, diagnosis, dan pengerjaan perangkat Anda secara transparan
        </p>
      </div>

      <CustomerTrackingClient
        service={activeService}
        myServices={myServices}
        initialSearch={search}
        storeSettings={{
          bankName: storeSettings.bankName,
          bankAccountNumber: storeSettings.bankAccountNumber,
          bankAccountHolder: storeSettings.bankAccountHolder,
          qrisMerchantName: storeSettings.qrisMerchantName,
          qrisImageUrl: storeSettings.qrisImageUrl,
        }}
      />
    </div>
  );
}
