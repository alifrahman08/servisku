import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getStorePaymentSettings } from "@/actions/payment";
import { ReceiptClient } from "./ReceiptClient";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface StrukPageProps {
  params: {
    id: string;
  };
}

export default async function StrukPage({ params }: StrukPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?callbackUrl=/struk/${params.id}`);
  }

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { receiptNumber: params.id },
        { id: params.id },
        { invoiceNumber: params.id },
      ],
    },
    include: {
      serviceRequest: {
        include: {
          customer: true,
          technician: {
            select: {
              name: true,
              phone: true,
            },
          },
          diagnosis: true,
          repairLogs: true,
          costEstimates: true,
          serviceType: true,
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  // IDOR Protection: Customer can only view their own receipts.
  if (user.role === "CUSTOMER" && payment.serviceRequest.customerId !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-rose-200 text-center shadow-sm">
          <h2 className="text-base font-bold text-rose-700">Akses Ditolak (403 Forbidden)</h2>
          <p className="text-xs text-slate-600 mt-2">
            Anda tidak memiliki izin untuk melihat struk transaksi dari customer lain.
          </p>
          <div className="mt-6">
            <Link
              href="/customer/tracking"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Pelacakan Servis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Prompt Rule: Struk resmi hanya diterbitkan setelah pembayaran Lunas (PAID).
  if (payment.paymentStatus !== "PAID") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-amber-200 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Struk Resmi Belum Dapat Diterbitkan
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Status transaksi saat ini adalah{" "}
            <span className="font-bold text-amber-700">
              {payment.paymentStatus === "PENDING_VERIFICATION"
                ? "Menunggu Verifikasi Admin"
                : payment.paymentStatus === "REJECTED"
                ? "Bukti Pembayaran Ditolak"
                : "Belum Dibayar"}
            </span>
            . Struk digital resmi hanya tersedia setelah pembayaran diverifikasi dan dinyatakan{" "}
            <strong>LUNAS</strong>.
          </p>
          <div>
            <Link
              href={
                user.role === "ADMIN"
                  ? "/admin/pembayaran"
                  : `/customer/tracking?search=${payment.serviceRequest.serviceNumber}`
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke {user.role === "ADMIN" ? "Manajemen Pembayaran" : "Pelacakan Servis"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeSettings = await getStorePaymentSettings();

  let verifierName = "Admin Kasir ServisKu";
  if (payment.verifiedById) {
    const verifier = await prisma.user.findUnique({
      where: { id: payment.verifiedById },
      select: { name: true },
    });
    if (verifier?.name) {
      verifierName = verifier.name;
    }
  }

  return (
    <ReceiptClient
      payment={payment}
      service={payment.serviceRequest}
      storeSettings={storeSettings}
      verifierName={verifierName}
      userRole={user.role}
    />
  );
}
