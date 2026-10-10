"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./ui/Button";
import { Menu, X, Search, ShieldCheck } from "lucide-react";

export function Navbar({ sessionUser }: { sessionUser?: { name: string; role: string } | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            Beranda
          </Link>
          <a href="#layanan" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            Layanan
          </a>
          <a href="#alur" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            Alur Servis
          </a>
          <a href="#keunggulan" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            Tentang Kami
          </a>
          <a href="#faq" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/customer/tracking">
            <Button variant="outline" size="sm" className="gap-1.5 text-slate-700">
              <Search className="h-3.5 w-3.5 text-blue-600" />
              Lacak Servis
            </Button>
          </Link>

          {sessionUser ? (
            <Link
              href={
                sessionUser.role === "ADMIN"
                  ? "/admin"
                  : sessionUser.role === "TECHNICIAN"
                  ? "/teknisi"
                  : "/customer"
              }
            >
              <Button size="sm" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Dashboard ({sessionUser.role.toLowerCase()})
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">
                Masuk
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-3 pt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-blue-600 py-1"
            >
              Beranda
            </Link>
            <a
              href="#layanan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-blue-600 py-1"
            >
              Layanan
            </a>
            <a
              href="#alur"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-blue-600 py-1"
            >
              Alur Servis
            </a>
            <a
              href="#keunggulan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-blue-600 py-1"
            >
              Tentang Kami
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-800 hover:text-blue-600 py-1"
            >
              FAQ
            </a>
          </nav>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <Link href="/customer/tracking" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                Lacak Status Servis
              </Button>
            </Link>

            {sessionUser ? (
              <Link
                href={
                  sessionUser.role === "ADMIN"
                    ? "/admin"
                    : sessionUser.role === "TECHNICIAN"
                    ? "/teknisi"
                    : "/customer"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full justify-center">
                  Buka Dashboard ({sessionUser.role})
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full justify-center">
                  Masuk
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
