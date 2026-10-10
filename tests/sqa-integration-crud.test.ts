import { describe, it, expect, afterAll } from "vitest";
import prisma from "../src/lib/prisma";
import { generateServiceNumber } from "../src/actions/admin";

describe("SQA Modul 3: Pengujian Integrasi CRUD Data Servis", () => {
  let createdServiceId: string;
  let testCustomerId: string;
  let testTechnicianId: string;

  it("1. Persiapan data aktor (Customer & Teknisi)", async () => {
    const cust = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
    const tech = await prisma.user.findFirst({ where: { role: "TECHNICIAN" } });

    expect(cust).toBeDefined();
    expect(tech).toBeDefined();

    testCustomerId = cust!.id;
    testTechnicianId = tech!.id;
  });

  it("2. CREATE: Membuat permintaan servis baru dengan nomor unik", async () => {
    const serviceNumber = await generateServiceNumber();
    expect(serviceNumber.startsWith("SRV-")).toBe(true);

    const newService = await prisma.serviceRequest.create({
      data: {
        serviceNumber,
        customerId: testCustomerId,
        deviceType: "LAPTOP",
        brand: "Lenovo",
        model: "ThinkPad X1",
        complaint: "Layar blank dan tidak menyala saat dinyalakan",
        initialCondition: "Fisik baik, charger original",
        status: "PENDING",
      },
    });

    expect(newService.id).toBeDefined();
    expect(newService.status).toBe("PENDING");
    createdServiceId = newService.id;

    // Record initial status history
    await prisma.statusHistory.create({
      data: {
        serviceRequestId: newService.id,
        actorId: testCustomerId,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Uji otomatis pendaftaran tiket",
      },
    });
  });

  it("3. READ: Membaca data servis & memeriksa isolasi customer", async () => {
    const fetched = await prisma.serviceRequest.findUnique({
      where: { id: createdServiceId },
      include: { customer: true, statusHistories: true },
    });

    expect(fetched).not.toBeNull();
    expect(fetched!.brand).toBe("Lenovo");
    expect(fetched!.customerId).toBe(testCustomerId);
    expect(fetched!.statusHistories.length).toBeGreaterThan(0);
  });

  it("4. UPDATE: Penugasan teknisi & pembaruan status ke ASSIGNED", async () => {
    const updated = await prisma.serviceRequest.update({
      where: { id: createdServiceId },
      data: {
        technicianId: testTechnicianId,
        status: "ASSIGNED",
      },
    });

    expect(updated.technicianId).toBe(testTechnicianId);
    expect(updated.status).toBe("ASSIGNED");

    await prisma.statusHistory.create({
      data: {
        serviceRequestId: createdServiceId,
        actorId: testTechnicianId,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Uji otomatis penugasan teknisi",
      },
    });
  });

  it("5. DELETE / CANCEL: Pembatalan servis sesuai aturan bisnis", async () => {
    const cancelled = await prisma.serviceRequest.update({
      where: { id: createdServiceId },
      data: {
        status: "CANCELLED",
        isCancelled: true,
        cancellationReason: "Uji coba pembatalan servis",
      },
    });

    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.isCancelled).toBe(true);
  });

  afterAll(async () => {
    if (createdServiceId) {
      await prisma.statusHistory.deleteMany({
        where: { serviceRequestId: createdServiceId },
      });
      await prisma.serviceRequest.delete({
        where: { id: createdServiceId },
      });
    }
    await prisma.$disconnect();
  });
});
