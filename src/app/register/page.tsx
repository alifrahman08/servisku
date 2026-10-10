"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { registerAction } from "@/actions/auth";
import { toast } from "sonner";
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak cocok");
      return;
    }

    if (!terms) {
      setErrorMessage("Anda harus menyetujui syarat & ketentuan layanan");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("terms", String(terms));

    const res = await registerAction(formData);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal mendaftar");
      toast.error(res.error || "Gagal mendaftar");
      return;
    }

    toast.success("Registrasi berhasil! Selamat datang di ServisKu.");
    router.push(res.redirectUrl || "/customer");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block">
          <BrandLogo />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Buat Akun Customer
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Daftarkan diri Anda untuk mengajukan dan memantau servis perangkat
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg shadow-slate-200/50">
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Nama Lengkap</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ahmad Fauzi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <User className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="ahmad@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Nomor Telepon (WhatsApp)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
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
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-snug">
                Saya menyetujui syarat layanan, kebijakan privasi data, dan ketentuan garansi toko ServisKu.
              </label>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-3">
              Daftar Akun Customer
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-5">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
