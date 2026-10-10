# ServisKu — Sistem Manajemen Servis Laptop & HP Berbasis Web

ServisKu adalah aplikasi manajemen servis dan perbaikan elektronik (Laptop & Smartphone) berbasis web yang modern, profesional, transparan, dan terintegrasi secara menyeluruh untuk tiga role utama: **Admin, Teknisi, dan Customer**.

Aplikasi dibangun menggunakan **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Prisma ORM**, autentikasi berbasis session token aman (JWT + Bcrypt), **Zod validation**, **Recharts**, dan **Sonner**.

---

## Fitur Utama Berdasarkan Role

### 1. Landing Page Publik
- **Hero & Monitor Workshop**: Headline menarik dengan komposisi visual kartu perangkat perbaikan aktif.
- **Katalog Layanan Dinamis**: Data paket layanan, tarif dasar, dan estimasi waktu langsung dari query database.
- **Transparansi Alur Kerja**: 6 langkah terstruktur dari pendaftaran tiket hingga serah terima unit bergaransi.
- **Statistik Workshop Real-Time**: Total permintaan servis, perbaikan selesai, dan teknisi tersertifikasi langsung dari database (bukan angka dummy).
- **FAQ Interaktif**: Jawaban terstruktur untuk pertanyaan seputar biaya, privasi data, dan garansi toko.
- **Pencarian Cepat (Quick Track)**: Lacak tiket servis menggunakan nomor unik (`SRV-202610...`).

### 2. Administrator Panel (`/admin`)
- **Overview Operasional**: Metrik KPI lengkap (total servis, baru, diagnosis, perbaikan, siap diambil, selesai), grafik tren bulanan & distribusi status (Recharts), antrean beban kerja teknisi aktif.
- **Manajemen Servis**: Pencarian multi-kriteria, filter status & perangkat, pendaftaran servis atas nama customer walk-in, pembatalan dengan alasan audit.
- **Detail Servis Terintegrasi**: Mengubah status pengerjaan, mengganti/menugaskan teknisi, audit log lengkap dengan aktor dan waktu.
- **Kasir & Pembayaran**: Pencatatan pembayaran lunas (Cash, Transfer, QRIS) dengan penerbitan nomor invoice otomatis.
- **Penugasan Teknisi (`/admin/penugasan`)**: Antrean FIFO servis yang belum memiliki teknisi, rekomendasi teknisi berdasarkan spesialisasi & beban kerja aktif.
- **Data Customer & Teknisi**: Pendaftaran akun teknisi dengan penetapan password aman, manajemen profil dan spesialisasi hardware.
- **Katalog Layanan & Harga**: Menambah, mengedit, dan mengaktifkan/menonaktifkan paket reparasi.
- **Laporan Finansial & Operasional**: Pendapatan riil hanya dari pembayaran kasir lunas (tidak menghitung pembatalan/estimasi), filter tanggal, dan **Ekspor CSV**.

### 3. Teknisi Workshop (`/teknisi`)
- **Workbench Mandiri**: Teknisi hanya dapat melihat dan mengerjakan tugas yang ditugaskan kepada dirinya.
- **Alur Kerja Terkendali**:
  1. *Terima Tugas* (`ASSIGNED` → `IN_DIAGNOSIS`).
  2. *Input Diagnosis*: Ringkasan masalah, temuan kerusakan hardware, rekomendasi tindakan.
  3. *Pengajuan Estimasi Biaya*: Pengajuan suku cadang berbayar untuk persetujuan customer (`WAITING_FOR_APPROVAL`).
  4. *Log Tindakan*: Catatan perbaikan dan suku cadang yang diganti (`RepairLog`).
  5. *Penyelesaian*: Menandai pekerjaan selesai untuk diverifikasi QC admin (`REPAIR_COMPLETED`).
- **Batasan Keamanan**: Teknisi tidak dapat mengubah harga final, memanipulasi kasir lunas, atau menghapus tiket.

