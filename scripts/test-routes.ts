import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "servisku-secure-default-key-32-chars-long";

function createCookie(role: string, userId: string, name: string) {
  const token = jwt.sign(
    { userId, email: `${role.toLowerCase()}@servisku.com`, name, role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
  return `servisku_session=${token}`;
}

async function testUrl(url: string, cookie?: string) {
  try {
    const headers: Record<string, string> = {};
    if (cookie) headers["Cookie"] = cookie;

    const res = await fetch(url, { headers, redirect: "manual" });
    const text = await res.text();
    const hasError = text.includes("Unhandled Runtime Error") || text.includes("Application error:") || (res.status >= 500);
    console.log(`[${res.status}] ${url} - ${hasError ? "FAILED ❌" : "OK ✅"}`);
    if (hasError) {
      console.log(text.slice(0, 400));
    }
    return !hasError;
  } catch (err: any) {
    console.log(`[ERR] ${url} - ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("Testing application routes with real seeded users...\n");

  const [adminUser, techUser, custUser] = await Promise.all([
    prisma.user.findFirst({ where: { role: "ADMIN" } }),
    prisma.user.findFirst({ where: { role: "TECHNICIAN" } }),
    prisma.user.findFirst({ where: { role: "CUSTOMER" } }),
  ]);

  if (!adminUser || !techUser || !custUser) {
    console.error("Missing seeded users!");
    process.exit(1);
  }

  // 1. Public routes
  await testUrl("http://localhost:3000/");
  await testUrl("http://localhost:3000/login");
  await testUrl("http://localhost:3000/register");
  await testUrl("http://localhost:3000/forgot-password");

  // 2. Admin routes
  const adminCookie = createCookie("ADMIN", adminUser.id, adminUser.name);
  console.log("\n--- Testing Admin Routes ---");
  await testUrl("http://localhost:3000/admin", adminCookie);
  await testUrl("http://localhost:3000/admin/penugasan", adminCookie);
  await testUrl("http://localhost:3000/admin/servis", adminCookie);
  await testUrl("http://localhost:3000/admin/servis/baru", adminCookie);
  await testUrl("http://localhost:3000/admin/customer", adminCookie);
  await testUrl("http://localhost:3000/admin/teknisi", adminCookie);
  await testUrl("http://localhost:3000/admin/layanan", adminCookie);
  await testUrl("http://localhost:3000/admin/laporan", adminCookie);
  await testUrl("http://localhost:3000/admin/profil", adminCookie);

  // 3. Teknisi routes
  const techCookie = createCookie("TECHNICIAN", techUser.id, techUser.name);
  console.log("\n--- Testing Teknisi Routes ---");
  await testUrl("http://localhost:3000/teknisi", techCookie);
  await testUrl("http://localhost:3000/teknisi/tugas", techCookie);
  await testUrl("http://localhost:3000/teknisi/riwayat", techCookie);
  await testUrl("http://localhost:3000/teknisi/profil", techCookie);

  // 4. Customer routes
  const custCookie = createCookie("CUSTOMER", custUser.id, custUser.name);
  console.log("\n--- Testing Customer Routes ---");
  await testUrl("http://localhost:3000/customer", custCookie);
  await testUrl("http://localhost:3000/customer/ajukan", custCookie);
  await testUrl("http://localhost:3000/customer/servis", custCookie);
  await testUrl("http://localhost:3000/customer/tracking", custCookie);
  await testUrl("http://localhost:3000/customer/riwayat", custCookie);
  await testUrl("http://localhost:3000/customer/profil", custCookie);

  await prisma.$disconnect();
}

main();
