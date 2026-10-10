import { z } from "zod";

export const VALID_SERVICE_STATUSES = [
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
] as const;

export type ServiceStatus = (typeof VALID_SERVICE_STATUSES)[number];

// Numeric business boundaries
export const PRICE_RULES = {
  MIN_SERVICE_PRICE: 10_000,          // Rp 10.000 (batas minimum biaya jasa/pengecekan)
  MAX_SERVICE_PRICE: 50_000_000,      // Rp 50.000.000 (batas maksimum perbaikan laptop/HP)
  MAX_PAYMENT_AMOUNT: 100_000_000,    // Rp 100.000.000 (batas maksimum transaksi kasir)
};

// Numeric validation helper (Boundary Value Analysis & Equivalence Partitioning)
export function validatePrice(
  value: unknown,
  min: number = PRICE_RULES.MIN_SERVICE_PRICE,
  max: number = PRICE_RULES.MAX_SERVICE_PRICE
): { isValid: boolean; value?: number; error?: string } {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, error: "Harga/biaya tidak boleh kosong" };
  }

  const strVal = String(value).trim();

  // Reject decimal / non-integer formats (e.g. 15000.50 or 15,000)
  if (!/^-?\d+$/.test(strVal)) {
    return { isValid: false, error: "Harga harus berupa bilangan bulat tanpa desimal atau huruf" };
  }

  const num = parseInt(strVal, 10);

  if (isNaN(num)) {
    return { isValid: false, error: "Harga harus berupa angka yang valid" };
  }

  if (num < 0) {
    return { isValid: false, error: "Harga tidak boleh bernilai negatif" };
  }

  if (num < min) {
    return {
      isValid: false,
      error: `Harga minimal adalah Rp ${min.toLocaleString("id-ID")}`,
    };
  }

  if (num > max) {
    return {
      isValid: false,
      error: `Harga maksimal adalah Rp ${max.toLocaleString("id-ID")}`,
    };
  }

  return { isValid: true, value: num };
}

// Service request creation schema
export const serviceRequestSchema = z.object({
  deviceType: z.enum(["LAPTOP", "SMARTPHONE"], {
    errorMap: () => ({ message: "Jenis perangkat harus LAPTOP atau SMARTPHONE" }),
  }),
  brand: z
    .string()
    .trim()
    .min(2, "Merek perangkat minimal 2 karakter")
    .max(50, "Merek perangkat maksimal 50 karakter"),
  model: z
    .string()
    .trim()
    .min(2, "Model/seri perangkat minimal 2 karakter")
    .max(50, "Model/seri perangkat maksimal 50 karakter"),
  complaint: z
    .string()
    .trim()
    .min(5, "Keluhan kerusakan minimal 5 karakter")
    .max(1000, "Keluhan kerusakan maksimal 1000 karakter"),
  initialCondition: z
    .string()
    .trim()
    .min(3, "Kondisi fisik perangkat minimal 3 karakter")
    .max(500, "Kondisi fisik perangkat maksimal 500 karakter"),
  serialNumber: z.string().trim().max(100, "Nomor seri maksimal 100 karakter").optional().nullable(),
  handoverMethod: z.enum(["DROP_OFF", "PICKUP"]).default("DROP_OFF"),
});

// Allowed State Machine transitions for SQA Workflow Verification
export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_DIAGNOSIS", "CANCELLED"],
  IN_DIAGNOSIS: ["WAITING_FOR_APPROVAL", "IN_REPAIR", "CANCELLED"],
  WAITING_FOR_APPROVAL: ["IN_REPAIR", "CANCELLED"],
  IN_REPAIR: ["WAITING_FOR_PARTS", "REPAIR_COMPLETED", "CANCELLED"],
  WAITING_FOR_PARTS: ["IN_REPAIR", "CANCELLED"],
  REPAIR_COMPLETED: ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

export function isValidStatusTransition(fromStatus: string, toStatus: string): boolean {
  if (fromStatus === toStatus) return true; // Idempotent or notes update
  const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus];
  if (!allowed) return false;
  return allowed.includes(toStatus);
}
