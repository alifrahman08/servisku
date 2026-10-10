"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { validatePrice, PRICE_RULES } from "@/lib/validations/service";

export async function acceptTaskAction(serviceRequestId: string) {
  try {
    const tech = await requireAuth(["TECHNICIAN"]);

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!service) return { success: false, error: "Servis tidak ditemukan" };
    if (service.technicianId !== tech.id) {
      return { success: false, error: "Anda tidak memiliki wewenang pada servis ini" };
    }

    if (service.status !== "ASSIGNED") {
      return { success: false, error: "Status saat ini tidak dapat diterima ulang" };
    }

    await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: { status: "IN_DIAGNOSIS" },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: tech.id,
          fromStatus: "ASSIGNED",
          toStatus: "IN_DIAGNOSIS",
          notes: `Tugas diterima oleh ${tech.name}. Proses pemeriksaan dan diagnosis hardware dimulai.`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: service.customerId,
          title: "Perangkat Sedang Diperiksa",
          message: `Teknisi ${tech.name} telah mulai melakukan pemeriksaan pada ${service.brand} ${service.model}.`,
          link: `/customer/tracking?search=${service.serviceNumber}`,
          type: "STATUS_UPDATE",
        },
      }),
    ]);

    revalidatePath("/teknisi");
    revalidatePath("/teknisi/tugas");
    revalidatePath(`/teknisi/tugas/${serviceRequestId}`);
    return { success: true, message: "Tugas berhasil diterima dan masuk tahap diagnosis" };
  } catch (error) {
    console.error("Accept task error:", error);
    return { success: false, error: "Gagal memproses penerimaan tugas" };
  }
}

export async function submitDiagnosisAction(formData: FormData) {
  try {
    const tech = await requireAuth(["TECHNICIAN"]);
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const summary = formData.get("summary") as string;
    const detailedFindings = formData.get("detailedFindings") as string;
    const recommendedAction = formData.get("recommendedAction") as string;
    const breakdown = (formData.get("breakdown") as string) || null;
    const needsApproval = formData.get("needsApproval") === "true";

    let estimatedAmount: number | null = null;
    if (needsApproval) {
      const priceCheck = validatePrice(
        formData.get("estimatedAmount"),
        PRICE_RULES.MIN_SERVICE_PRICE,
        PRICE_RULES.MAX_SERVICE_PRICE
      );
      if (!priceCheck.isValid) {
        return { success: false, error: priceCheck.error };
      }
      estimatedAmount = priceCheck.value!;
    }

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!service) return { success: false, error: "Servis tidak ditemukan" };
    if (service.technicianId !== tech.id) {
      return { success: false, error: "Anda tidak memiliki wewenang pada servis ini" };
    }

    if (!summary || !detailedFindings || !recommendedAction) {
      return { success: false, error: "Semua form diagnosis wajib diisi lengkap" };
    }

    const nextStatus = needsApproval && estimatedAmount ? "WAITING_FOR_APPROVAL" : "IN_REPAIR";

    const ops: any[] = [
      prisma.diagnosis.upsert({
        where: { serviceRequestId },
        create: {
          serviceRequestId,
          technicianId: tech.id,
          summary,
          detailedFindings,
          recommendedAction,
        },
        update: {
          summary,
          detailedFindings,
          recommendedAction,
        },
      }),
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: {
          status: nextStatus,
          ...(estimatedAmount && { estimatedCost: estimatedAmount }),
        },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: tech.id,
          fromStatus: service.status,
          toStatus: nextStatus,
          notes: `Diagnosis selesai: ${summary}.${needsApproval ? " Menunggu konfirmasi persetujuan estimasi biaya dari customer." : " Lanjut proses perbaikan."}`,
        },
      }),
    ];

    if (needsApproval && estimatedAmount) {
      ops.push(
        prisma.costEstimate.create({
          data: {
            serviceRequestId,
            estimatedAmount,
            breakdown,
            status: "PENDING",
          },
        }),
        prisma.notification.create({
          data: {
            userId: service.customerId,
            title: "Persetujuan Estimasi Biaya Diperlukan",
            message: `Hasil pemeriksaan untuk ${service.serviceNumber} telah selesai dengan estimasi biaya Rp ${estimatedAmount.toLocaleString("id-ID")}. Silakan periksa rincian dan berikan persetujuan.`,
            link: `/customer/tracking?search=${service.serviceNumber}`,
            type: "APPROVAL_REQUEST",
          },
        })
      );
    }

    await prisma.$transaction(ops);

    revalidatePath("/teknisi");
    revalidatePath("/teknisi/tugas");
    revalidatePath(`/teknisi/tugas/${serviceRequestId}`);
    return { success: true, message: "Hasil diagnosis berhasil disimpan" };
  } catch (error) {
    console.error("Submit diagnosis error:", error);
    return { success: false, error: "Gagal menyimpan hasil diagnosis" };
  }
}

export async function addRepairLogAction(formData: FormData) {
  try {
    const tech = await requireAuth(["TECHNICIAN"]);
    const serviceRequestId = formData.get("serviceRequestId") as string;
    const actionTaken = formData.get("actionTaken") as string;
    const partsReplaced = formData.get("partsReplaced") as string || null;
    const notes = formData.get("notes") as string || null;
    const statusUpdate = formData.get("statusUpdate") as string || "IN_REPAIR";

    const service = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    });

    if (!service) return { success: false, error: "Servis tidak ditemukan" };
    if (service.technicianId !== tech.id) {
      return { success: false, error: "Anda tidak memiliki wewenang pada servis ini" };
    }

    if (!actionTaken) {
      return { success: false, error: "Tindakan perbaikan wajib dicatat" };
    }

    const ops: any[] = [
      prisma.repairLog.create({
        data: {
          serviceRequestId,
          technicianId: tech.id,
          actionTaken,
          partsReplaced,
          notes,
        },
      }),
      prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: { status: statusUpdate },
      }),
      prisma.statusHistory.create({
        data: {
          serviceRequestId,
          actorId: tech.id,
          fromStatus: service.status,
          toStatus: statusUpdate,
          notes: `Progres perbaikan: ${actionTaken}. ${notes ? `Catatan: ${notes}` : ""}`,
        },
      }),
    ];

    if (statusUpdate === "REPAIR_COMPLETED") {
      // Notify customer and admins
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
      admins.forEach((adm) => {
        ops.push(
          prisma.notification.create({
            data: {
              userId: adm.id,
              title: "Perbaikan Selesai Menunggu QC",
              message: `Teknisi ${tech.name} telah menyelesaikan servis ${service.serviceNumber} (${service.brand} ${service.model}). Silakan verifikasi QC & status pickup.`,
              link: `/admin/servis/${service.id}`,
              type: "STATUS_UPDATE",
            },
          })
        );
      });
      ops.push(
        prisma.notification.create({
          data: {
            userId: service.customerId,
            title: "Perbaikan Telah Selesai",
            message: `Perangkat Anda (${service.brand} ${service.model}) telah selesai diperbaiki dan sedang dalam tahap pengujian QC akhir.`,
            link: `/customer/tracking?search=${service.serviceNumber}`,
            type: "STATUS_UPDATE",
          },
        })
      );
    }

    await prisma.$transaction(ops);

    revalidatePath("/teknisi");
    revalidatePath("/teknisi/tugas");
    revalidatePath(`/teknisi/tugas/${serviceRequestId}`);
    return { success: true, message: "Progres perbaikan berhasil diperbarui" };
  } catch (error) {
    console.error("Add repair log error:", error);
    return { success: false, error: "Gagal menyimpan log perbaikan" };
  }
}
