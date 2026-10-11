"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAuth, getCurrentUser } from "@/lib/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

export async function getStorePaymentSettings() {
  try {
    let setting = await prisma.storePaymentSetting.findUnique({
      where: { id: "default" },
    });

    if (!setting) {
      setting = await prisma.storePaymentSetting.create({
        data: {
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
          warrantyTerms:
            "Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.",
        },
      });
    }

    return setting;
  } catch (error) {
    console.error("Get store payment settings error:", error);
    return {
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
      warrantyTerms:
        "Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.",
    };
  }
}

export async function submitPaymentProofAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu" };
    }

    const serviceRequestId = formData.get("serviceRequestId") as string;
    const paymentMethod = ((formData.get("paymentMethod") as string) || "TRANSFER").toUpperCase();
    const referenceNumber = ((formData.get("referenceNumber") as string) || "").trim();
    const notes = ((formData.get("notes") as string) || "").trim();
    const file = formData.get("proof") as File | null;

    if (!serviceRequestId) {
      return { success: false, error: "ID Permintaan servis tidak valid" };
    }

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) {
      return { success: false, error: "Permintaan servis tidak ditemukan" };
    }

    // Role ownership check: Customers can only pay for their own service
    if (user.role === "CUSTOMER" && service.customerId !== user.id) {
      return { success: false, error: "Anda tidak memiliki akses ke servis ini" };
    }

    // Technicians cannot submit/confirm payment
    if (user.role === "TECHNICIAN") {
      return { success: false, error: "Teknisi tidak diizinkan memproses pembayaran" };
    }

    // Calculate billing amount
    const payableAmount = service.finalCost || service.estimatedCost || 0;
    if (payableAmount <= 0) {
      return {
        success: false,
        error: "Nominal tagihan servis belum ditentukan oleh teknisi atau admin",
      };
    }

    // Check if already paid
    const isAlreadyPaid = service.payments.some((p) => p.paymentStatus === "PAID");
    if (isAlreadyPaid) {
      return {
        success: false,
        error: "Tagihan servis ini sudah lunas terverifikasi",
      };
    }

    // Validate uploaded file
    if (!file || file.size === 0) {
      return { success: false, error: "Bukti transfer / struk pembayaran wajib diunggah" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `Ukuran file bukti transfer melebihi batas maksimal 5 MB (ukuran file: ${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      };
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Format file tidak didukung. Harap unggah bukti berupa file JPG, JPEG, PNG, atau PDF",
      };
    }

    // Save file safely with unique name
    const sanitizedExt = ext.replace(/[^a-z0-9.]/gi, "");
    const safeFilename = `proof-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${sanitizedExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");

    const buffer = Buffer.from(await file.arrayBuffer());
    let proofUrl = `/api/uploads/proofs/${safeFilename}`;

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, safeFilename), buffer);
    } catch {
      // On Vercel / serverless environment filesystem is read-only.
      // Store as persistent Data URL in database directly.
      const mime = file.type || "image/jpeg";
      proofUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    // Find if there's an existing pending or rejected payment for this service
    const existingPayment = service.payments.find(
      (p) => p.paymentStatus === "PENDING_VERIFICATION" || p.paymentStatus === "REJECTED" || p.paymentStatus === "UNPAID" || p.paymentStatus === "PENDING"
    );

    let paymentId: string;
    let invoiceNumber: string;

    if (existingPayment) {
      invoiceNumber = existingPayment.invoiceNumber;
      paymentId = existingPayment.id;
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: payableAmount,
          paymentMethod,
          paymentStatus: "PENDING_VERIFICATION",
          proofUrl,
          proofFileName: safeFilename,
          referenceNumber: referenceNumber || null,
          notes: notes || existingPayment.notes,
          rejectionReason: null, // Clear any previous rejection reason
        },
      });
    } else {
      invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const created = await prisma.payment.create({
        data: {
          serviceRequestId: service.id,
          invoiceNumber,
          amount: payableAmount,
          paymentMethod,
          paymentStatus: "PENDING_VERIFICATION",
          proofUrl,
          proofFileName: safeFilename,
          referenceNumber: referenceNumber || null,
          notes: notes || "Menunggu verifikasi pembayaran oleh Admin",
        },
      });
      paymentId = created.id;
    }

    // Log status history
    await prisma.statusHistory.create({
      data: {
        serviceRequestId: service.id,
        actorId: user.id,
        fromStatus: service.status,
        toStatus: service.status,
        notes: `Customer mengunggah bukti pembayaran (${paymentMethod}) sebesar Rp ${payableAmount.toLocaleString("id-ID")}. Status: Menunggu Verifikasi. Ref: ${referenceNumber || "-"}`,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    });

    for (const adm of admins) {
      await prisma.notification.create({
        data: {
          userId: adm.id,
          title: "Bukti Pembayaran Baru Menunggu Verifikasi",
          message: `Customer ${user.name} mengunggah bukti transfer untuk tiket ${service.serviceNumber} sebesar Rp ${payableAmount.toLocaleString("id-ID")}.`,
          link: `/admin/pembayaran`,
          type: "PAYMENT",
        },
      });
    }

    revalidatePath("/customer/tracking");
    revalidatePath(`/customer/tracking?search=${service.serviceNumber}`);
    revalidatePath(`/customer/riwayat/${service.id}`);
    revalidatePath("/customer/servis");
    revalidatePath("/admin/pembayaran");
    revalidatePath(`/admin/servis/${service.id}`);

    return {
      success: true,
      message:
        "Bukti pembayaran berhasil diunggah! Pembayaran saat ini berstatus 'Menunggu Verifikasi' oleh Admin Workshop.",
      paymentId,
    };
  } catch (error) {
    console.error("Submit payment proof error:", error);
    return { success: false, error: "Gagal mengunggah bukti pembayaran" };
  }
}

