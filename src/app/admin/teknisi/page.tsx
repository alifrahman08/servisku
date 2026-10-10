import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminTechnicianActions } from "./AdminTechnicianActions";
import { Laptop, Smartphone, Wrench, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTeknisiPage() {
  const technicians = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
    include: {
      technicianProfile: true,
      assignedServices: {
        select: { id: true, status: true, isCancelled: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Teknisi Workshop
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun teknisi, spesialisasi perbaikan, ketersediaan, dan beban tugas
          </p>
        </div>

        {/* Add Technician Action */}
        <AdminTechnicianActions mode="CREATE" />
      </div>

      {/* Grid Card of Technicians */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {technicians.map((tech) => {
          const activeTasks = tech.assignedServices.filter(
            (s) =>
              ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "WAITING_FOR_PARTS"].includes(
                s.status
              ) && !s.isCancelled
          ).length;

          const completedTasks = tech.assignedServices.filter(
            (s) => s.status === "COMPLETED"
          ).length;

          const spec = tech.technicianProfile?.specialization || "ALL";

          return (
            <Card key={tech.id} className="p-5 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-700 text-sm">
                      {tech.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{tech.name}</h3>
                      <p className="text-[11px] text-slate-400">{tech.email}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      tech.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {tech.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                    {spec === "LAPTOP" ? (
                      <Laptop className="h-3 w-3 text-blue-600" />
                    ) : spec === "SMARTPHONE" ? (
                      <Smartphone className="h-3 w-3 text-indigo-600" />
                    ) : (
                      <Wrench className="h-3 w-3 text-teal-600" />
                    )}
                    Spesialis: {spec}
                  </span>

                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-1 text-[11px] font-semibold ${
                      tech.technicianProfile?.isAvailable
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {tech.technicianProfile?.isAvailable ? "Tersedia" : "Sibuk / Off"}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {tech.technicianProfile?.bio || "Belum ada bio atau profil teknis"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-3">
                  <div className="rounded-xl bg-slate-50 p-2">
                    <span className="text-[10px] font-medium text-slate-400 block">Tugas Aktif</span>
                    <span className="text-sm font-black text-blue-600">{activeTasks}</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2">
                    <span className="text-[10px] font-medium text-slate-400 block">Selesai</span>
                    <span className="text-sm font-black text-teal-600">{completedTasks}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{tech.phone || "-"}</span>
                <AdminTechnicianActions mode="EDIT" technician={tech} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
