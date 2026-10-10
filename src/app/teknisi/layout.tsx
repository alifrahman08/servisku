import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardShell, NavItem } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function TeknisiLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== "TECHNICIAN") {
    redirect("/login");
  }

  // Count active tasks assigned to this technician
  const [activeTasksCount, notifications] = await Promise.all([
    prisma.serviceRequest.count({
      where: {
        technicianId: user.id,
        status: { in: ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "WAITING_FOR_PARTS"] },
        isCancelled: false,
      },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const navItems: NavItem[] = [
    { label: "Overview", href: "/teknisi", iconName: "LayoutDashboard" },
    {
      label: "Tugas Servis",
      href: "/teknisi/tugas",
      iconName: "ClipboardList",
      badge: activeTasksCount > 0 ? activeTasksCount : undefined,
    },
    { label: "Riwayat Pekerjaan", href: "/teknisi/riwayat", iconName: "History" },
    { label: "Profil Teknisi", href: "/teknisi/profil", iconName: "User" },
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
      title="Teknisi Workshop"
    >
      {children}
    </DashboardShell>
  );
}