export async function verifyPaymentAction(formData: FormData | { paymentId: string }) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    let paymentId: string;
    if (formData instanceof FormData) {
      paymentId = (formData.get("paymentId") as string) || "";
    } else {
      paymentId = formData.paymentId;
    }

    if (!paymentId) {
      return { success: false, error: "ID Pembayaran tidak valid" };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        serviceRequest: {
          include: { customer: true },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Data pembayaran tidak ditemukan" };
    }

    if (payment.paymentStatus === "PAID") {
      return {
        success: false,
        error: "Pembayaran ini sudah diverifikasi Lunas sebelumnya.",
      };
    }

    // Generate unique receipt number: STRUK-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    let receiptNumber = `STRUK-${yearMonth}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Verify uniqueness
    let attempts = 0;
    while (attempts < 5) {
      const existingReceipt = await prisma.payment.findUnique({
        where: { receiptNumber },
      });
      if (!existingReceipt) break;
      receiptNumber = `STRUK-${yearMonth}-${Math.floor(1000 + Math.random() * 9000)}`;
      attempts++;
    }

    // If service was in REPAIR_COMPLETED, transition to READY_FOR_PICKUP
    const currentServiceStatus = payment.serviceRequest.status;
    let nextServiceStatus = currentServiceStatus;
    if (currentServiceStatus === "REPAIR_COMPLETED") {
      nextServiceStatus = "READY_FOR_PICKUP";
    }

    // Execute updates transactionally
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: "PAID",
          receiptNumber,
          paidAt: now,
          verifiedById: admin.id,
          verifiedAt: now,
          rejectionReason: null,
        },
      }),
      prisma.serviceRequest.update({
        where: { id: payment.serviceRequestId },
        data: {
          finalCost: payment.amount,
          status: nextServiceStatus,
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId: payment.serviceRequestId,
          actorId: admin.id,
          fromStatus: currentServiceStatus,
          toStatus: nextServiceStatus,
          notes: `Pembayaran sebesar Rp ${payment.amount.toLocaleString("id-ID")} diverifikasi LUNAS oleh Admin (${admin.name}). Struk Resmi: ${receiptNumber}.`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: payment.serviceRequest.customerId,
          title: "Pembayaran Telah Diverifikasi Lunas",
          message: `Pembayaran untuk tiket servis ${payment.serviceRequest.serviceNumber} telah diverifikasi LUNAS. Struk pembayaran resmi digital Anda telah diterbitkan.`,
          link: `/struk/${receiptNumber}`,
          type: "PAYMENT",
        },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/admin/pembayaran");
    revalidatePath("/admin/servis");
    revalidatePath(`/admin/servis/${payment.serviceRequestId}`);
    revalidatePath("/admin/laporan");
    revalidatePath(`/struk/${receiptNumber}`);
    revalidatePath(`/struk/${payment.id}`);
    revalidatePath("/customer/tracking");
    revalidatePath(`/customer/tracking?search=${payment.serviceRequest.serviceNumber}`);
    revalidatePath(`/customer/riwayat/${payment.serviceRequestId}`);

    return {
      success: true,
      message: "Pembayaran berhasil diverifikasi Lunas! Struk digital resmi telah diterbitkan.",
      receiptNumber,
    };
  } catch (error) {
    console.error("Verify payment error:", error);
    return { success: false, error: "Gagal memverifikasi pembayaran" };
  }
}

