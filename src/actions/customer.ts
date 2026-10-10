"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateServiceNumber } from "@/actions/admin";
import { revalidatePath } from "next/cache";
import { serviceRequestSchema } from "@/lib/validations/service";

export async function createServiceRequestAction(formData: FormData) {
  try {
    const user = await requireAuth(["CUSTOMER"]);

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

    const serviceNumber = await generateServiceNumber();

    // Check if service catalog selected to get base price estimate
    let estimatedCost: number | null = null;
    if (serviceTypeId) {
      const catalog = await prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
      if (catalog) estimatedCost = catalog.basePrice;
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        serviceNumber,
        customerId: user.id,
        deviceType,
        brand,
        model,
        serialNumber,
        complaint,
        initialCondition,
        serviceTypeId,
        handoverMethod,
        status: "PENDING",
        priority: "NORMAL",
        estimatedCost,
      },
    });

    // Record initial status history
    await prisma.statusHistory.create({
      data: {
        serviceRequestId: newRequest.id,
        actorId: user.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: `Permintaan servis didaftarkan oleh ${user.name}. Menunggu verifikasi admin.`,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    for (const adm of admins) {
      await prisma.notification.create({
        data: {
          userId: adm.id,
          title: "Permintaan Servis Baru Masuk",
          message: `${user.name} mengajukan tiket ${serviceNumber} (${brand} ${model}).`,
          link: `/admin/servis/${newRequest.id}`,
          type: "NEW_REQUEST",
        },
      });
    }

    revalidatePath("/customer");
    revalidatePath("/customer/servis");
    return {
      success: true,
      serviceNumber,
      id: newRequest.id,
      message: `Permintaan servis ${serviceNumber} berhasil diajukan!`,
    };
  } catch (error) {
    console.error("Create service request error:", error);
    return { success: false, error: "Gagal mengajukan permintaan servis" };
  }
}

export async function decideCostEstimateAction(formData: FormData) {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    const estimateId = formData.get("estimateId") as string;
    const decision = formData.get("decision") as "APPROVED" | "REJECTED";
    const customerNotes = formData.get("customerNotes") as string || "";

    const estimate = await prisma.costEstimate.findUnique({
      where: { id: estimateId },
      include: {
        serviceRequest: {
          include: { technician: true },
        },
      },
    });

    if (!estimate) return { success: false, error: "Estimasi biaya tidak ditemukan" };
    if (estimate.serviceRequest.customerId !== user.id) {
      return { success: false, error: "Akses ditolak (IDOR protection)" };
    }

    if (estimate.status !== "PENDING") {
      return { success: false, error: "Estimasi biaya ini sudah pernah diputuskan sebelumnya" };
    }

    const service = estimate.serviceRequest;
    const isApproved = decision === "APPROVED";
    const newStatus = isApproved ? "IN_REPAIR" : "CANCELLED";

    const ops: any[] = [
      prisma.costEstimate.update({
        where: { id: estimateId },
        data: {
          status: decision,
          customerNotes,
          decidedAt: new Date(),
        },
      }),
      prisma.serviceRequest.update({
        where: { id: service.id },
        data: {
          status: newStatus,
          finalCost: isApproved ? estimate.estimatedAmount : null,
          isCancelled: !isApproved,
          cancellationReason: !isApproved ? customerNotes || "Dibatalkan oleh customer setelah estimasi biaya" : null,
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId: service.id,
          actorId: user.id,
          fromStatus: service.status,
          toStatus: newStatus,
          notes: isApproved
            ? `Customer menyetujui estimasi biaya Rp ${estimate.estimatedAmount.toLocaleString("id-ID")}. ${customerNotes ? `Catatan: ${customerNotes}` : ""}`
            : `Customer menolak estimasi biaya. Alasan: ${customerNotes || "Biaya di luar perkiraan"}.`,
        },
      }),
    ];

    // Notify technician
    if (service.technicianId) {
      ops.push(
        prisma.notification.create({
          data: {
            userId: service.technicianId,
            title: isApproved ? "Biaya Disetujui Customer" : "Pengerjaan Dibatalkan Customer",
            message: `Customer ${isApproved ? "menyetujui" : "menolak"} estimasi biaya servis ${service.serviceNumber} (${service.brand} ${service.model}).`,
            link: `/teknisi/tugas/${service.id}`,
            type: isApproved ? "APPROVAL_REQUEST" : "STATUS_UPDATE",
          },
        })
      );
    }

    await prisma.$transaction(ops);

    revalidatePath("/customer");
    revalidatePath("/customer/servis");
    revalidatePath("/customer/tracking");
    return {
      success: true,
      message: isApproved ? "Persetujuan biaya berhasil dikonfirmasi" : "Permintaan servis telah dibatalkan",
    };
  } catch (error) {
    console.error("Decide cost estimate error:", error);
    return { success: false, error: "Gagal memproses persetujuan biaya" };
  }
}

export async function cancelServiceByCustomerAction(formData: FormData) {
  try {
    const user = await requireAuth(["CUSTOMER"]);
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const reason = formData.get("reason") as string || "Dibatalkan oleh customer";

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!service) return { success: false, error: "Servis tidak ditemukan" };
    if (service.customerId !== user.id) {
      return { success: false, error: "Akses ditolak" };
    }

    // Business rule: Can only cancel if PENDING or WAITING_FOR_APPROVAL
    if (!["PENDING", "WAITING_FOR_APPROVAL", "ASSIGNED"].includes(service.status)) {
      return {
        success: false,
        error: `Servis dengan status '${service.status}' sedang dalam proses pengerjaan dan tidak dapat dibatalkan sepihak. Hubungi admin/teknisi.`,
      };
    }

    await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: {
          status: "CANCELLED",
          isCancelled: true,
          cancellationReason: reason,
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: user.id,
          fromStatus: service.status,
          toStatus: "CANCELLED",
          notes: `Dibatalkan oleh customer. Alasan: ${reason}`,
        },
      }),
    ]);

    revalidatePath("/customer");
    revalidatePath("/customer/servis");
    return { success: true, message: "Permintaan servis berhasil dibatalkan" };
  } catch (error) {
    console.error("Cancel service error:", error);
    return { success: false, error: "Gagal membatalkan servis" };
  }
}
