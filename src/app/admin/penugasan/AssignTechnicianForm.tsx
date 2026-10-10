"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { assignTechnicianAction } from "@/actions/admin";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

interface Props {
  serviceId: string;
  technicians: {
    id: string;
    name: string;
    technicianProfile: { specialization: string } | null;
    assignedServices: any[];
  }[];
  preferredDevice: string;
}

export function AssignTechnicianForm({
  serviceId,
  technicians,
  preferredDevice,
}: Props) {
  const router = useRouter();
  const [selectedTech, setSelectedTech] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTech) {
      toast.error("Pilih teknisi terlebih dahulu");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("serviceRequestId", serviceId);
    formData.append("technicianId", selectedTech);
    formData.append("notes", `Penugasan antrean berdasarkan jenis ${preferredDevice}`);

    const res = await assignTechnicianAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal menugaskan");
      return;
    }

    toast.success(res.message);
    router.refresh();
  }

  return (
    <form onSubmit={handleAssign} className="flex flex-col sm:flex-row items-center gap-2">
      <select
        required
        value={selectedTech}
        onChange={(e) => setSelectedTech(e.target.value)}
        className="w-full sm:flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">-- Pilih Teknisi Yang Ditugaskan --</option>
        {technicians.map((t) => {
          const spec = t.technicianProfile?.specialization || "ALL";
          const isRecommended =
            spec === "ALL" || spec === preferredDevice;

          return (
            <option key={t.id} value={t.id}>
              {t.name} ({spec}) • {t.assignedServices.length} Aktif {isRecommended ? "★ Disarankan" : ""}
            </option>
          );
        })}
      </select>

      <Button
        type="submit"
        size="sm"
        isLoading={isLoading}
        className="w-full sm:w-auto h-9 px-4 text-xs shrink-0"
      >
        <UserCheck className="h-3.5 w-3.5 mr-1" />
        Tugaskan Sekarang
      </Button>
    </form>
  );
}
