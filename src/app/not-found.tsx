import Link from "next/link";
import { Search, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-sm">
          <Search className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
          <h2 className="text-lg font-bold text-slate-800">Halaman Tidak Ditemukan</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dihapus, atau tautan yang dimasukkan keliru.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button className="w-full shadow-md shadow-blue-500/20">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
