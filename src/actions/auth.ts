"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { setSessionCookie, clearSessionCookie, getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  terms: z.boolean().refine((val) => val === true, "Anda harus menyetujui syarat layanan"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export async function loginAction(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Input tidak valid",
      };
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: "Email atau password salah",
      };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: "Akun Anda dinonaktifkan. Silakan hubungi admin.",
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: "Email atau password salah",
      };
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    let redirectUrl = "/customer";
    if (user.role === "ADMIN") redirectUrl = "/admin";
    else if (user.role === "TECHNICIAN") redirectUrl = "/teknisi";

    return {
      success: true,
      role: user.role,
      redirectUrl,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan pada server saat login",
    };
  }
}

export async function registerAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      terms: formData.get("terms") === "on" || formData.get("terms") === "true",
    };

    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Data formulir tidak valid",
      };
    }

    const { name, email, phone, password } = parsed.data;

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return {
        success: false,
        error: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user strictly as CUSTOMER
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        role: "CUSTOMER", // Public registration is strictly customer
        isActive: true,
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: "Selamat Datang di ServisKu!",
        message: "Akun Anda berhasil dibuat. Anda dapat langsung mengajukan servis perangkat Anda.",
        link: "/customer/ajukan",
        type: "WELCOME",
      },
    });

    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return {
      success: true,
      redirectUrl: "/customer",
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Gagal mendaftarkan akun. Silakan coba lagi.",
    };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  return { success: true, redirectUrl: "/" };
}

export async function requestPasswordResetAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Masukkan email yang valid" };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Security practice: Don't reveal if email is not found
    if (!user) {
      return {
        success: true,
        message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda.",
      };
    }

    // Invalidate previous tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forgot-password/reset?token=${token}`;

    // Development local logger for testability
    console.log("=========================================");
    console.log(`[EMAIL DISPATCHER - DEV LOG]`);
    console.log(`To: ${user.email}`);
    console.log(`Subject: Reset Password Akun ServisKu`);
    console.log(`Reset Link: ${resetLink}`);
    console.log(`Token expires at: ${expiresAt.toISOString()}`);
    console.log("=========================================");

    return {
      success: true,
      message: "Jika email terdaftar, instruksi reset password telah dikirim ke email Anda.",
      devResetLink: process.env.NODE_ENV !== "production" ? resetLink : undefined,
    };
  } catch (error) {
    console.error("Reset password request error:", error);
    return { success: false, error: "Gagal memproses permintaan reset password" };
  }
}

export async function resetPasswordAction(formData: FormData) {
  try {
    const token = formData.get("token") as string;
    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token) {
      return { success: false, error: "Token reset password tidak valid" };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Konfirmasi password tidak cocok" };
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      return {
        success: false,
        error: "Token reset password sudah kedaluwarsa atau tidak valid",
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { isUsed: true },
      }),
    ]);

    return {
      success: true,
      message: "Password berhasil diperbarui. Silakan masuk menggunakan password baru.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Gagal memperbarui password" };
  }
}

export async function updateProfileAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Sesi tidak ditemukan" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Nama minimal 2 karakter" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
      },
    });

    revalidatePath("/customer/profil");
    revalidatePath("/admin/profil");
    revalidatePath("/teknisi/profil");

    return { success: true, message: "Profil berhasil diperbarui" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Gagal memperbarui profil" };
  }
}

export async function changePasswordAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Sesi tidak ditemukan" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword) {
      return { success: false, error: "Semua kolom password wajib diisi" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Password baru minimal 6 karakter" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Konfirmasi password tidak cocok" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) return { success: false, error: "User tidak ditemukan" };

    const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Password saat ini tidak sesuai" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { success: true, message: "Password berhasil diganti" };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Gagal mengganti password" };
  }
}
