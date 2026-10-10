import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardShell, NavItem } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    redirect("/login");
  }

  // Count active requests of this customer
  const [activeCount, notifications] = await Promise.all([
    prisma.serviceRequest.count({
      where: {
        customerId: user.id,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const navItems: NavItem[] = [
    { label: "Overview", href: "/customer", iconName: "LayoutDashboard" },
    { label: "Ajukan Servis", href: "/customer/ajukan", iconName: "PlusCircle" },
    {
      label: "Servis Saya",
      href: "/customer/servis",
      iconName: "Clock",
      badge: activeCount > 0 ? activeCount : undefined,
    },
    { label: "Tracking Servis", href: "/customer/tracking", iconName: "Search" },
    { label: "Daftar Riwayat", href: "/customer/riwayat", iconName: "CheckCircle2" },
    { label: "Profil Saya", href: "/customer/profil", iconName: "User" },
  ];

  return (
    <DashboardShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      navItems={navItems}
      notifications={notifications}
      title="Customer Portal"
    >
      {children}
    </DashboardShell>
  );
}
