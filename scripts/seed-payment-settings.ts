import { prisma } from "../src/lib/prisma";

async function main() {
  const setting = await prisma.storePaymentSetting.upsert({
    where: { id: "default" },
    update: {
      bankName: "Bank Mandiri",
      bankAccountNumber: "1440028395116",
      bankAccountHolder: "ALIF NOOR RAHMAN HAMID",
      qrisMerchantName: "ServisKu / ALIF NOOR RAHMAN HAMID",
      qrisImageUrl: "/images/qris-merchant.png",
    },
    create: {
      id: "default",
      storeName: "ServisKu Workshop",
      storeAddress: "Jl. Sudirman No. 45, Jakarta Pusat",
      storePhone: "0812-3456-7890",
      storeEmail: "layanan@servisku.com",
      bankName: "Bank Mandiri",
      bankAccountNumber: "1440028395116",
      bankAccountHolder: "ALIF NOOR RAHMAN HAMID",
      qrisMerchantName: "ServisKu / ALIF NOOR RAHMAN HAMID",
      qrisImageUrl: "/images/qris-merchant.png",
      warrantyTerms: "Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.",
    },
  });

  console.log("Store payment settings initialized:", setting);

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });

  // Update existing PAID payments with receipt numbers if null
  const payments = await prisma.payment.findMany();
  for (let i = 0; i < payments.length; i++) {
    const p = payments[i];
    if (p.paymentStatus === "PAID" && !p.receiptNumber) {
      const receiptNo = `STRUK-202610-${String(i + 1).padStart(4, "0")}`;
      await prisma.payment.update({
        where: { id: p.id },
        data: {
          receiptNumber: receiptNo,
          verifiedById: admin?.id,
          verifiedAt: p.paidAt || new Date(),
        },
      });
      console.log(`Updated payment ${p.id} with receipt number: ${receiptNo}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
