"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import {
  VALID_SERVICE_STATUSES,
  isValidStatusTransition,
  validatePrice,
  PRICE_RULES,
  serviceRequestSchema,
} from "@/lib/validations/service";

// Unique service number generator
export async function generateServiceNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SRV-${dateStr}-${randomSuffix}`;
}

export async function assignTechnicianAction(formData: FormData) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const technicianId = formData.get("technicianId") as string;
    const adminNotes = formData.get("notes") as string || "Ditugaskan oleh administrator";

    if (!serviceRequestId || !technicianId) {
      return { success: false, error: "ID Servis dan Teknisi wajib dipilih" };
    }

    const [service, technician] = await Promise.all([
      prisma.serviceRequest.findUnique({ where: { id: serviceRequestId } }),
      prisma.user.findUnique({
        where: { id: technicianId, role: "TECHNICIAN", isActive: true },
        include: { technicianProfile: true },
      }),
    ]);

    if (!service) return { success: false, error: "Permintaan servis tidak ditemukan" };
    if (!technician) return { success: false, error: "Teknisi tidak ditemukan atau tidak aktif" };

    const oldStatus = service.status;
    const newStatus = oldStatus === "PENDING" ? "ASSIGNED" : oldStatus;

    await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: {
          technicianId,
          status: newStatus,
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: admin.id,
          fromStatus: oldStatus,
          toStatus: newStatus,
          notes: `Penugasan kepada ${technician.name}. Catatan: ${adminNotes}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: technicianId,
          title: "Tugas Perbaikan Baru Ditugaskan",
          message: `Anda ditugaskan untuk menangani ${service.brand} ${service.model} (${service.serviceNumber}).`,
          link: `/teknisi/tugas/${service.id}`,
          type: "ASSIGNMENT",
        },
      }),
      prisma.notification.create({
        data: {
          userId: service.customerId,
          title: "Teknisi Ditugaskan",
          message: `Servis ${service.serviceNumber} telah ditugaskan kepada teknisi ${technician.name}.`,
          link: `/customer/tracking?search=${service.serviceNumber}`,
          type: "STATUS_UPDATE",
        },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/admin/servis");
    revalidatePath("/admin/penugasan");
    revalidatePath(`/admin/servis/${serviceRequestId}`);
    return { success: true, message: `Berhasil menugaskan ke ${technician.name}` };
  } catch (error) {
    console.error("Assign technician error:", error);
    return { success: false, error: "Gagal menugaskan teknisi" };
  }
}

export async function updateServiceStatusByAdmin(formData: FormData) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const newStatus = formData.get("status") as string;
    const notes = (formData.get("notes") as string) || "Pembaruan status oleh Admin";
    const estimatedCost = formData.get("estimatedCost") ? parseInt(formData.get("estimatedCost") as string, 10) : undefined;
    const finalCost = formData.get("finalCost") ? parseInt(formData.get("finalCost") as string, 10) : undefined;
    const estimatedCompletionStr = formData.get("estimatedCompletion") as string;

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!service) return { success: false, error: "Servis tidak ditemukan" };

    const fromStatus = service.status;

    // SQA Workflow & Status Validation
    if (!VALID_SERVICE_STATUSES.includes(newStatus as any)) {
      return { success: false, error: `Status '${newStatus}' tidak valid dalam sistem` };
    }

    if (!isValidStatusTransition(fromStatus, newStatus)) {
      return {
        success: false,
        error: `Transisi status dari '${fromStatus}' ke '${newStatus}' tidak diizinkan dalam alur kerja sistem`,
      };
    }

    // Validate estimatedCost if provided
    let validatedEstimatedCost: number | undefined = undefined;
    if (formData.get("estimatedCost")) {
      const priceCheck = validatePrice(formData.get("estimatedCost"));
      if (!priceCheck.isValid) return { success: false, error: priceCheck.error };
      validatedEstimatedCost = priceCheck.value;
    }

    // Validate finalCost if provided
    let validatedFinalCost: number | undefined = undefined;
    if (formData.get("finalCost")) {
      const priceCheck = validatePrice(formData.get("finalCost"));
      if (!priceCheck.isValid) return { success: false, error: priceCheck.error };
      validatedFinalCost = priceCheck.value;
    }

    const estimatedCompletion = estimatedCompletionStr ? new Date(estimatedCompletionStr) : undefined;

    await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: {
          status: newStatus,
          ...(validatedEstimatedCost !== undefined && { estimatedCost: validatedEstimatedCost }),
          ...(validatedFinalCost !== undefined && { finalCost: validatedFinalCost }),
          ...(estimatedCompletion && { estimatedCompletion }),
          isCancelled: newStatus === "CANCELLED",
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: admin.id,
          fromStatus,
          toStatus: newStatus,
          notes,
        },
      }),
      prisma.notification.create({
        data: {
          userId: service.customerId,
          title: `Status Servis Diperbarui: ${newStatus}`,
          message: `Tiket ${service.serviceNumber}: ${notes}`,
          link: `/customer/tracking?search=${service.serviceNumber}`,
          type: "STATUS_UPDATE",
        },
      }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/admin/servis");
    revalidatePath(`/admin/servis/${serviceRequestId}`);
    return { success: true, message: "Status servis berhasil diperbarui" };
  } catch (error) {
    console.error("Update service status error:", error);
    return { success: false, error: "Gagal memperbarui status servis" };
  }
}

