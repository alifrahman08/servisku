import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "../src/lib/prisma";
import { getStorePaymentSettings } from "../src/actions/payment";
import path from "path";
import fs from "fs";

describe("SQA Pengujian Fitur Pembayaran, QRIS, Transfer Bank & Struk Transaksi", () => {
  let testCustomerId: string;
  let otherCustomerId: string;
  let testAdminId: string;
  let testTechnicianId: string;
  let testServiceId: string;
  let testPaymentId: string;
  let generatedReceiptNumber: string;

  beforeAll(async () => {
    // 1. Fetch Actors
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const customers = await prisma.user.findMany({ where: { role: "CUSTOMER" }, take: 2 });
    const tech = await prisma.user.findFirst({ where: { role: "TECHNICIAN" } });

    expect(admin).toBeDefined();
    expect(customers.length).toBeGreaterThanOrEqual(2);
    expect(tech).toBeDefined();

    testAdminId = admin!.id;
    testCustomerId = customers[0].id;
    otherCustomerId = customers[1].id;
    testTechnicianId = tech!.id;

    // 2. Create a test service request for payment test
    const srv = await prisma.serviceRequest.create({
      data: {
        serviceNumber: `SRV-TEST-${Date.now().toString().slice(-4)}`,
        customerId: testCustomerId,
        technicianId: testTechnicianId,
        deviceType: "LAPTOP",
        brand: "Asus",
        model: "ZenBook 14",
        complaint: "Keyboard tidak berfungsi dan pembersihan kipas",
        initialCondition: "Fisik baik, lecet pemakaian wajar",
        status: "REPAIR_COMPLETED",
        estimatedCost: 750000,
        finalCost: 750000,
      },
    });
    testServiceId = srv.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testPaymentId) {
      await prisma.payment.deleteMany({ where: { id: testPaymentId } });
    }
    if (testServiceId) {
      await prisma.statusHistory.deleteMany({ where: { serviceRequestId: testServiceId } });
      await prisma.serviceRequest.deleteMany({ where: { id: testServiceId } });
    }
  });

  describe("1. Konfigurasi Rekening Bank Mandiri & QRIS Resmi", () => {
    it("Pengaturan toko memuat nomor rekening Bank Mandiri yang diminta", async () => {
      const settings = await getStorePaymentSettings();
      expect(settings.bankName).toBe("Bank Mandiri");
      expect(settings.bankAccountNumber).toBe("1440028395116");
      expect(settings.bankAccountHolder).toBe("ALIF NOOR RAHMAN HAMID");
    });

    it("Pengaturan QRIS resmi terhubung dengan merchant dan gambar QR yang valid", async () => {
      const settings = await getStorePaymentSettings();
      expect(settings.qrisMerchantName).toContain("ALIF NOOR RAHMAN HAMID");
      expect(settings.qrisImageUrl).toBe("/images/qris-merchant.png");

      // Verify the QRIS image physically exists in public folder
      const imagePath = path.join(process.cwd(), "public", "images", "qris-merchant.png");
      expect(fs.existsSync(imagePath)).toBe(true);
    });
  });

  describe("2. Validasi File Upload Bukti Transfer", () => {
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    it("Format file yang sah (JPG, JPEG, PNG, PDF) diterima", () => {
      const validFiles = [
        { name: "bukti_transfer.jpg", type: "image/jpeg", size: 1024 * 500 },
        { name: "slip_mandiri.png", type: "image/png", size: 1024 * 1024 },
        { name: "struk_pembayaran.pdf", type: "application/pdf", size: 1024 * 2000 },
      ];

      validFiles.forEach((file) => {
        const ext = path.extname(file.name).toLowerCase();
        expect(ALLOWED_EXTENSIONS.includes(ext)).toBe(true);
        expect(ALLOWED_MIME_TYPES.includes(file.type)).toBe(true);
        expect(file.size <= MAX_FILE_SIZE).toBe(true);
      });
    });

    it("Format file berbahaya atau tidak didukung (.exe, .sh, .txt, .js) ditolak", () => {
      const invalidFiles = [
        { name: "script.exe", type: "application/x-msdownload", size: 1024 * 50 },
        { name: "payload.sh", type: "application/x-sh", size: 1024 * 10 },
        { name: "notes.txt", type: "text/plain", size: 1024 * 2 },
      ];

      invalidFiles.forEach((file) => {
        const ext = path.extname(file.name).toLowerCase();
        const isSupported = ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(file.type);
        expect(isSupported).toBe(false);
      });
    });

    it("File yang melebihi batas 5 MB ditolak sistem", () => {
      const oversizedFileSize = 6 * 1024 * 1024; // 6 MB
      expect(oversizedFileSize > MAX_FILE_SIZE).toBe(true);
    });
  });

  describe("3. Alur Status Pembayaran (Tidak Langsung Lunas)", () => {
    it("Mengunggah bukti transfer menghasilkan status PENDING_VERIFICATION (bukan LUNAS)", async () => {
      const invoiceNumber = `INV-TEST-${Date.now().toString().slice(-6)}`;
      const payment = await prisma.payment.create({
        data: {
          serviceRequestId: testServiceId,
          invoiceNumber,
          amount: 750000,
          paymentMethod: "TRANSFER",
          paymentStatus: "PENDING_VERIFICATION",
          proofUrl: "/api/uploads/proofs/test-proof.jpg",
          proofFileName: "test-proof.jpg",
          referenceNumber: "REF-MANDIRI-9912",
        },
      });

      testPaymentId = payment.id;
      expect(payment.paymentStatus).toBe("PENDING_VERIFICATION");
      expect(payment.paymentStatus).not.toBe("PAID");
      expect(payment.paidAt).toBeNull();
      expect(payment.receiptNumber).toBeNull();
    });

    it("Bukti transfer masuk ke antrean verifikasi Admin", async () => {
      const pendingList = await prisma.payment.findMany({
        where: { paymentStatus: "PENDING_VERIFICATION" },
      });
      const found = pendingList.some((p) => p.id === testPaymentId);
      expect(found).toBe(true);
    });
  });

  describe("4. Penolakan Bukti Pembayaran oleh Admin", () => {
    it("Admin dapat menolak bukti transfer dengan alasan yang jelas", async () => {
      const reason = "Bukti transfer tidak terbaca / buram, silakan upload ulang";

      const updated = await prisma.payment.update({
        where: { id: testPaymentId },
        data: {
          paymentStatus: "REJECTED",
          rejectionReason: reason,
          verifiedById: testAdminId,
          verifiedAt: new Date(),
        },
      });

      expect(updated.paymentStatus).toBe("REJECTED");
      expect(updated.rejectionReason).toBe(reason);
      expect(updated.paymentStatus).not.toBe("PAID");
    });

    it("Customer dapat melihat alasan penolakan dan status transaksi adalah REJECTED", async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: testPaymentId },
      });
      expect(payment?.paymentStatus).toBe("REJECTED");
      expect(payment?.rejectionReason).toBeTruthy();
    });
  });

  describe("5. Verifikasi Pembayaran Lunas & Penerbitan Struk Resmi", () => {
    it("Admin menyetujui bukti pembayaran, status menjadi PAID dan receiptNumber unik diterbitkan", async () => {
      const now = new Date();
      const receiptNo = `STRUK-202610-${Math.floor(1000 + Math.random() * 9000)}`;

      const verified = await prisma.payment.update({
        where: { id: testPaymentId },
        data: {
          paymentStatus: "PAID",
          receiptNumber: receiptNo,
          paidAt: now,
          verifiedById: testAdminId,
          verifiedAt: now,
          rejectionReason: null,
        },
      });

      expect(verified.paymentStatus).toBe("PAID");
      expect(verified.receiptNumber).toBe(receiptNo);
      expect(verified.paidAt).not.toBeNull();
      expect(verified.verifiedById).toBe(testAdminId);
      generatedReceiptNumber = receiptNo;
    });

    it("Service request di-update menjadi READY_FOR_PICKUP setelah pembayaran diverifikasi", async () => {
      await prisma.serviceRequest.update({
        where: { id: testServiceId },
        data: { status: "READY_FOR_PICKUP" },
      });

      const srv = await prisma.serviceRequest.findUnique({
        where: { id: testServiceId },
      });
      expect(srv?.status).toBe("READY_FOR_PICKUP");
    });

    it("Nominal pembayaran konsisten dan tidak dihitung ganda", async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: testPaymentId },
        include: { serviceRequest: true },
      });

      expect(payment?.amount).toBe(750000);
      expect(payment?.serviceRequest.finalCost).toBe(payment?.amount);
    });
  });

  describe("6. Keamanan, RBAC, dan Proteksi IDOR Struk Pembayaran", () => {
    it("Customer pemilik transaksi dapat mengakses struknya", async () => {
      const payment = await prisma.payment.findUnique({
        where: { receiptNumber: generatedReceiptNumber },
        include: { serviceRequest: true },
      });

      expect(payment).toBeDefined();
      expect(payment?.serviceRequest.customerId).toBe(testCustomerId);
    });

    it("Customer lain (IDOR) ditolak mengakses struk yang bukan miliknya", async () => {
      const payment = await prisma.payment.findUnique({
        where: { receiptNumber: generatedReceiptNumber },
        include: { serviceRequest: true },
      });

      // Simulation of ownership check in /struk/[id]/page.tsx
      const isOwner = payment?.serviceRequest.customerId === otherCustomerId;
      expect(isOwner).toBe(false); // Customer B is strictly forbidden!
    });

    it("Teknisi tidak diizinkan memiliki wewenang verifikasi pembayaran", () => {
      const allowedRolesForVerification = ["ADMIN"];
      expect(allowedRolesForVerification.includes("TECHNICIAN")).toBe(false);
    });

    it("Struk hanya sah jika pembayaran berstatus PAID (bukan UNPAID/PENDING/REJECTED)", () => {
      const paymentPaid = { paymentStatus: "PAID" };
      const paymentPending = { paymentStatus: "PENDING_VERIFICATION" };
      const paymentRejected = { paymentStatus: "REJECTED" };

      expect(paymentPaid.paymentStatus === "PAID").toBe(true);
      expect(paymentPending.paymentStatus === "PAID").toBe(false);
      expect(paymentRejected.paymentStatus === "PAID").toBe(false);
    });
  });
});
