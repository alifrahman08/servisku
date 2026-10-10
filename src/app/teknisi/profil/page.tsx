import { getCurrentUser } from "@/lib/auth";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeknisiProfilPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TECHNICIAN") redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Profil Teknisi Workshop
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil identitas dan ubah password akun teknisi Anda
        </p>
      </div>

      <ProfileSettingsForm user={user} />
    </div>
  );
}
