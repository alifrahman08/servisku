import prisma from "../src/lib/prisma";
import jwt from "jsonwebtoken";

async function test() {
  const secret = process.env.JWT_SECRET || "servisku-secure-default-key-32-chars-long";
  const [adminUser, srv] = await Promise.all([
    prisma.user.findFirst({ where: { role: "ADMIN" } }),
    prisma.serviceRequest.findFirst({
      where: { technicianId: { not: null } },
      include: { customer: true, technician: true },
    }),
  ]);

  if (!adminUser || !srv) {
    console.log("Missing admin or service with technician");
    return;
  }

  const adminToken = jwt.sign(
    { userId: adminUser.id, email: adminUser.email, name: adminUser.name, role: "ADMIN" },
    secret
  );
  const techToken = jwt.sign(
    { userId: srv.technicianId!, email: srv.technician!.email, name: srv.technician!.name, role: "TECHNICIAN" },
    secret
  );
  const custToken = jwt.sign(
    { userId: srv.customerId, email: srv.customer.email, name: srv.customer.name, role: "CUSTOMER" },
    secret
  );

  const res1 = await fetch(`http://localhost:3000/admin/servis/${srv.id}`, {
    headers: { Cookie: `servisku_session=${adminToken}` },
  });
  const t1 = await res1.text();
  const err1 = t1.includes("Unhandled Runtime Error") || t1.includes("Application error:");
  console.log(`/admin/servis/${srv.id} -> ${res1.status} ${err1 ? "FAILED ❌" : "OK ✅"}`);

  const res2 = await fetch(`http://localhost:3000/teknisi/tugas/${srv.id}`, {
    headers: { Cookie: `servisku_session=${techToken}` },
  });
  const t2 = await res2.text();
  const err2 = t2.includes("Unhandled Runtime Error") || t2.includes("Application error:");
  console.log(`/teknisi/tugas/${srv.id} -> ${res2.status} ${err2 ? "FAILED ❌" : "OK ✅"}`);

  const res3 = await fetch(`http://localhost:3000/customer/riwayat/${srv.id}`, {
    headers: { Cookie: `servisku_session=${custToken}` },
  });
  const t3 = await res3.text();
  const err3 = t3.includes("Unhandled Runtime Error") || t3.includes("Application error:");
  console.log(`/customer/riwayat/${srv.id} -> ${res3.status} ${err3 ? "FAILED ❌" : "OK ✅"}`);

  await prisma.$disconnect();
}

test();
