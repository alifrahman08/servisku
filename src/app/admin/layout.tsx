import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardShell, NavItem } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  // Count pending unassigned services for badge
  const [unassignedCount, notifications] = await Promise.all([
    prisma.serviceRequest.count({
      where: { status: "PENDING", isCancelled: false },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const navItems: NavItem[] = [
    { label: "Overview", href: "/admin", iconName: "LayoutDashboard" },
    { label: "Data Servis", href: "/admin/servis", iconName: "Wrench" },
    { label: "Data Customer", href: "/admin/customer", iconName: "Users" },
    { label: "Data Teknisi", href: "/admin/teknisi", iconName: "UserCheck" },
    {
      label: "Penugasan Teknisi",
      href: "/admin/penugasan",
      iconName: "UserPlus",
      badge: unassignedCount > 0 ? unassignedCount : undefined,
    },
    { label: "Layanan & Harga", href: "/admin/layanan", iconName: "Tag" },
    { label: "Laporan", href: "/admin/laporan", iconName: "BarChart3" },
    { label: "Pengaturan Profil", href: "/admin/profil", iconName: "Settings" },
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
      title="Admin Panel"
    >
      {children}
    </DashboardShell>
  );
}
