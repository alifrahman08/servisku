import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== MEMULAI VERIFIKASI APLIKASI TERHADAP SUPABASE POSTGRESQL ===");

  // 1. Verifikasi Koneksi & Pembacaan Data Online
  console.log("\n[1] Verifikasi Koneksi & Query Online...");
  const userCount = await prisma.user.count();
  const serviceCount = await prisma.serviceRequest.count();
  const serviceTypeCount = await prisma.serviceType.count();
  const paymentCount = await prisma.payment.count();

  console.log(`- Jumlah User: ${userCount}`);
  console.log(`- Jumlah Service Request: ${serviceCount}`);
  console.log(`- Jumlah Jenis Layanan: ${serviceTypeCount}`);
  console.log(`- Jumlah Pembayaran: ${paymentCount}`);

  if (userCount === 0 || serviceTypeCount === 0) {
    throw new Error("Data awal tidak ditemukan di database online Supabase!");
  }

  // 2. Verifikasi Autentikasi (Admin Login Check)
  console.log("\n[2] Verifikasi Autentikasi (Password Verification)...");
  const admin = await prisma.user.findUnique({
    where: { email: "admin@servisku.com" },
  });
  if (!admin) throw new Error("Akun admin tidak ditemukan!");
  const isValidAdminPass = await bcrypt.compare("admin123456", admin.passwordHash);
  if (!isValidAdminPass) throw new Error("Verifikasi password admin gagal!");
  console.log(`- Akun Admin terverifikasi: ${admin.name} (Role: ${admin.role})`);

  // 3. Verifikasi Pendaftaran Customer Baru (Register)
  console.log("\n[3] Verifikasi Register Customer Baru ke Supabase...");
  const testEmail = `test.reg.${Date.now()}@testservisku.id`;
  const hashedPass = await bcrypt.hash("testpass123", 10);
  const newCustomer = await prisma.user.create({
    data: {
      name: "Test User Supabase",
      email: testEmail,
      passwordHash: hashedPass,
      phone: "081999888777",
      role: "CUSTOMER",
      address: "Jl. Uji Coba Supabase No. 1",
    },
  });
  console.log(`- Customer baru berhasil dibuat dengan ID: ${newCustomer.id}`);

  // 4. Verifikasi Pembuatan Service Request (CRUD Servis Online)
  console.log("\n[4] Verifikasi CRUD Service Request...");
  const serviceNumber = `SRV-TEST-${Date.now().toString().slice(-6)}`;
  const serviceType = await prisma.serviceType.findFirst();

  const service = await prisma.serviceRequest.create({
    data: {
      serviceNumber,
      customerId: newCustomer.id,
      serviceTypeId: serviceType?.id,
      deviceType: "LAPTOP",
      brand: "Asus",
      model: "ROG Zephyrus G14",
      complaint: "Layar blank saat dinyalakan",
      initialCondition: "Kondisi fisik mulus, kipas berputar tapi tidak ada display",
      status: "PENDING",
      priority: "HIGH",
    },
  });
  console.log(`- Servis berhasil dibuat: ${service.serviceNumber} (Status: ${service.status})`);

  // 5. Verifikasi Penugasan Teknisi & Perubahan Status Servis
  console.log("\n[5] Verifikasi Penugasan Teknisi & Histori Status...");
  const tech = await prisma.user.findFirst({
    where: { role: "TECHNICIAN" },
  });
  if (!tech) throw new Error("Teknisi tidak ditemukan!");

  const updatedService = await prisma.serviceRequest.update({
    where: { id: service.id },
    data: {
      technicianId: tech.id,
      status: "IN_DIAGNOSIS",
    },
  });

  const history = await prisma.statusHistory.create({
    data: {
      serviceRequestId: service.id,
      actorId: admin.id,
      fromStatus: "PENDING",
      toStatus: "IN_DIAGNOSIS",
      notes: "Ditugaskan ke teknisi untuk pengecekan motherboard",
    },
  });
  console.log(`- Servis diperbarui: Teknisi ID ${updatedService.technicianId}, Status ${updatedService.status}`);
  console.log(`- Riwayat status tercatat: ${history.fromStatus} -> ${history.toStatus}`);

  // 6. Verifikasi Pembayaran & Nomor Struk Digital
  console.log("\n[6] Verifikasi Pembayaran & Digital Receipt...");
  const invoiceNum = `INV-TEST-${Date.now().toString().slice(-6)}`;
  const receiptNum = `RCP-TEST-${Date.now().toString().slice(-6)}`;
  const payment = await prisma.payment.create({
    data: {
      serviceRequestId: service.id,
      invoiceNumber: invoiceNum,
      receiptNumber: receiptNum,
      amount: 150000,
      paymentMethod: "QRIS",
      paymentStatus: "PAID",
      paidAt: new Date(),
    },
  });
  console.log(`- Pembayaran tercatat: Invoice ${payment.invoiceNumber}, Receipt ${payment.receiptNumber}, Amount IDR ${payment.amount}`);

  // 7. Verifikasi Cross-View Consistency (Dashboard Query)
  console.log("\n[7] Verifikasi Konsistensi Multi-Role (Admin, Teknisi, Customer)...");
  const customerView = await prisma.serviceRequest.findFirst({
    where: { customerId: newCustomer.id },
    include: { payments: true, statusHistories: true },
  });
  const technicianView = await prisma.serviceRequest.findFirst({
    where: { technicianId: tech.id, id: service.id },
  });
  const adminView = await prisma.serviceRequest.findFirst({
    where: { id: service.id },
    include: { customer: true, technician: true, payments: true },
  });

  if (!customerView || !technicianView || !adminView) {
    throw new Error("Inkonsistensi data antar role dashboard!");
  }
  console.log("- Data konsisten diakses oleh role Customer, Teknisi, dan Admin dari database Supabase.");

  // Bersihkan data uji sementara
  console.log("\n[8] Membersihkan data uji verifikasi...");
  await prisma.payment.delete({ where: { id: payment.id } });
  await prisma.statusHistory.delete({ where: { id: history.id } });
  await prisma.serviceRequest.delete({ where: { id: service.id } });
  await prisma.user.delete({ where: { id: newCustomer.id } });
  console.log("- Data uji dibersihkan tanpa mengganggu data utama.");

  console.log("\n=== SEMUA VERIFIKASI DATABASE SUPABASE BERHASIL 100% ===");
}

main()
  .catch((e) => {
    console.error("VERIFIKASI GAGAL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
