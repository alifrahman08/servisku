"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { loginAction } from "@/actions/auth";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Wrench, User } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const res = await loginAction(formData);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || "Gagal masuk");
      toast.error(res.error || "Gagal masuk");
      return;
    }

    toast.success("Berhasil masuk!");
    const target = redirectParam || res.redirectUrl || "/";
    router.push(target);
    router.refresh();
  }

  function handleQuickFill(accEmail: string, accPass: string) {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMessage("");
  }

  return (
    <Card className="shadow-lg shadow-slate-200/50">
      {errorMessage && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Email</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            />
            <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
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

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          Masuk
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </form>

      {/* Quick Demo Credentials Autofill */}
      <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
          Pilihan Cepat Akun Demo (1-Click Fill)
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("admin@servisku.com", "admin123456")}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition text-left"
          >
            <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[11px] font-bold block">Admin Workshop</span>
              <span className="text-[10px] text-slate-400">admin@servisku.com</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("ahmad.customer@gmail.com", "customer123")}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 transition text-left"
          >
            <User className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[11px] font-bold block">Customer (Ahmad)</span>
              <span className="text-[10px] text-slate-400">ahmad.customer@...</span>
            </div>
          </button>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Login 3 Teknisi Workshop:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill("budi.teknisi@servisku.com", "teknisi123")}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 transition text-center"
              title="Budi Santoso - Spesialis Laptop"
            >
              <Wrench className="h-3.5 w-3.5 text-indigo-600 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold block leading-tight">Budi</span>
              <span className="text-[9px] text-indigo-700 font-medium">Laptop</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("andi.teknisi@servisku.com", "teknisi123")}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 transition text-center"
              title="Andi Wijaya - Spesialis Smartphone"
            >
              <Wrench className="h-3.5 w-3.5 text-indigo-600 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold block leading-tight">Andi</span>
              <span className="text-[9px] text-indigo-700 font-medium">Smartphone</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("dian.teknisi@servisku.com", "teknisi123")}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 transition text-center"
              title="Dian Pratama - Teknisi Umum"
            >
              <Wrench className="h-3.5 w-3.5 text-indigo-600 mx-auto mb-0.5" />
              <span className="text-[11px] font-bold block leading-tight">Dian</span>
              <span className="text-[9px] text-indigo-700 font-medium">General</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-600">
        Belum memiliki akun?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:underline">
          Daftar sekarang
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block">
          <BrandLogo />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Masuk ke Akun Anda
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Kelola tiket servis dan pantau status perbaikan perangkat Anda
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat formulir...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