### 4. Customer Portal (`/customer`)
- **Ajukan Servis (`/customer/ajukan`)**: Formulir lengkap untuk Laptop atau Smartphone, keluhan kerusakan, kondisi awal fisik, pilihan metode penyerahan (Drop-Off / Pickup), dengan penerbitan nomor servis unik otomatis.
- **Servis Saya (`/customer/servis`)**: Daftar seluruh tiket aktif dengan opsi pembatalan mandiri jika status masih diizinkan.
- **Tracking Timeline Real-Time (`/customer/tracking`)**: Visualisasi 9 tahap perjalanan servis, informasi teknisi, estimasi biaya, dan status pembayaran.
- **Persetujuan Estimasi Biaya**: Dialog persetujuan atau penolakan estimasi biaya suku cadang dari teknisi.
- **Daftar & Detail Riwayat**: Arsip perbaikan yang telah selesai atau dibatalkan untuk klaim garansi toko.
- **Profil & Password**: Pengaturan kontak WhatsApp, alamat, dan penggantian password dengan verifikasi password saat ini.

---

## Akun Demo Pengujian Lokal

Aplikasi dilengkapi dengan data seed realistis untuk seluruh role:

| Role | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@servisku.com` | `admin123456` | Bambang Supriyanto (Kepala Workshop) |
| **Teknisi 1** | `budi.teknisi@servisku.com` | `teknisi123` | Budi Santoso (Spesialis Motherboard & Laptop) |
| **Teknisi 2** | `andi.teknisi@servisku.com` | `teknisi123` | Andi Wijaya (Spesialis Layar & Smartphone) |
| **Teknisi 3** | `dian.teknisi@servisku.com` | `teknisi123` | Dian Pratama (Teknisi Umum & OS) |
| **Customer 1** | `ahmad.customer@gmail.com` | `customer123` | Ahmad Fauzi (Memiliki tiket aktif & approval) |
| **Customer 2** | `siti.customer@gmail.com` | `customer123` | Siti Rahmawati (Memiliki unit siap diambil) |
| **Customer 3** | `reza.customer@gmail.com` | `customer123` | Reza Gunawan (Memiliki tiket sedang diperbaiki) |

> **Catatan Autentikasi**: Pada halaman login (`/login`), terdapat tombol cepat *Quick Demo Autofill* untuk memudahkan pengujian masing-masing role tanpa harus mengetik manual.

---

## Prasyarat Instalasi

- **Node.js**: Versi 18.18+ atau Node 20+ (Direkomendasikan Node.js 20/22 LTS).
- **Package Manager**: `npm` (atau `pnpm` / `yarn`).
- **Database**: PostgreSQL (Direkomendasikan) ATAU SQLite lokal instan.

---

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Masuk ke Direktori Project
```bash
cd "c:\tes web"
```

### 2. Salin Konfigurasi Environment
```bash
cp .env.example .env
```

### 3. Konfigurasi Database

#### Opsi A: Menggunakan PostgreSQL (Sesuai Spesifikasi Utama)
Pastikan PostgreSQL Anda berjalan (misalnya pada port `5432`), kemudian sesuaikan `DATABASE_URL` pada `.env`:
```env
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/servisku?schema=public"
```
Jalankan sinkronisasi schema dan pengisian data seed:
```bash
npx prisma db push
npm run prisma:seed
```

#### Opsi B: Menggunakan SQLite (Pengujian Lokal Instan Tanpa Install Postgres)
Aplikasi telah dilengkapi skrip switcher 1-perintah:
```bash
npm run db:switch:sqlite
npx prisma db push
npm run prisma:seed
```
*(Untuk kembali ke PostgreSQL kapan saja, cukup jalankan `npm run db:switch:postgres`).*

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser pada alamat: **[http://localhost:3000](http://localhost:3000)**

---

## Skenario Pengujian Alur Bisnis Antar-Role (End-to-End Walkthrough)

Untuk menguji integritas sinkronisasi data antar-role, ikuti alur skenario berikut:

1. **Langkah 1 (Customer Mengajukan Servis)**:
   - Masuk sebagai Customer: `ahmad.customer@gmail.com` / `customer123`
   - Buka menu **Ajukan Servis** (`/customer/ajukan`).
   - Pilih jenis *Laptop*, isi Merek `Lenovo`, Model `Legion 5`, Keluhan `Mati total setelah petir`.
   - Submit form. Anda akan diarahkan ke halaman tracking dengan Nomor Tiket baru (misal: `SRV-20261011-XXXX`).
   - Logout.

2. **Langkah 2 (Admin Memeriksa & Menugaskan Teknisi)**:
   - Masuk sebagai Admin: `admin@servisku.com` / `admin123456`.
   - Buka menu **Penugasan Teknisi** (`/admin/penugasan`).
   - Tiket `Lenovo Legion 5` akan muncul di daftar antrean teratas.
   - Pilih teknisi `Budi Santoso (Laptop)` dan klik **Tugaskan Sekarang**.
   - Notifikasi otomatis terkirim ke teknisi dan customer. Logout.

3. **Langkah 3 (Teknisi Menerima Tugas & Diagnosis)**:
   - Masuk sebagai Teknisi: `budi.teknisi@servisku.com` / `teknisi123`.
   - Buka menu **Tugas Servis** (`/teknisi/tugas`) dan buka tiket tersebut.
   - Klik **Terima Tugas & Mulai Diagnosis** (status berubah jadi `IN_DIAGNOSIS`).
   - Isi form diagnosis:
     - Ringkasan: `Kapasitor input 19V short`.
     - Temuan: `Jalur PCB aman, IC power perlu diganti`.
     - Rekomendasi: `Ganti mosfet input dan IC charger`.
     - Centang **Memerlukan Pergantian Komponen Berbayar**, isi biaya `750000`, rincian `IC Charger Rp 450.000 + Jasa Rp 300.000`.
   - Klik **Kirim Diagnosis & Minta Persetujuan Customer**. Status berubah ke `WAITING_FOR_APPROVAL`. Logout.

4. **Langkah 4 (Customer Menyetujui Biaya)**:
   - Masuk kembali sebagai Customer: `ahmad.customer@gmail.com`.
   - Buka menu **Tracking Servis** (`/customer/tracking`).
   - Akan muncul kartu konfirmasi berwarna oranye dengan biaya Rp 750.000.
   - Klik **Setujui Biaya**. Status perbaikan otomatis berubah menjadi `IN_REPAIR`. Logout.

5. **Langkah 5 (Teknisi Menyelesaikan Perbaikan)**:
   - Masuk sebagai Teknisi: `budi.teknisi@servisku.com`.
   - Buka kembali tugas tersebut.
   - Isi form log: Tindakan `Penggantian IC Charger dan pengetesan tegangan stabil 19.5V`.
   - Pilih status `Perbaikan Selesai (REPAIR_COMPLETED)`.
   - Klik simpan. Logout.

6. **Langkah 6 (Admin QC & Kasir Pembayaran)**:
   - Masuk sebagai Admin: `admin@servisku.com`.
   - Buka tiket tersebut di **Data Servis** (`/admin/servis`).
   - Klik **Ubah Status** ke `READY_FOR_PICKUP` (Unit siap diambil customer).
   - Klik tombol hijau **Catat Pembayaran**: Masukkan nominal `750000`, metode `QRIS`, centang `Tandai status selesai (COMPLETED)`.
   - Pembayaran lunas tercatat, invoice terbit, dan servis selesai!

7. **Langkah 7 (Customer Menerima Unit & Cek Riwayat)**:
   - Masuk sebagai Customer: `ahmad.customer@gmail.com`.
   - Buka **Daftar Riwayat** (`/customer/riwayat`).
   - Tiket telah berstatus selesai dengan rincian biaya lunas dan garansi servis aktif.

---

## Pengujian Keamanan & Validasi (RBAC & IDOR)

1. **Role-Based Route Protection**:
   - Customer mencoba mengakses `/admin` → Otomatis dialihkan ke `/customer`.
   - Teknisi mencoba mengakses `/admin` → Otomatis dialihkan ke `/teknisi`.
   - Pengunjung tanpa login mencoba membuka `/admin`, `/teknisi`, `/customer` → Dialihkan ke `/login`.
2. **IDOR (Insecure Direct Object Reference) Protection**:
   - Customer A tidak dapat melihat rincian riwayat Customer B di `/customer/riwayat/[id]`.
   - Teknisi A tidak dapat melihat atau mengubah tugas milik Teknisi B di `/teknisi/tugas/[id]`.
3. **Integritas Transaksi Kasir**:
   - Teknisi dibatasi dan tidak memiliki akses mencatat pembayaran lunas atau mengubah tarif final.

---

## Struktur Folder Project

```text
servisku/
├── prisma/
│   ├── schema.prisma           # Prisma schema (PostgreSQL)
│   ├── schema.sqlite.prisma    # Mirror schema untuk SQLite dev
│   └── seed.ts                 # Realistic Indonesian seed data
├── scripts/
│   └── switch-db.ts            # Skrip switch database Postgres <-> SQLite
├── src/
│   ├── actions/
│   │   ├── admin.ts            # Server actions wewenang Administrator
│   │   ├── auth.ts             # Server actions Login, Register, Reset, Profil
│   │   ├── customer.ts         # Server actions wewenang Customer & Persetujuan
│   │   ├── notifications.ts    # Server actions notifikasi in-app
│   │   └── technician.ts       # Server actions wewenang Teknisi
│   ├── app/
│   │   ├── admin/              # Dashboard Administrator & sub-halaman
│   │   ├── customer/           # Dashboard Customer & sub-halaman
│   │   ├── forgot-password/    # Form permintaan reset & ubah password
│   │   ├── login/              # Halaman login dengan role redirect
│   │   ├── register/           # Registrasi khusus customer
│   │   ├── teknisi/            # Dashboard Teknisi & workbench
│   │   ├── globals.css         # Tailwind & custom tokens
│   │   ├── layout.tsx          # Root layout & Sonner toaster
│   │   └── page.tsx            # Public landing page
│   ├── components/
│   │   ├── dashboard/          # DashboardShell, Charts (Recharts), Profil
│   │   ├── ui/                 # Button, Input, Card, Modal, StatusBadge
│   │   ├── BrandLogo.tsx       # Logo elektronik ServisKu
│   │   ├── FaqSection.tsx      # Accordion FAQ publik
│   │   ├── Footer.tsx          # Footer kontak & navigasi
│   │   ├── Navbar.tsx          # Public header & mobile menu
│   │   └── NotificationBell.tsx# Dropdown notifikasi in-app
│   ├── lib/
│   │   ├── auth.ts             # JWT session cookies & RBAC authorization
│   │   ├── prisma.ts           # Prisma singleton client
│   │   └── utils.ts            # Formatter Rupiah, tanggal ID, status badges
│   └── middleware.ts           # Next.js route protection & redirection
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Pengujian Software Quality Assurance (SQA Modul 1 - 6)