export async function recordPaymentAction(formData: FormData) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";
    const notes = formData.get("notes") as string || "Pembayaran diterima di kasir";
    const markCompleted = formData.get("markCompleted") === "true";

    if (!serviceRequestId) {
      return { success: false, error: "ID Permintaan servis wajib disertakan" };
    }

    const priceCheck = validatePrice(
      formData.get("amount"),
      PRICE_RULES.MIN_SERVICE_PRICE,
      PRICE_RULES.MAX_PAYMENT_AMOUNT
    );
    if (!priceCheck.isValid) {
      return { success: false, error: priceCheck.error };
    }
    const amount = priceCheck.value!;

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!service) return { success: false, error: "Servis tidak ditemukan" };

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const receiptNumber = `STRUK-${yearMonth}-${Math.floor(1000 + Math.random() * 9000)}`;

    const ops: any[] = [
      prisma.payment.create({
        data: {
          serviceRequestId,
          invoiceNumber,
          receiptNumber,
          amount,
          paymentMethod,
          paymentStatus: "PAID",
          paidAt: now,
          verifiedById: admin.id,
          verifiedAt: now,
          notes,
          recordedById: admin.id,
        },
      }),
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: {
          finalCost: amount,
          ...(markCompleted && { status: "COMPLETED" }),
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: admin.id,
          fromStatus: service.status,
          toStatus: markCompleted ? "COMPLETED" : service.status,
          notes: `Pembayaran sebesar Rp ${amount.toLocaleString("id-ID")} lunas tercatat (${paymentMethod}). Invoice: ${invoiceNumber}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: service.customerId,
          title: "Pembayaran Servis Diterima",
          message: `Pembayaran sebesar Rp ${amount.toLocaleString("id-ID")} untuk servis ${service.serviceNumber} telah dikonfirmasi lunas.`,
          link: `/customer/riwayat/${service.id}`,
          type: "PAYMENT",
        },
      }),
    ];

    await prisma.$transaction(ops);

    revalidatePath("/admin");
    revalidatePath("/admin/servis");
    revalidatePath(`/admin/servis/${serviceRequestId}`);
    revalidatePath("/admin/laporan");
    return { success: true, message: "Pembayaran berhasil dicatat & disimpan" };
  } catch (error) {
    console.error("Record payment error:", error);
    return { success: false, error: "Gagal mencatat pembayaran" };
  }
}

export async function createServiceByAdminAction(formData: FormData) {
  try {
    const admin = await requireAuth(["ADMIN"]);
    const customerId = formData.get("customerId") as string;
    if (!customerId) {
      return { success: false, error: "Customer wajib dipilih" };
    }

    const rawData = {
      deviceType: formData.get("deviceType"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      serialNumber: formData.get("serialNumber") || undefined,
      complaint: formData.get("complaint"),
      initialCondition: formData.get("initialCondition"),
      handoverMethod: formData.get("handoverMethod") || "DROP_OFF",
    };

    const parsed = serviceRequestSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Data formulir tidak valid",
      };
    }

    const { deviceType, brand, model, serialNumber, complaint, initialCondition, handoverMethod } = parsed.data;
    const serviceTypeId = (formData.get("serviceTypeId") as string) || null;
    const technicianId = (formData.get("technicianId") as string) || null;
    const priority = (formData.get("priority") as string) || "NORMAL";

    const serviceNumber = await generateServiceNumber();
    const initialStatus = technicianId ? "ASSIGNED" : "PENDING";

    const newService = await prisma.serviceRequest.create({
      data: {
        serviceNumber,
        customerId,
        technicianId: technicianId || undefined,
        serviceTypeId: serviceTypeId || undefined,
        deviceType,
        brand,
        model,
        serialNumber,
        complaint,
        initialCondition,
        handoverMethod,
        priority,
        status: initialStatus,
      },
    });

    await prisma.statusHistory.create({
      data: {
        serviceRequestId: newService.id,
        actorId: admin.id,
        fromStatus: initialStatus,
        toStatus: initialStatus,
        notes: `Servis didaftarkan oleh Administrator atas nama customer.`,
      },
    });

    if (technicianId) {
      await prisma.notification.create({
        data: {
          userId: technicianId,
          title: "Tugas Baru Ditugaskan",
          message: `Admin mendaftarkan tiket baru ${serviceNumber} (${brand} ${model}) untuk Anda.`,
          link: `/teknisi/tugas/${newService.id}`,
          type: "ASSIGNMENT",
        },
      });
    }

    revalidatePath("/admin/servis");
    return { success: true, message: `Tiket ${serviceNumber} berhasil dibuat`, id: newService.id };
  } catch (error) {
    console.error("Create service by admin error:", error);
    return { success: false, error: "Gagal membuat servis baru" };
  }
}

export async function createTechnicianAction(formData: FormData) {
  try {
    await requireAuth(["ADMIN"]);
    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).toLowerCase().trim();
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const specialization = (formData.get("specialization") as string) || "ALL";
    const bio = formData.get("bio") as string || "";

    if (!name || !email || !password) {
      return { success: false, error: "Nama, email, dan password wajib diisi" };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email sudah digunakan akun lain" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "TECHNICIAN",
        isActive: true,
        technicianProfile: {
          create: {
            specialization,
            bio,
            isAvailable: true,
          },
        },
      },
    });

    revalidatePath("/admin/teknisi");
    return { success: true, message: `Teknisi ${name} berhasil didaftarkan` };
  } catch (error) {
    console.error("Create technician error:", error);
    return { success: false, error: "Gagal menambahkan teknisi" };
  }
}

export async function updateTechnicianAction(formData: FormData) {
  try {
    await requireAuth(["ADMIN"]);
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const specialization = formData.get("specialization") as string;
    const bio = formData.get("bio") as string;
    const isAvailable = formData.get("isAvailable") === "true";
    const isActive = formData.get("isActive") === "true";

    await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        isActive,
        technicianProfile: {
          upsert: {
            create: { specialization, bio, isAvailable },
            update: { specialization, bio, isAvailable },
          },
        },
      },
    });

    revalidatePath("/admin/teknisi");
    return { success: true, message: "Data teknisi berhasil diperbarui" };
  } catch (error) {
    console.error("Update technician error:", error);
    return { success: false, error: "Gagal memperbarui data teknisi" };
  }
}

export async function createOrUpdateServiceCatalogAction(formData: FormData) {
  try {
    await requireAuth(["ADMIN"]);
    const id = formData.get("id") as string || undefined;
    const name = formData.get("name") as string;
    const deviceType = formData.get("deviceType") as string;
    const description = formData.get("description") as string;
    const estimatedDuration = (formData.get("estimatedDuration") as string) || "1 - 3 Hari";
    const isActive = formData.get("isActive") === "true";

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Nama paket layanan minimal 2 karakter" };
    }

    if (!description || description.trim().length < 5) {
      return { success: false, error: "Deskripsi layanan minimal 5 karakter" };
    }

    const priceCheck = validatePrice(
      formData.get("basePrice"),
      PRICE_RULES.MIN_SERVICE_PRICE,
      PRICE_RULES.MAX_SERVICE_PRICE
    );
    if (!priceCheck.isValid) {
      return { success: false, error: priceCheck.error };
    }
    const basePrice = priceCheck.value!;

    if (id) {
      await prisma.serviceType.update({
        where: { id },
        data: { name, deviceType, description, basePrice, estimatedDuration, isActive },
      });
    } else {
      await prisma.serviceType.create({
        data: { name, deviceType, description, basePrice, estimatedDuration, isActive },
      });
    }

    revalidatePath("/admin/layanan");
    revalidatePath("/");
    return { success: true, message: "Katalog layanan berhasil disimpan" };
  } catch (error) {
    console.error("Catalog action error:", error);
    return { success: false, error: "Gagal menyimpan katalog layanan" };
  }
}

export async function toggleServiceCatalogActive(id: string, currentState: boolean) {
  try {
    await requireAuth(["ADMIN"]);
    await prisma.serviceType.update({
      where: { id },
      data: { isActive: !currentState },
    });
    revalidatePath("/admin/layanan");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengubah status layanan" };
  }
}
