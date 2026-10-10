import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStorePaymentSettings } from "@/actions/payment";
import { AdminPaymentClient } from "./AdminPaymentClient";

export const dynamic = "force-dynamic";

export default async function AdminPembayaranPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [payments, storeSettings] = await Promise.all([
    prisma.payment.findMany({
      include: {
        serviceRequest: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              },
            },
            serviceType: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getStorePaymentSettings(),
  ]);

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingCount = payments.filter((p) => p.paymentStatus === "PENDING_VERIFICATION").length;
  const paidCount = payments.filter((p) => p.paymentStatus === "PAID").length;
  const rejectedCount = payments.filter((p) => p.paymentStatus === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Manajemen Pembayaran & Struk Transaksi
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verifikasi bukti transfer customer, kelola transaksi QRIS & Bank Mandiri, dan cetak ulang struk resmi
        </p>
      </div>

      <AdminPaymentClient
        initialPayments={payments}
        storeSettings={storeSettings}
        metrics={{
          totalRevenue,
          pendingCount,
          paidCount,
          rejectedCount,
          totalTransactions: payments.length,
        }}
      />
    </div>
  );
}
