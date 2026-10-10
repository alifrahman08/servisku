import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-xs leading-relaxed text-slate-500">
              Sistem manajemen reparasi laptop dan smartphone modern dengan proses transparan, diagnosis akurat, teknisi berpengalaman, dan garansi resmi pengerjaan.
            </p>
          </div>

          {/* Navigasi Layanan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Layanan Utama
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>Perbaikan Motherboard & IC Power</li>
              <li>Penggantian Layar LCD Laptop & HP</li>
              <li>Ganti Baterai & Port Pengisian Daya</li>
              <li>Instalasi Ulang OS & Optimalisasi Software</li>
              <li>Deep Clean Thermal Paste Premium</li>
              <li>Penanganan Korosi / Water Damage</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Tautan Penting
            </h4>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/customer/tracking" className="hover:text-blue-600 transition">
                  Pelacakan Tiket Servis
                </Link>
              </li>
              <li>
                <Link href="/customer/ajukan" className="hover:text-blue-600 transition">
                  Ajukan Permintaan Servis
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  Portal Masuk Karyawan & Customer
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-600 transition">
                  Pendaftaran Akun Baru
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-600 transition">
                  Pertanyaan Sering Diajukan (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Workshop & Kontak
            </h4>
            <ul className="mt-4 space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Jl. Jenderal Sudirman No. 45, Kebayoran Baru, Jakarta Selatan 12190</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <span>(021) 7890-1234 / +62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <span>layanan@servisku.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Senin - Sabtu: 09:00 - 20:00 WIB</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ServisKu. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex gap-6">
            <span>Privasi & Keamanan</span>
            <span>Syarat Layanan</span>
            <span>Standar Garansi Toko</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
