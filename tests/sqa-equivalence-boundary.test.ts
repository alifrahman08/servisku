import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  validatePrice,
  PRICE_RULES,
  serviceRequestSchema,
} from "../src/lib/validations/service";

// Schemas mirroring authentication validation
const emailSchema = z.string().email("Format email tidak valid");
const passwordSchema = z.string().min(6, "Password minimal 6 karakter");
const serviceNumberRegex = /^SRV-\d{8}-\d{4}$/;

describe("SQA Modul 1: Equivalence Partitioning (EP) Tests", () => {
  describe("1. Validasi Email (EP)", () => {
    it("Valid Partition: Menerima format email standar yang valid", () => {
      const validEmails = [
        "customer@gmail.com",
        "budi.santoso@servisku.com",
        "user_123@domain.co.id",
      ];
      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it("Invalid Partition: Menolak email tanpa @ atau domain", () => {
      const invalidEmails = [
        "bukan-email",
        "customer@",
        "@domain.com",
        "user@domain",
        "",
      ];
      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("2. Validasi Konfirmasi Password (EP)", () => {
    const passwordMatchSchema = z
      .object({
        password: z.string().min(6),
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Konfirmasi password tidak cocok",
      });

    it("Valid Partition: Password dan konfirmasi cocok", () => {
      const res = passwordMatchSchema.safeParse({
        password: "rahasia123",
        confirmPassword: "rahasia123",
      });
      expect(res.success).toBe(true);
    });

    it("Invalid Partition: Password dan konfirmasi tidak cocok", () => {
      const res = passwordMatchSchema.safeParse({
        password: "rahasia123",
        confirmPassword: "berbeda123",
      });
      expect(res.success).toBe(false);
    });
  });

  describe("3. Validasi Nomor Tiket Servis (EP)", () => {
    it("Valid Partition: Format unik SRV-YYYYMMDD-XXXX", () => {
      const validNumbers = [
        "SRV-20261011-1234",
        "SRV-20260101-9999",
      ];
      validNumbers.forEach((sn) => {
        expect(serviceNumberRegex.test(sn)).toBe(true);
      });
    });

    it("Invalid Partition: Format nomor servis tidak sesuai aturan", () => {
      const invalidNumbers = [
        "12345",
        "SRV-INVALID",
        "SRV-2026101-123",
        "",
      ];
      invalidNumbers.forEach((sn) => {
        expect(serviceNumberRegex.test(sn)).toBe(false);
      });
    });
  });
});

describe("SQA Modul 2: Boundary Value Analysis (BVA) Tests", () => {
  describe("1. BVA Panjang Password (Min: 6)", () => {
    it("Nilai di bawah batas minimum (5 karakter) -> GAGAL", () => {
      const res = passwordSchema.safeParse("12345");
      expect(res.success).toBe(false);
    });

    it("Nilai tepat pada batas minimum (6 karakter) -> LULUS", () => {
      const res = passwordSchema.safeParse("123456");
      expect(res.success).toBe(true);
    });

    it("Nilai satu di atas batas minimum (7 karakter) -> LULUS", () => {
      const res = passwordSchema.safeParse("1234567");
      expect(res.success).toBe(true);
    });
  });

  describe("2. BVA Panjang Keluhan Servis (Min: 5, Max: 1000)", () => {
    const baseRequest = {
      deviceType: "LAPTOP" as const,
      brand: "Asus",
      model: "ROG Strix",
      initialCondition: "Layar mulus, lecet pemakaian",
    };

    it("Nilai kosong (0 karakter) -> GAGAL", () => {
      const res = serviceRequestSchema.safeParse({
        ...baseRequest,
        complaint: "",
      });
      expect(res.success).toBe(false);
    });

    it("Satu nilai di bawah batas minimum (4 karakter) -> GAGAL", () => {
      const res = serviceRequestSchema.safeParse({
        ...baseRequest,
        complaint: "Mati",
      });
      expect(res.success).toBe(false);
    });

    it("Nilai tepat pada batas minimum (5 karakter) -> LULUS", () => {
      const res = serviceRequestSchema.safeParse({
        ...baseRequest,
        complaint: "Rusak",
      });
      expect(res.success).toBe(true);
    });

    it("Nilai tepat pada batas maksimum (1000 karakter) -> LULUS", () => {
      const res = serviceRequestSchema.safeParse({
        ...baseRequest,
        complaint: "A".repeat(1000),
      });
      expect(res.success).toBe(true);
    });

    it("Satu nilai di atas batas maksimum (1001 karakter) -> GAGAL", () => {
      const res = serviceRequestSchema.safeParse({
        ...baseRequest,
        complaint: "A".repeat(1001),
      });
      expect(res.success).toBe(false);
    });
  });

  describe("3. BVA Aturan Numerik Harga / Biaya (Min: 10.000, Max: 50.000.000)", () => {
    it("Nilai kosong / null -> Ditolak", () => {
      expect(validatePrice("").isValid).toBe(false);
      expect(validatePrice(null).isValid).toBe(false);
      expect(validatePrice(undefined).isValid).toBe(false);
    });

    it("Teks alfabet bukan angka -> Ditolak", () => {
      const res = validatePrice("sepuluh ribu");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("harus berupa bilangan bulat");
    });

    it("Nilai desimal pecahan (10000.5) -> Ditolak (harus integer)", () => {
      const res = validatePrice("10000.50");
      expect(res.isValid).toBe(false);
    });

    it("Nilai negatif (-1000) -> Ditolak", () => {
      const res = validatePrice("-1000");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("negatif");
    });

    it("Nilai nol (0) -> Ditolak (di bawah minimum)", () => {
      const res = validatePrice("0");
      expect(res.isValid).toBe(false);
    });

    it("Satu nilai di bawah batas minimum (Rp 9.999) -> Ditolak", () => {
      const res = validatePrice("9999");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("minimal adalah Rp 10.000");
    });

    it("Nilai tepat pada batas minimum (Rp 10.000) -> Diterima", () => {
      const res = validatePrice("10000");
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(10000);
    });

    it("Nilai wajar di dalam rentang (Rp 350.000) -> Diterima", () => {
      const res = validatePrice("350000");
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(350000);
    });

    it("Nilai tepat pada batas maksimum (Rp 50.000.000) -> Diterima", () => {
      const res = validatePrice("50000000");
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(50000000);
    });

    it("Satu nilai di atas batas maksimum (Rp 50.000.001) -> Ditolak", () => {
      const res = validatePrice("50000001");
      expect(res.isValid).toBe(false);
      expect(res.error).toContain("maksimal adalah Rp 50.000.000");
    });
  });
});
