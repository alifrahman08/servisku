import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ServisKu — Sistem Manajemen Servis Laptop & HP",
  description: "Platform manajemen servis laptop dan smartphone profesional, transparan, dan terpercaya.",
  keywords: ["servis laptop", "servis hp", "perbaikan smartphone", "servis komputer jakarta", "tracking servis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
