"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { NotificationBell } from "@/components/NotificationBell";
import { logoutAction } from "@/actions/auth";
import { toast } from "sonner";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Users,
  UserCheck,
  UserPlus,
  Tag,
  BarChart3,
  Settings,
  ClipboardList,
  History,
  User as UserIcon,
  PlusCircle,
  Clock,
  Search,
  CheckCircle2,
  CreditCard,
  Receipt,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard: Wrench, // fallback or specific
  Wrench,
  Users,
  UserCheck,
  UserPlus,
  Tag,
  BarChart3,
  Settings,
  ClipboardList,
  History,
  User: UserIcon,
  PlusCircle,
  Clock,
  Search,
  CheckCircle2,
  CreditCard,
  Receipt,
  Dashboard: Wrench,
};

// Import LayoutDashboard specifically
import { LayoutDashboard } from "lucide-react";
iconMap["LayoutDashboard"] = LayoutDashboard;

export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  badge?: number | string;
}

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  navItems: NavItem[];
  notifications: any[];
  title?: string;
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  navItems,
  notifications,
  title,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logoutAction();
    toast.success("Berhasil keluar");
    router.push("/");
    router.refresh();
  }

  const roleLabels: Record<string, { label: string; icon: LucideIcon; color: string }> = {
    ADMIN: { label: "Administrator", icon: ShieldCheck, color: "text-blue-600 bg-blue-50 border-blue-200" },
    TECHNICIAN: { label: "Teknisi", icon: Wrench, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    CUSTOMER: { label: "Customer", icon: UserIcon, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  };

  const currentRole = roleLabels[user.role] || roleLabels.CUSTOMER;
  const RoleIcon = currentRole.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-0 max-lg:-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
          <BrandLogo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role Badge In Sidebar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/80 font-bold text-slate-700">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user.name}</p>
              <div className="mt-0.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.2 text-[10px] font-semibold">
                <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${currentRole.color}`}>
                  <RoleIcon className="h-3 w-3" />
                  {currentRole.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin" || item.href === "/teknisi" || item.href === "/customer"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

            const Icon = iconMap[item.iconName] || Wrench;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
              aria-label="Buka menu navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Section Header */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>ServisKu</span>
                <ChevronRight className="h-3 w-3" />
                <span className="font-semibold text-slate-800 capitalize">
                  {user.role.toLowerCase()}
                </span>
                {title && (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-slate-800 font-medium truncate max-w-[160px] sm:max-w-none">
                      {title}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell initialNotifications={notifications} />

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400">{user.email}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700 text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
