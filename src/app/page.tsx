import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FaqSection } from "@/components/FaqSection";
import { QuickTrackBox } from "@/components/QuickTrackBox";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils";
import {
  Laptop,
  Smartphone,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  ArrowRight,
  ClipboardList,
  UserCheck,
  Wrench,
  Eye,
  PackageCheck,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getCurrentUser();

  // Fetch real services and stats from database
  const [serviceCatalog, totalRequests, completedRequests, activeTechnicians] =
    await Promise.all([
      prisma.serviceType.findMany({
        where: { isActive: true },
        orderBy: { basePrice: "asc" },
      }),
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "TECHNICIAN", isActive: true } }),
    ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar sessionUser={user ? { name: user.name, role: user.role } : null} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section
          id="beranda"
          className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200/60"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Content */}
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Solusi Reparasi Resmi, Transparan & Bergaransi</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                    Servis Laptop & HP <br />
                    <span className="text-blue-600">Tanpa Ribet.</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                    Pantau proses perbaikan perangkatmu secara transparan, mulai dari pemeriksaan hingga perangkat siap digunakan kembali.
                  </p>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link href="/customer/ajukan">
                    <Button size="lg" className="w-full sm:w-auto shadow-md shadow-blue-500/25">
                      Ajukan Servis Sekarang
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/customer/tracking">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      <Search className="h-4 w-4 mr-1 text-blue-600" />
                      Lacak Servis
                    </Button>
                  </Link>
                </div>

                {/* Quick Track Box */}
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Punya tiket servis? Masukkan nomor tiket untuk melihat status terkini:
                  </p>
                  <QuickTrackBox />
                </div>
              </div>

              {/* Visual Showcase - Professional Device Hardware Cards */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono font-semibold text-slate-400 ml-2">
                        MONITOR WORKSHOP
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Status
                    </span>
                  </div>

                  {/* Device Showcase Items */}
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                            <Laptop className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Asus ROG Strix G15</h4>
                            <p className="text-[11px] text-slate-500">Short Circuit 19V & IC Power</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                          Selesai QC
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <span>Teknisi: Budi Santoso</span>
                        <span className="font-semibold text-slate-800">Rp 850.000</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                            <Smartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">iPhone 13 128GB</h4>
                            <p className="text-[11px] text-slate-500">Layar OLED Super Retina</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Siap Diambil
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <span>Teknisi: Andi Wijaya</span>
                        <span className="font-semibold text-slate-800">Rp 1.450.000</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
                            <Laptop className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">ThinkPad X1 Carbon</h4>
                            <p className="text-[11px] text-slate-500">Keyboard Spill & Thermal Grease</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                          Sedang Diperbaiki
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <span>Teknisi: Budi Santoso</span>
                        <span className="font-semibold text-slate-800">Rp 650.000</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-blue-50/80 p-3 text-center border border-blue-100">
                    <p className="text-[11px] font-medium text-blue-800">
                      ⚡ Terhubung langsung ke database workshop operasional ServisKu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REAL DATABASE STATS SECTION */}
        <section className="bg-white py-12 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">{totalRequests}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Total Permintaan Servis</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-teal-600">{completedRequests}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Perbaikan Selesai</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600">{activeTechnicians}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Teknisi Aktif Tersertifikasi</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">{serviceCatalog.length}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">Katalog Paket Layanan</p>
              </div>
            </div>
          </div>
        </section>

        {/* LAYANAN DARI DATABASE */}
        <section id="layanan" className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Katalog Layanan
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Layanan Servis & Pemeliharaan Komprehensif
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Seluruh harga awal tertera di bawah ini dikelola langsung dari database sistem. Biaya akhir akan dipastikan setelah diagnosis teknisi dan wajib disetujui customer.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCatalog.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {service.deviceType === "LAPTOP" ? (
                          <Laptop className="h-3 w-3 text-blue-600" />
                        ) : service.deviceType === "SMARTPHONE" ? (
                          <Smartphone className="h-3 w-3 text-indigo-600" />
                        ) : (
                          <Wrench className="h-3 w-3 text-teal-600" />
                        )}
                        {service.deviceType === "BOTH" ? "Laptop & HP" : service.deviceType}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Clock className="h-3 w-3" />
                        {service.estimatedDuration}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {service.name}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Mulai dari
                      </span>
                      <p className="text-base font-bold text-blue-600">
                        {formatRupiah(service.basePrice)}
                      </p>
                    </div>
                    <Link href={`/customer/ajukan?serviceTypeId=${service.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Pilih Layanan
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ALUR KERJA / CARA KERJA */}
        <section id="alur" className="py-20 bg-white border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Transparansi Proses
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Alur Servis Terstruktur & Terkendali
              </h2>
              <p className="text-sm text-slate-600">
                Setiap langkah tercatat otomatis pada database dengan pencatatan aktor dan histori status.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: UserCheck,
                  title: "Daftar atau Masuk",
                  desc: "Daftarkan akun customer dengan aman untuk mengelola tiket servis dan kontak Anda.",
                },
                {
                  step: "02",
                  icon: ClipboardList,
                  title: "Buat Permintaan Servis",
                  desc: "Isi form detail perangkat, keluhan, dan layanan. Nomor servis unik diterbitkan otomatis.",
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "Admin Verifikasi & Penugasan",
                  desc: "Admin meninjau antrean dan menugaskan teknisi sesuai keahlian spesialisasi laptop/HP.",
                },
                {
                  step: "04",
                  icon: Wrench,
                  title: "Diagnosis & Persetujuan Biaya",
                  desc: "Teknisi mendiagnosis perangkat. Jika ada sparepart berbayar, customer menyetujui dahulu di sistem.",
                },
                {
                  step: "05",
                  icon: Eye,
                  title: "Pemantauan Status Real-Time",
                  desc: "Customer dan admin memantau progres perbaikan, catatan teknis, dan estimasi waktu siap.",
                },
                {
                  step: "06",
                  icon: PackageCheck,
                  title: "Pengambilan & Garansi Toko",
                  desc: "Setelah selesai QC dan pembayaran tercatat, perangkat siap diambil dengan garansi servis.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 transition hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEUNGGULAN / TENTANG KAMI */}
        <section id="keunggulan" className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Mengapa ServisKu?
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  Standar Profesional Reparasi Elektronik Tanpa Trik Biaya Tersembunyi
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kami mengakhiri era servis tradisional yang tidak transparan di mana customer sering tidak tahu komponen apa yang diganti dan berapa estimasi biaya sebenarnya.
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    "Transparansi Penuh: Suku cadang dan biaya diverifikasi oleh customer sebelum pengerjaan.",
                    "Audit Log Status: Seluruh riwayat perubahan status tercatat dengan waktu & nama teknisi.",
                    "Teknisi Spesialis: Pembagian tugas profesional untuk motherboard, layar, dan software.",
                    "Keamanan Data Terjamin: Standar privasi tanpa akses ke data pribadi pelanggan.",
                  ].map((keunggulan, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {keunggulan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Komitmen Pelayanan ServisKu
                </h3>
                <div className="mt-5 space-y-4 text-xs text-slate-600 leading-relaxed">
                  <p>
                    Setiap unit perangkat yang masuk ke workshop ServisKu melewati 3 lapis pemeriksaan:
                  </p>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li><strong className="text-slate-800">Pemeriksaan Awal (Check-In):</strong> Pencatatan kondisi fisik, fungsi tombol, dan keluhan awal.</li>
                    <li><strong className="text-slate-800">Diagnosis Multimeter & Hardware:</strong> Pengetesan tegangan IC, hambatan jalur, dan kondisi software.</li>
                    <li><strong className="text-slate-800">Quality Control (QC Post-Repair):</strong> Stress-testing hardware selama 1-2 jam sebelum dinyatakan siap diambil.</li>
                  </ol>
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-[11px] text-slate-500">
                    Workshop kami dilengkapi dengan peralatan modern seperti mikroskop trinokuler, solder station temperatur presisi, power supply digital, dan pembersih ultrasonic anti korosi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Bantuan & Informasi
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>
            <FaqSection />
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="bg-slate-900 py-16 text-white text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Perangkat Anda Mengalami Masalah Hari Ini?
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Buat tiket servis sekarang dalam 2 menit. Dapatkan estimasi awal dan teknisi terbaik kami akan segera menangani perangkat Anda.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/customer/ajukan">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500">
                  Ajukan Servis Sekarang
                </Button>
              </Link>
              <Link href="/customer/tracking">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-slate-700 text-white hover:bg-slate-800">
                  Lacak Status Servis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
