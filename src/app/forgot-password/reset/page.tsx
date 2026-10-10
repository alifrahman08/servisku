"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { resetPasswordAction } from "@/actions/auth";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Token reset tidak ditemukan pada tautan.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password baru minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("token", token);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);

    const res = await resetPasswordAction(formData);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mereset password");
      toast.error(res.error || "Gagal mereset password");
      return;
    }

    setIsSuccess(true);
    toast.success("Password Anda berhasil diperbarui!");
  }

  return (
    <Card className="shadow-lg shadow-slate-200/50">
      {isSuccess ? (
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Password Diperbarui</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Kata sandi baru Anda berhasil disimpan. Silakan masuk dengan kata sandi baru tersebut.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button className="w-full">
                Masuk Sekarang
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Simpan Password Baru
            </Button>
          </form>
        </>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block">
          <BrandLogo />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Buat Password Baru
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Masukkan kata sandi baru untuk akun ServisKu Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat formulir...</div>}>
          <ResetPasswordFormContent />
        </Suspense>
      </div>
    </div>
  );
}
