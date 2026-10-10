"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { requestPasswordResetAction } from "@/actions/auth";
import { toast } from "sonner";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);

    const res = await requestPasswordResetAction(formData);
    setIsLoading(false);

    if (res.success) {
      setIsSuccess(true);
      if (res.devResetLink) {
        setDevResetLink(res.devResetLink);
      }
      toast.success(res.message);
    } else {
      toast.error(res.error || "Gagal mengirim link reset");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block">
          <BrandLogo />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Lupa Password?
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Masukkan email akun Anda untuk menerima tautan pemulihan kata sandi
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg shadow-slate-200/50">
          {isSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Permintaan Terkirim</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika email Anda terdaftar di sistem ServisKu, tautan reset password telah dikirimkan. Tautan hanya berlaku selama 1 jam.
              </p>

              {devResetLink && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-left">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    Mode Development (Simulasi Email):
                  </span>
                  <p className="text-xs text-slate-600 mt-1 break-all">
                    Link Reset:{" "}
                    <Link href={devResetLink} className="text-blue-600 font-semibold underline">
                      {devResetLink}
                    </Link>
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Kembali ke Halaman Masuk
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Email Akun</label>
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

              <Button type="submit" isLoading={isLoading} className="w-full">
                <Send className="h-4 w-4 mr-1.5" />
                Kirim Tautan Reset
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
