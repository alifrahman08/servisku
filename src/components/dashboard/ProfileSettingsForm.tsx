"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateProfileAction, changePasswordAction } from "@/actions/auth";
import { toast } from "sonner";
import { User, Lock, Mail, Phone, MapPin, Save, ShieldCheck } from "lucide-react";

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: string;
  };
}

export function ProfileSettingsForm({ user }: UserProfileProps) {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUpdatingProfile(true);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfileAction(formData);
    setIsUpdatingProfile(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memperbarui profil");
      return;
    }

    toast.success(res.message);
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsChangingPassword(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await changePasswordAction(formData);
    setIsChangingPassword(false);

    if (!res.success) {
      toast.error(res.error || "Gagal mengganti password");
      return;
    }

    toast.success(res.message);
    form.reset();
  }

  return (
    <div className="space-y-6">
      {/* 1. INFORMASI DASAR */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Informasi Pribadi & Kontak</h2>
            <p className="text-xs text-slate-500">Perbarui nama lengkap, nomor WhatsApp, dan alamat</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Nama Lengkap</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={user.name}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Alamat Email (Akun)</label>
              <input
                type="email"
                disabled
                defaultValue={user.email}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-500 bg-slate-50 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Email akun terkunci untuk keamanan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Nomor Telepon (WhatsApp)</label>
              <input
                type="tel"
                name="phone"
                defaultValue={user.phone || ""}
                placeholder="08123456789"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Alamat Lengkap</label>
              <input
                type="text"
                name="address"
                defaultValue={user.address || ""}
                placeholder="Jl. Mawar No. 12, Jakarta"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm" isLoading={isUpdatingProfile} className="gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" />
              Simpan Perubahan Profil
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. GANTI PASSWORD */}
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Keamanan & Ganti Password</h2>
            <p className="text-xs text-slate-500">Wajib verifikasi password saat ini sebelum mengubah</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Password Saat Ini</label>
            <input
              type="password"
              name="currentPassword"
              required
              placeholder="••••••••"
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Password Baru</label>
              <input
                type="password"
                name="newPassword"
                required
                placeholder="Minimal 6 karakter"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Konfirmasi Password Baru</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Ulangi password baru"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isChangingPassword}
              className="gap-1.5 text-xs text-slate-800"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Perbarui Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
