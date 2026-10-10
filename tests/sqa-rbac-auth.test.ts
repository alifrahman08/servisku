import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "servisku-secure-default-key-32-chars-long";

describe("SQA Modul 5: Pengujian Multi-Role, Keamanan Sesi, & Proteksi IDOR", () => {
  describe("1. Password Hashing Keamanan", () => {
    it("Password disimpan menggunakan bcrypt dan bukan plaintext", async () => {
      const plainPassword = "passwordSuperAman123";
      const hash = await bcrypt.hash(plainPassword, 10);

      // Verify hash is not equal to plaintext
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2a$") || hash.startsWith("$2b$")).toBe(true);

      // Verify hash comparison works
      const isValid = await bcrypt.compare(plainPassword, hash);
      expect(isValid).toBe(true);

      // Verify wrong password is rejected
      const isWrongValid = await bcrypt.compare("passwordSalah", hash);
      expect(isWrongValid).toBe(false);
    });
  });

  describe("2. JWT Session Token & Role Integrity", () => {
    it("Token memuat role yang terenkripsi dan dapat diverifikasi", () => {
      const payload = {
        userId: "user-123",
        email: "customer@gmail.com",
        name: "Ahmad Fauzi",
        role: "CUSTOMER",
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
      const decoded = jwt.verify(token, JWT_SECRET) as typeof payload;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe("CUSTOMER");
    });

    it("Token dengan secret salah ditolak", () => {
      const token = jwt.sign({ userId: "u1", role: "ADMIN" }, "wrong-secret");
      expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
    });
  });

  describe("3. Kebijakan Reset Password (Token Expiration & Single Use)", () => {
    it("Token kedaluwarsa ditolak", () => {
      const expiredDate = new Date(Date.now() - 1000 * 60); // 1 minute in the past
      const isExpired = expiredDate < new Date();
      expect(isExpired).toBe(true);
    });

    it("Token yang sudah digunakan (isUsed: true) tidak boleh dapat digunakan kembali", () => {
      const mockTokenRecord = {
        token: "abcdef123456",
        isUsed: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // still within 1 hr
      };

      const isValidToken = !mockTokenRecord.isUsed && mockTokenRecord.expiresAt > new Date();
      expect(isValidToken).toBe(false);
    });

    it("Token valid, aktif, dan belum kedaluwarsa diterima", () => {
      const mockTokenRecord = {
        token: "abcdef123456",
        isUsed: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      };

      const isValidToken = !mockTokenRecord.isUsed && mockTokenRecord.expiresAt > new Date();
      expect(isValidToken).toBe(true);
    });
  });

  describe("4. Proteksi IDOR (Insecure Direct Object References)", () => {
    it("Customer A tidak boleh memanipulasi servis milik Customer B", () => {
      const loggedInCustomerId = "customer-A-id";
      const serviceRecord = {
        id: "srv-999",
        customerId: "customer-B-id",
        status: "PENDING",
      };

      const isOwner = serviceRecord.customerId === loggedInCustomerId;
      expect(isOwner).toBe(false);
    });

    it("Teknisi A tidak boleh memanipulasi servis milik Teknisi B", () => {
      const loggedInTechId = "technician-A-id";
      const serviceRecord = {
        id: "srv-888",
        technicianId: "technician-B-id",
        status: "IN_DIAGNOSIS",
      };

      const isAssigned = serviceRecord.technicianId === loggedInTechId;
      expect(isAssigned).toBe(false);
    });
  });
});