Project ini dilengkapi dengan pengujian otomatis menggunakan **Vitest** yang mencakup:
1. **Equivalence Partitioning (EP)**: Pengujian partisi valid & invalid untuk Email, Password, Konfirmasi Password, Keluhan Kerusakan, Harga Servis, dan Format Nomor Servis (`SRV-YYYYMMDD-XXXX`).
2. **Boundary Value Analysis (BVA)**: Pengujian nilai batas panjang teks (keluhan min 5 s/d max 1000 karakter, password min 6 karakter) serta batas numerik harga (min Rp 10.000, max Rp 50.000.000).
3. **Pengujian Alur & State Machine**: Validasi 9 tahapan alur servis resmi serta penolakan transisi status ilegal/terminal.
4. **Pengujian Multi-Role & RBAC**: Verifikasi otorisasi Admin, Teknisi, Customer, proteksi IDOR, dan keamanan token JWT & Bcrypt.
5. **Pengujian Integrasi CRUD**: Pembuatan, pembacaan, penugasan teknisi, dan pembatalan servis langsung ke database dengan rollback otomatis.

### Menjalankan Pengujian SQA:
```bash
# Menjalankan seluruh 52 test cases otomatis
npm test

# Menjalankan pemeriksaan linter
npm run lint

# Menjalankan type-checking TypeScript
npx tsc --noEmit
```

---

## Build & Deployment Produksi

Untuk melakukan kompilasi produksi:
```bash
npm run build
npm run start
```

---

## Konfigurasi Tambahan (Email & File Upload)

- **Email Reset Password**:
  Pada environment development, tautan reset password dicetak secara transparan ke server console log dan ditampilkan pada kartu informasi untuk kemudahan testing. Untuk menghubungkan ke SMTP produksi (misal SendGrid, Mailgun, Mailtrap), masukkan kredensial `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, dan `SMTP_PASS` pada berkas `.env`.
- **Upload File**:
  Formulir upload foto perangkat telah dipersiapkan untuk integrasi S3 / Supabase Storage / Cloudinary. Pada level aplikasi saat ini, field foto mendukung penyimpanan URL foto dokumentasi kerusakan.

---

© 2026 **ServisKu**. Dibuat untuk menghadirkan sistem perbaikan elektronik yang transparan, modern, dan profesional.
