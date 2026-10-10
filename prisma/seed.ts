import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in reverse order of dependencies
  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.repairLog.deleteMany();
  await prisma.costEstimate.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.technicianProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create Users with hashed passwords
  const adminPassword = await bcrypt.hash("admin123456", 10);
  const techPassword = await bcrypt.hash("teknisi123", 10);
  const custPassword = await bcrypt.hash("customer123", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Bambang Supriyanto (Admin)",
      email: "admin@servisku.com",
      passwordHash: adminPassword,
      phone: "081234567890",
      role: "ADMIN",
      address: "Jl. Sudirman No. 45, Jakarta Pusat",
      isActive: true,
    },
  });

  // Technicians
  const techBudi = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      email: "budi.teknisi@servisku.com",
      passwordHash: techPassword,
      phone: "081345678901",
      role: "TECHNICIAN",
      address: "Jl. Kebon Jeruk No. 12, Jakarta Barat",
      isActive: true,
      technicianProfile: {
        create: {
          specialization: "LAPTOP",
          bio: "Spesialis motherboard laptop, reballing chip VGA, dan troubleshooting hardware berat pengalaman 8 tahun.",
          isAvailable: true,
        },
      },
    },
  });

  const techAndi = await prisma.user.create({
    data: {
      name: "Andi Wijaya",
      email: "andi.teknisi@servisku.com",
      passwordHash: techPassword,
      phone: "081456789012",
      role: "TECHNICIAN",
      address: "Jl. Tebet Raya No. 88, Jakarta Selatan",
      isActive: true,
      technicianProfile: {
        create: {
          specialization: "SMARTPHONE",
          bio: "Spesialis perbaikan smartphone Android & iOS, penggantian layar OLED, IC charger, dan water damage.",
          isAvailable: true,
        },
      },
    },
  });

  const techDian = await prisma.user.create({
    data: {
      name: "Dian Pratama",
      email: "dian.teknisi@servisku.com",
      passwordHash: techPassword,
      phone: "081567890123",
      role: "TECHNICIAN",
      address: "Jl. Cempaka Putih No. 19, Jakarta Pusat",
      isActive: true,
      technicianProfile: {
        create: {
          specialization: "ALL",
          bio: "Ahli perbaikan perangkat laptop dan smartphone, optimasi sistem, instalasi OS, dan upgrade storage.",
          isAvailable: true,
        },
      },
    },
  });

  // Customers
  const custAhmad = await prisma.user.create({
    data: {
      name: "Ahmad Fauzi",
      email: "ahmad.customer@gmail.com",
      passwordHash: custPassword,
      phone: "081678901234",
      role: "CUSTOMER",
      address: "Jl. Margonda No. 102, Depok",
      isActive: true,
    },
  });

  const custSiti = await prisma.user.create({
    data: {
      name: "Siti Rahmawati",
      email: "siti.customer@gmail.com",
      passwordHash: custPassword,
      phone: "081789012345",
      role: "CUSTOMER",
      address: "Jl. Rawamangun Muka No. 34, Jakarta Timur",
      isActive: true,
    },
  });

  const custReza = await prisma.user.create({
    data: {
      name: "Reza Gunawan",
      email: "reza.customer@gmail.com",
      passwordHash: custPassword,
      phone: "081890123456",
      role: "CUSTOMER",
      address: "Jl. BSD Boulevard No. 5, Tangerang Selatan",
      isActive: true,
    },
  });

  // Service Catalog
  const srvCleaning = await prisma.serviceType.create({
    data: {
      name: "Pembersihan & Deep Clean Thermal Paste",
      deviceType: "LAPTOP",
      description: "Pembersihan debu kipas, heatsink, dan penggantian thermal paste premium (Arctic MX-4/Noctua) untuk menurunkan suhu laptop.",
      basePrice: 150000,
      estimatedDuration: "1 Hari",
      isActive: true,
    },
  });

  const srvLcdLaptop = await prisma.serviceType.create({
    data: {
      name: "Penggantian Layar LCD / LED Laptop",
      deviceType: "LAPTOP",
      description: "Penggantian layar laptop pecah, bergaris, flicker, atau blank dengan panel original bergaransi resmi toko.",
      basePrice: 850000,
      estimatedDuration: "2 - 3 Hari",
      isActive: true,
    },
  });

  const srvBateraiHp = await prisma.serviceType.create({
    data: {
      name: "Penggantian Baterai & Port Cas Smartphone",
      deviceType: "SMARTPHONE",
      description: "Solusi baterai kembung, boros (drop cepat), atau port USB-C/Lightning longgar tidak bisa mengisi daya.",
      basePrice: 350000,
      estimatedDuration: "1 - 2 Hari",
      isActive: true,
    },
  });

  const srvIcPower = await prisma.serviceType.create({
    data: {
      name: "Perbaikan IC Power / Motherboard Mati Total",
      deviceType: "BOTH",
      description: "Diagnosis jalur tegangan PCB, penggantian kapasitor short, reballing atau penggantian IC power management.",
      basePrice: 650000,
      estimatedDuration: "3 - 5 Hari",
      isActive: true,
    },
  });

  const srvInstallOs = await prisma.serviceType.create({
    data: {
      name: "Instalasi Sistem Operasi & Software",
      deviceType: "LAPTOP",
      description: "Instal ulang Windows 11/10 atau macOS bersih, update driver resmi, backup data aman, dan instalasi software penting.",
      basePrice: 120000,
      estimatedDuration: "1 Hari",
      isActive: true,
    },
  });

  const srvWaterDamage = await prisma.serviceType.create({
    data: {
      name: "Restorasi Korosi / Terkena Air (Water Damage)",
      deviceType: "BOTH",
      description: "Pembersihan mesin menggunakan ultrasonic cleaner, pengeringan khusus, isolasi korosi, dan perbaikan jalur putus.",
      basePrice: 500000,
      estimatedDuration: "2 - 4 Hari",
      isActive: true,
    },
  });

  // Service Requests with full lifecycles
  // 1. COMPLETED: Asus ROG (Customer Ahmad)
  const srv1 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261001-8192",
      customerId: custAhmad.id,
      technicianId: techBudi.id,
      serviceTypeId: srvIcPower.id,
      deviceType: "LAPTOP",
      brand: "Asus ROG",
      model: "Strix G15 (G513QM)",
      serialNumber: "SN-ASUS-9812401",
      complaint: "Laptop mendadak mati total saat rendering video dan lampu indikator charger tidak menyala.",
      initialCondition: "Kondisi fisik mulus, mati total, tidak ada respon tombol power.",
      handoverMethod: "DROP_OFF",
      status: "COMPLETED",
      priority: "HIGH",
      estimatedCost: 850000,
      finalCost: 850000,
      estimatedCompletion: new Date(Date.now() - 4 * 86400000),
      createdAt: new Date(Date.now() - 10 * 86400000),
      updatedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  await prisma.diagnosis.create({
    data: {
      serviceRequestId: srv1.id,
      technicianId: techBudi.id,
      summary: "Short circuit pada jalur 19V VBUS dan mosfet input jebol.",
      detailedFindings: "Ditemukan short pada mosfet charger input PQ1 dan kapasitor keramik PC401. Jalur motherboard utama masih aman.",
      recommendedAction: "Ganti sepasang mosfet 19V, kapasitor filter, dan repaste thermal grizzly.",
    },
  });

  await prisma.costEstimate.create({
    data: {
      serviceRequestId: srv1.id,
      estimatedAmount: 850000,
      breakdown: "Komponen mosfet & IC: Rp 450.000, Jasa solder mikroskopis & repaste: Rp 400.000",
      status: "APPROVED",
      customerNotes: "Disetujui, tolong pastikan data di SSD aman.",
      decidedAt: new Date(Date.now() - 8 * 86400000),
    },
  });

  await prisma.repairLog.create({
    data: {
      serviceRequestId: srv1.id,
      technicianId: techBudi.id,
      actionTaken: "Penggantian komponen short dan pengetesan tegangan stabil 19.5V.",
      partsReplaced: "Mosfet PQ1, PQ2, Kapasitor PC401, Thermal Paste Arctic MX-4",
      notes: "Laptop sudah melewati uji stress test FurMark & Cinebench selama 2 jam, suhu normal 68°C.",
    },
  });

  await prisma.payment.create({
    data: {
      serviceRequestId: srv1.id,
      invoiceNumber: "INV-202610-001",
      amount: 850000,
      paymentMethod: "QRIS",
      paymentStatus: "PAID",
      paidAt: new Date(Date.now() - 2 * 86400000),
      notes: "Pembayaran lunas via QRIS di kasir",
      recordedById: admin.id,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv1.id,
        actorId: custAhmad.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Permintaan servis diajukan oleh Ahmad Fauzi",
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Ditugaskan kepada teknisi Budi Santoso",
        createdAt: new Date(Date.now() - 9 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: techBudi.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_DIAGNOSIS",
        notes: "Pemeriksaan multimeter dan skematik dimulai",
        createdAt: new Date(Date.now() - 9 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: techBudi.id,
        fromStatus: "IN_DIAGNOSIS",
        toStatus: "WAITING_FOR_APPROVAL",
        notes: "Estimasi biaya diajukan ke customer",
        createdAt: new Date(Date.now() - 8 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: custAhmad.id,
        fromStatus: "WAITING_FOR_APPROVAL",
        toStatus: "IN_REPAIR",
        notes: "Customer menyetujui biaya estimasi",
        createdAt: new Date(Date.now() - 8 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: techBudi.id,
        fromStatus: "IN_REPAIR",
        toStatus: "REPAIR_COMPLETED",
        notes: "Perbaikan selesai, laptop lolos uji benchmarking",
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: admin.id,
        fromStatus: "REPAIR_COMPLETED",
        toStatus: "READY_FOR_PICKUP",
        notes: "Verifikasi QC admin selesai, perangkat siap diambil customer",
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        serviceRequestId: srv1.id,
        actorId: admin.id,
        fromStatus: "READY_FOR_PICKUP",
        toStatus: "COMPLETED",
        notes: "Perangkat telah diserahkan kepada customer dan pembayaran lunas",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
    ],
  });

  // 2. READY_FOR_PICKUP: iPhone 13 (Customer Siti)
  const srv2 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261005-3419",
      customerId: custSiti.id,
      technicianId: techAndi.id,
      serviceTypeId: srvBateraiHp.id,
      deviceType: "SMARTPHONE",
      brand: "Apple",
      model: "iPhone 13 128GB",
      serialNumber: "F2LX921K0MN",
      complaint: "Layar retak akibat terjatuh dan baterai health sisa 74% sering drop mendadak.",
      initialCondition: "Kaca depan retak seribu di pojok kanan atas, touchscreen masih respon sebagian.",
      handoverMethod: "DROP_OFF",
      status: "READY_FOR_PICKUP",
      priority: "NORMAL",
      estimatedCost: 1450000,
      finalCost: 1450000,
      estimatedCompletion: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - 6 * 86400000),
      updatedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.diagnosis.create({
    data: {
      serviceRequestId: srv2.id,
      technicianId: techAndi.id,
      summary: "Panel OLED retak dan siklus baterai telah melebihi 1200 cycles.",
      detailedFindings: "Face ID masih berfungsi normal. Memerlukan pergantian layar OLED original dan cell baterai baru.",
      recommendedAction: "Ganti assembly layar OLED Super Retina dan baterai original dengan transfer BMS.",
    },
  });

  await prisma.costEstimate.create({
    data: {
      serviceRequestId: srv2.id,
      estimatedAmount: 1450000,
      breakdown: "Layar OLED Grade Original: Rp 1.100.000, Baterai Original & Transfer BMS: Rp 350.000",
      status: "APPROVED",
      customerNotes: "Oke kak, lanjutkan pengerjaan.",
      decidedAt: new Date(Date.now() - 4 * 86400000),
    },
  });

  await prisma.repairLog.create({
    data: {
      serviceRequestId: srv2.id,
      technicianId: techAndi.id,
      actionTaken: "Pemasangan layar baru dan pergantian baterai serta re-sealing tahan air.",
      partsReplaced: "Layar OLED iPhone 13, Baterai 3227 mAh, Waterproof seal",
      notes: "True Tone dan Face ID berjalan 100% normal. Baterai health terdeteksi 100%.",
    },
  });

  await prisma.payment.create({
    data: {
      serviceRequestId: srv2.id,
      invoiceNumber: "INV-202610-002",
      amount: 1450000,
      paymentMethod: "TRANSFER",
      paymentStatus: "PAID",
      paidAt: new Date(Date.now() - 1 * 86400000),
      notes: "Transfer via Bank BCA",
      recordedById: admin.id,
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv2.id,
        actorId: custSiti.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Permintaan servis dibuat",
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        serviceRequestId: srv2.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Ditugaskan ke teknisi Andi Wijaya",
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        serviceRequestId: srv2.id,
        actorId: techAndi.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_DIAGNOSIS",
        notes: "Pemeriksaan fungsi sensor dan layar",
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        serviceRequestId: srv2.id,
        actorId: techAndi.id,
        fromStatus: "IN_DIAGNOSIS",
        toStatus: "WAITING_FOR_APPROVAL",
        notes: "Pengajuan estimasi perbaikan layar & baterai",
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
      {
        serviceRequestId: srv2.id,
        actorId: custSiti.id,
        fromStatus: "WAITING_FOR_APPROVAL",
        toStatus: "IN_REPAIR",
        notes: "Disetujui oleh customer",
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
      {
        serviceRequestId: srv2.id,
        actorId: techAndi.id,
        fromStatus: "IN_REPAIR",
        toStatus: "REPAIR_COMPLETED",
        notes: "Pengerjaan selesai dan quality check lolos",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        serviceRequestId: srv2.id,
        actorId: admin.id,
        fromStatus: "REPAIR_COMPLETED",
        toStatus: "READY_FOR_PICKUP",
        notes: "Pembayaran telah diverifikasi, silakan ambil di counter servis",
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  // 3. IN_REPAIR: Lenovo ThinkPad X1 (Customer Reza)
  const srv3 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261008-5921",
      customerId: custReza.id,
      technicianId: techBudi.id,
      serviceTypeId: srvCleaning.id,
      deviceType: "LAPTOP",
      brand: "Lenovo ThinkPad",
      model: "X1 Carbon Gen 9",
      serialNumber: "PF2K9981",
      complaint: "Keyboard ada 4 tombol tidak merespon (Space, Backspace, Huruf E, R) dan kipas bersuara mendesis keras.",
      initialCondition: "Fisik bagus, keyboard lengket akibat bekas percikan teh.",
      handoverMethod: "DROP_OFF",
      status: "IN_REPAIR",
      priority: "NORMAL",
      estimatedCost: 650000,
      finalCost: 650000,
      estimatedCompletion: new Date(Date.now() + 2 * 86400000),
      createdAt: new Date(Date.now() - 3 * 86400000),
      updatedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.diagnosis.create({
    data: {
      serviceRequestId: srv3.id,
      technicianId: techBudi.id,
      summary: "Membran keyboard rusak akibat korosi cairan manis dan bantalan kipas kering.",
      detailedFindings: "Motherboard tidak kena cairan karena ada lapisan pelindung ThinkPad spill-resistant. Hanya keyboard assembly dan pembersihan thermal fan.",
      recommendedAction: "Ganti keyboard backlit original dan pelumasan bearing kipas serta ganti thermal paste.",
    },
  });

  await prisma.costEstimate.create({
    data: {
      serviceRequestId: srv3.id,
      estimatedAmount: 650000,
      breakdown: "Keyboard Backlit ThinkPad X1: Rp 500.000, Deep cleaning & thermal grease: Rp 150.000",
      status: "APPROVED",
      customerNotes: "Silakan dilanjutkan mas Budi.",
      decidedAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv3.id,
        actorId: custReza.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Tiket servis diajukan oleh Reza Gunawan",
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        serviceRequestId: srv3.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Ditugaskan ke teknisi laptop Budi Santoso",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        serviceRequestId: srv3.id,
        actorId: techBudi.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_DIAGNOSIS",
        notes: "Membongkar keyboard dan cek jalur motherboard",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        serviceRequestId: srv3.id,
        actorId: techBudi.id,
        fromStatus: "IN_DIAGNOSIS",
        toStatus: "WAITING_FOR_APPROVAL",
        notes: "Mengajukan biaya sparepart keyboard & perawatan",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        serviceRequestId: srv3.id,
        actorId: custReza.id,
        fromStatus: "WAITING_FOR_APPROVAL",
        toStatus: "IN_REPAIR",
        notes: "Persetujuan biaya diterima, proses penggantian sparepart berjalan",
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  // 4. WAITING_FOR_APPROVAL: Samsung S22 (Customer Ahmad)
  const srv4 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261009-1104",
      customerId: custAhmad.id,
      technicianId: techAndi.id,
      serviceTypeId: srvWaterDamage.id,
      deviceType: "SMARTPHONE",
      brand: "Samsung",
      model: "Galaxy S22 5G",
      serialNumber: "SM-S901B-7712",
      complaint: "HP kehujanan deras kemarin, layar mulai flicker hijau garis-garis dan kamera berembun.",
      initialCondition: "Masih menyala, embun tebal di lensa kamera, layar kedip hijau.",
      handoverMethod: "DROP_OFF",
      status: "WAITING_FOR_APPROVAL",
      priority: "URGENT",
      estimatedCost: 950000,
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.diagnosis.create({
    data: {
      serviceRequestId: srv4.id,
      technicianId: techAndi.id,
      summary: "Air masuk melalui celah tombol volume, korosi di konektor FPC display.",
      detailedFindings: "Mesin utama aman dari korosi berat karena langsung dimatikan. Perlu pembersihan ultrasonic khusus kimia anti-korosi dan penggantian fleksibel display konektor.",
      recommendedAction: "Ultrasonic cleaning menyeluruh, rekondisi pin fleksibel display, dan penggantian seal anti air Samsung.",
    },
  });

  await prisma.costEstimate.create({
    data: {
      serviceRequestId: srv4.id,
      estimatedAmount: 950000,
      breakdown: "Pembersihan ultrasonic mesin: Rp 350.000, Restorasi konektor fleksibel: Rp 450.000, Gasket original: Rp 150.000",
      status: "PENDING",
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv4.id,
        actorId: custAhmad.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Pengajuan servis perangkat terkena air",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        serviceRequestId: srv4.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Diprioritaskan ke Andi Wijaya untuk penanganan air darurat",
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        serviceRequestId: srv4.id,
        actorId: techAndi.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_DIAGNOSIS",
        notes: "Bongkar casing dan pengeringan awal",
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        serviceRequestId: srv4.id,
        actorId: techAndi.id,
        fromStatus: "IN_DIAGNOSIS",
        toStatus: "WAITING_FOR_APPROVAL",
        notes: "Diagnosis selesai, menunggu konfirmasi persetujuan biaya dari customer",
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  // 5. IN_DIAGNOSIS: MacBook Air M1 (Customer Siti)
  const srv5 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261010-7734",
      customerId: custSiti.id,
      technicianId: techBudi.id,
      serviceTypeId: srvInstallOs.id,
      deviceType: "LAPTOP",
      brand: "Apple",
      model: "MacBook Air M1 2020",
      serialNumber: "C02F84K3Q05D",
      complaint: "Sering restart sendiri dengan pesan error Kernel Panic saat membuka browser dan aplikasi berat.",
      initialCondition: "Fisik mulus, baterai normal, macOs Ventura sering crash pink screen.",
      handoverMethod: "DROP_OFF",
      status: "IN_DIAGNOSIS",
      priority: "NORMAL",
      createdAt: new Date(Date.now() - 1 * 86400000),
      updatedAt: new Date(Date.now() - 8 * 3600000),
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv5.id,
        actorId: custSiti.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Pengajuan servis MacBook panic restart",
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        serviceRequestId: srv5.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Ditugaskan ke Budi Santoso",
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
      {
        serviceRequestId: srv5.id,
        actorId: techBudi.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_DIAGNOSIS",
        notes: "Menjalankan Apple Hardware Diagnostics & monitoring thermal log",
        createdAt: new Date(Date.now() - 8 * 3600000),
      },
    ],
  });

  // 6. ASSIGNED: Xiaomi 13T (Customer Reza)
  const srv6 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261011-0428",
      customerId: custReza.id,
      technicianId: techAndi.id,
      serviceTypeId: srvBateraiHp.id,
      deviceType: "SMARTPHONE",
      brand: "Xiaomi",
      model: "Xiaomi 13T Pro",
      serialNumber: "XM-13TP-9921",
      complaint: "Layar blank hitam setelah jatuh, tetapi saat ditelepon masih ada getar dan bunyi notifikasi masuk.",
      initialCondition: "Kaca luar tidak pecah tapi layar dalam mati.",
      handoverMethod: "DROP_OFF",
      status: "ASSIGNED",
      priority: "NORMAL",
      createdAt: new Date(Date.now() - 4 * 3600000),
      updatedAt: new Date(Date.now() - 2 * 3600000),
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv6.id,
        actorId: custReza.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Pengajuan servis layar HP blank",
        createdAt: new Date(Date.now() - 4 * 3600000),
      },
      {
        serviceRequestId: srv6.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Admin menugaskan teknisi Andi Wijaya",
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
    ],
  });

  // 7. PENDING (Unassigned): Acer Nitro 5 (Customer Ahmad)
  const srv7 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261011-9981",
      customerId: custAhmad.id,
      technicianId: null,
      serviceTypeId: srvCleaning.id,
      deviceType: "LAPTOP",
      brand: "Acer",
      model: "Nitro 5 (AN515-57)",
      serialNumber: "NHQBWSI001",
      complaint: "Kipas GPU berbunyi kasar gemeretak dan saat main game suhu melonjak sampai 98°C lalu throttling parah.",
      initialCondition: "Kondisi fisik normal, kipas kanan terasa berat diputar manual.",
      handoverMethod: "DROP_OFF",
      status: "PENDING",
      priority: "NORMAL",
      createdAt: new Date(Date.now() - 1 * 3600000),
      updatedAt: new Date(Date.now() - 1 * 3600000),
    },
  });

  await prisma.statusHistory.create({
    data: {
      serviceRequestId: srv7.id,
      actorId: custAhmad.id,
      fromStatus: "PENDING",
      toStatus: "PENDING",
      notes: "Permintaan servis baru diajukan oleh customer. Menunggu review admin.",
      createdAt: new Date(Date.now() - 1 * 3600000),
    },
  });

  // 8. CANCELLED: HP Pavilion (Customer Siti)
  const srv8 = await prisma.serviceRequest.create({
    data: {
      serviceNumber: "SRV-20261004-2201",
      customerId: custSiti.id,
      technicianId: techDian.id,
      serviceTypeId: srvLcdLaptop.id,
      deviceType: "LAPTOP",
      brand: "HP",
      model: "Pavilion 14 x360",
      serialNumber: "HP-PV-7712",
      complaint: "Engsel patah dan layar sentuh pecah.",
      initialCondition: "Casing engsel kiri terangkat, digitizer layar retak.",
      handoverMethod: "DROP_OFF",
      status: "CANCELLED",
      priority: "NORMAL",
      estimatedCost: 1950000,
      isCancelled: true,
      cancellationReason: "Customer memutuskan membeli laptop baru karena biaya layar sentuh + engsel melebihi anggaran.",
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(Date.now() - 5 * 86400000),
    },
  });

  await prisma.statusHistory.createMany({
    data: [
      {
        serviceRequestId: srv8.id,
        actorId: custSiti.id,
        fromStatus: "PENDING",
        toStatus: "PENDING",
        notes: "Pengajuan servis engsel dan layar",
        createdAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        serviceRequestId: srv8.id,
        actorId: admin.id,
        fromStatus: "PENDING",
        toStatus: "ASSIGNED",
        notes: "Ditugaskan ke Dian Pratama",
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        serviceRequestId: srv8.id,
        actorId: techDian.id,
        fromStatus: "ASSIGNED",
        toStatus: "IN_DIAGNOSIS",
        notes: "Pemeriksaan dudukan baut engsel & harga modul layar sentuh",
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        serviceRequestId: srv8.id,
        actorId: custSiti.id,
        fromStatus: "IN_DIAGNOSIS",
        toStatus: "CANCELLED",
        notes: "Dibatalkan atas permintaan customer (biaya melebihi budget)",
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
    ],
  });

  // In-app Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Permintaan Servis Baru",
        message: "Customer Ahmad Fauzi mengajukan servis Acer Nitro 5 (SRV-20261011-9981).",
        link: `/admin/servis/${srv7.id}`,
        isRead: false,
        type: "NEW_REQUEST",
      },
      {
        userId: techAndi.id,
        title: "Tugas Baru Ditugaskan",
        message: "Anda ditugaskan mengerjakan perbaikan Xiaomi 13T Pro (SRV-20261011-0428).",
        link: `/teknisi/tugas/${srv6.id}`,
        isRead: false,
        type: "ASSIGNMENT",
      },
      {
        userId: custAhmad.id,
        title: "Persetujuan Estimasi Biaya",
        message: "Teknisi telah menyelesaikan diagnosis untuk Samsung Galaxy S22. Silakan review estimasi biaya.",
        link: `/customer/tracking?search=${srv4.serviceNumber}`,
        isRead: false,
        type: "APPROVAL_REQUEST",
      },
      {
        userId: custSiti.id,
        title: "Perangkat Siap Diambil",
        message: "iPhone 13 (SRV-20261005-3419) telah selesai diperbaiki dan siap diambil di counter ServisKu.",
        link: `/customer/tracking?search=${srv2.serviceNumber}`,
        isRead: false,
        type: "READY_PICKUP",
      },
      {
        userId: custAhmad.id,
        title: "Servis Selesai & Lunas",
        message: "Terima kasih telah mempercayakan perbaikan Asus ROG Strix G15 kepada ServisKu.",
        link: `/customer/riwayat/${srv1.id}`,
        isRead: true,
        type: "STATUS_UPDATE",
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log("Demo credentials:");
  console.log("- Admin:      admin@servisku.com / admin123456");
  console.log("- Teknisi 1:  budi.teknisi@servisku.com / teknisi123 (Laptop)");
  console.log("- Teknisi 2:  andi.teknisi@servisku.com / teknisi123 (Smartphone)");
  console.log("- Teknisi 3:  dian.teknisi@servisku.com / teknisi123 (General)");
  console.log("- Customer 1: ahmad.customer@gmail.com / customer123");
  console.log("- Customer 2: siti.customer@gmail.com / customer123");
  console.log("- Customer 3: reza.customer@gmail.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
