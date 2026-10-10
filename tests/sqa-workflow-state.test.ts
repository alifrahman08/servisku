import { describe, it, expect } from "vitest";
import {
  isValidStatusTransition,
  VALID_SERVICE_STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
} from "../src/lib/validations/service";

describe("SQA Modul 4: Pengujian State Machine & Workflow Transisi Servis", () => {
  describe("1. Validitas Status Resmi Aplikasi", () => {
    it("Semua status yang digunakan didefinisikan secara valid", () => {
      const expectedStatuses = [
        "PENDING",
        "ASSIGNED",
        "IN_DIAGNOSIS",
        "WAITING_FOR_APPROVAL",
        "IN_REPAIR",
        "WAITING_FOR_PARTS",
        "REPAIR_COMPLETED",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "CANCELLED",
      ];
      expect(VALID_SERVICE_STATUSES).toEqual(expectedStatuses);
    });

    it("Status sembarangan / typo ditolak oleh sistem", () => {
      const invalidStatuses = ["SEDANG_DIBENERIN", "OK", "SELESAI_DONG", "UNKNOWN"];
      invalidStatuses.forEach((st) => {
        expect(VALID_SERVICE_STATUSES.includes(st as any)).toBe(false);
      });
    });
  });

  describe("2. Transisi Status Valid (Alur Kerja Standar)", () => {
    it("PENDING -> ASSIGNED (Admin menugaskan teknisi)", () => {
      expect(isValidStatusTransition("PENDING", "ASSIGNED")).toBe(true);
    });

    it("ASSIGNED -> IN_DIAGNOSIS (Teknisi menerima tugas)", () => {
      expect(isValidStatusTransition("ASSIGNED", "IN_DIAGNOSIS")).toBe(true);
    });

    it("IN_DIAGNOSIS -> WAITING_FOR_APPROVAL (Perlu persetujuan biaya)", () => {
      expect(isValidStatusTransition("IN_DIAGNOSIS", "WAITING_FOR_APPROVAL")).toBe(true);
    });

    it("WAITING_FOR_APPROVAL -> IN_REPAIR (Customer menyetujui biaya)", () => {
      expect(isValidStatusTransition("WAITING_FOR_APPROVAL", "IN_REPAIR")).toBe(true);
    });

    it("IN_REPAIR -> WAITING_FOR_PARTS (Teknisi menunggu suku cadang)", () => {
      expect(isValidStatusTransition("IN_REPAIR", "WAITING_FOR_PARTS")).toBe(true);
    });

    it("WAITING_FOR_PARTS -> IN_REPAIR (Suku cadang tiba)", () => {
      expect(isValidStatusTransition("WAITING_FOR_PARTS", "IN_REPAIR")).toBe(true);
    });

    it("IN_REPAIR -> REPAIR_COMPLETED (Teknisi menyelesaikan perbaikan)", () => {
      expect(isValidStatusTransition("IN_REPAIR", "REPAIR_COMPLETED")).toBe(true);
    });

    it("REPAIR_COMPLETED -> READY_FOR_PICKUP (Admin verifikasi QC & siap ambil)", () => {
      expect(isValidStatusTransition("REPAIR_COMPLETED", "READY_FOR_PICKUP")).toBe(true);
    });

    it("READY_FOR_PICKUP -> COMPLETED (Pembayaran lunas kasir & unit diserahkan)", () => {
      expect(isValidStatusTransition("READY_FOR_PICKUP", "COMPLETED")).toBe(true);
    });

    it("PENDING -> CANCELLED (Customer/Admin membatalkan sebelum dikerjakan)", () => {
      expect(isValidStatusTransition("PENDING", "CANCELLED")).toBe(true);
    });
  });

  describe("3. Transisi Status Tidak Valid (Negatif Testing)", () => {
    it("COMPLETED tidak boleh diubah kembali (Terminal State)", () => {
      expect(isValidStatusTransition("COMPLETED", "PENDING")).toBe(false);
      expect(isValidStatusTransition("COMPLETED", "IN_REPAIR")).toBe(false);
      expect(isValidStatusTransition("COMPLETED", "CANCELLED")).toBe(false);
    });

    it("CANCELLED tidak boleh diubah kembali (Terminal State)", () => {
      expect(isValidStatusTransition("CANCELLED", "IN_REPAIR")).toBe(false);
      expect(isValidStatusTransition("CANCELLED", "COMPLETED")).toBe(false);
    });

    it("Lompatan status yang tidak logis ditolak", () => {
      expect(isValidStatusTransition("PENDING", "COMPLETED")).toBe(false);
      expect(isValidStatusTransition("PENDING", "REPAIR_COMPLETED")).toBe(false);
      expect(isValidStatusTransition("IN_REPAIR", "ASSIGNED")).toBe(false);
    });
  });
});
