import { getCurrentUser } from "@/lib/auth";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerProfilPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CUSTOMER") redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Profil Akun Customer
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola kontak WhatsApp, alamat penyerahan unit, dan keamanan kata sandi Anda
        </p>
      </div>

      <ProfileSettingsForm user={user} />
    </div>
  );
}
