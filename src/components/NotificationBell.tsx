"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notifications";
import { formatTanggalWaktu } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

export function NotificationBell({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markNotificationAsRead(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xl shadow-slate-200/50 z-50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-2.5 transition rounded-xl ${
                    item.isRead ? "opacity-75 hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-50/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatTanggalWaktu(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    {item.link ? (
                      <Link
                        href={item.link}
                        onClick={() => {
                          handleMarkRead(item.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        Buka Detail <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span />
                    )}
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