export async function rejectPaymentAction(formData: FormData) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    const paymentId = (formData.get("paymentId") as string) || "";
    const reason = ((formData.get("reason") as string) || "").trim();

    if (!paymentId) {
      return { success: false, error: "ID Pembayaran tidak valid" };
    }

    if (!reason || reason.length < 5) {
      return {
        success: false,
        error: "Harap berikan alasan penolakan bukti pembayaran dengan jelas (minimal 5 karakter).",
      };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        serviceRequest: true,
      },
    });

    if (!payment) {
      return { success: false, error: "Data pembayaran tidak ditemukan" };
    }

    if (payment.paymentStatus === "PAID") {
      return {
        success: false,
        error: "Pembayaran yang sudah berstatus Lunas tidak dapat ditolak.",
      };
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentStatus: "REJECTED",
          rejectionReason: reason,
          verifiedById: admin.id,
          verifiedAt: new Date(),
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId: payment.serviceRequestId,
          actorId: admin.id,
          fromStatus: payment.serviceRequest.status,
          toStatus: payment.serviceRequest.status,
          notes: `Bukti transfer ditolak oleh Admin (${admin.name}). Alasan: ${reason}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: payment.serviceRequest.customerId,
          title: "Bukti Pembayaran Ditolak",
          message: `Bukti pembayaran untuk servis ${payment.serviceRequest.serviceNumber} ditolak. Alasan: "${reason}". Silakan periksa dan unggah kembali bukti transfer yang valid.`,
          link: `/customer/tracking?search=${payment.serviceRequest.serviceNumber}`,
          type: "PAYMENT",
        },
      }),
    ]);

    revalidatePath("/admin/pembayaran");
    revalidatePath(`/admin/servis/${payment.serviceRequestId}`);
    revalidatePath("/customer/tracking");
    revalidatePath(`/customer/tracking?search=${payment.serviceRequest.serviceNumber}`);
    revalidatePath(`/customer/riwayat/${payment.serviceRequestId}`);

    return {
      success: true,
      message: "Bukti pembayaran ditolak. Pemberitahuan telah dikirimkan ke customer.",
    };
  } catch (error) {
    console.error("Reject payment error:", error);
    return { success: false, error: "Gagal menolak pembayaran" };
  }
}

export async function updateStorePaymentSettingsAction(formData: FormData) {
  try {
    await requireAuth(["ADMIN"]);

    const storeName = ((formData.get("storeName") as string) || "").trim();
    const storeAddress = ((formData.get("storeAddress") as string) || "").trim();
    const storePhone = ((formData.get("storePhone") as string) || "").trim();
    const storeEmail = ((formData.get("storeEmail") as string) || "").trim();
    const bankName = ((formData.get("bankName") as string) || "").trim();
    const bankAccountNumber = ((formData.get("bankAccountNumber") as string) || "").trim();
    const bankAccountHolder = ((formData.get("bankAccountHolder") as string) || "").trim();
    const qrisMerchantName = ((formData.get("qrisMerchantName") as string) || "").trim();
    const qrisImageUrl = ((formData.get("qrisImageUrl") as string) || "").trim();
    const warrantyTerms = ((formData.get("warrantyTerms") as string) || "").trim();

    if (!bankName || !bankAccountNumber || !bankAccountHolder) {
      return {
        success: false,
        error: "Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening wajib diisi.",
      };
    }

    await prisma.storePaymentSetting.upsert({
      where: { id: "default" },
      update: {
        storeName: storeName || "ServisKu Workshop",
        storeAddress: storeAddress || "Jl. Sudirman No. 45, Jakarta Pusat",
        storePhone: storePhone || "0812-3456-7890",
        storeEmail: storeEmail || "layanan@servisku.com",
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        qrisMerchantName: qrisMerchantName || "ServisKu / ALIF NOOR RAHMAN HAMID",
        qrisImageUrl: qrisImageUrl || "/images/qris-merchant.png",
        warrantyTerms:
          warrantyTerms ||
          "Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.",
      },
      create: {
        id: "default",
        storeName: storeName || "ServisKu Workshop",
        storeAddress: storeAddress || "Jl. Sudirman No. 45, Jakarta Pusat",
        storePhone: storePhone || "0812-3456-7890",
        storeEmail: storeEmail || "layanan@servisku.com",
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        qrisMerchantName: qrisMerchantName || "ServisKu / ALIF NOOR RAHMAN HAMID",
        qrisImageUrl: qrisImageUrl || "/images/qris-merchant.png",
        warrantyTerms:
          warrantyTerms ||
          "Garansi servis & suku cadang berlaku 30 - 90 hari sesuai jenis tindakan. Harap simpan struk ini sebagai bukti klaim garansi resmi.",
      },
    });

    revalidatePath("/admin/pembayaran");
    revalidatePath("/customer/tracking");

    return {
      success: true,
      message: "Pengaturan rekening, QRIS, dan identitas toko berhasil disimpan!",
    };
  } catch (error) {
    console.error("Update store payment settings error:", error);
    return { success: false, error: "Gagal menyimpan pengaturan pembayaran" };
  }
}
