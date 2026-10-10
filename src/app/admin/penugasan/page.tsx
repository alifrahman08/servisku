import prisma from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AssignTechnicianForm } from "./AssignTechnicianForm";
import { formatTanggal } from "@/lib/utils";
import { Laptop, Smartphone, AlertCircle, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPenugasanPage() {
  const [unassignedServices, technicians] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: {
        technicianId: null,
        isCancelled: false,
      },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "asc" }, // First In, First Out
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIAN", isActive: true },
      include: {
        technicianProfile: true,
        assignedServices: {
          where: {
            status: { in: ["ASSIGNED", "IN_DIAGNOSIS", "WAITING_FOR_APPROVAL", "IN_REPAIR", "WAITING_FOR_PARTS"] },
            isCancelled: false,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const sanitizedTechnicians = technicians.map((tech) => ({
    id: tech.id,
    name: tech.name,
    technicianProfile: tech.technicianProfile
      ? { specialization: tech.technicianProfile.specialization }
      : null,
    assignedServices: tech.assignedServices.map((s) => ({ id: s.id })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Penugasan Teknisi Workshop
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tugaskan tiket servis yang baru masuk kepada teknisi yang tersedia sesuai keahlian perangkat
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Antrean Servis Belum Ditugaskan */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Antrean Servis Belum Memiliki Teknisi ({unassignedServices.length})
                </CardTitle>
                <CardDescription>
                  Urutan berdasarkan tiket masuk terdahulu (FIFO)
                </CardDescription>
              </div>
            </CardHeader>

            {unassignedServices.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                🎉 Hebat! Seluruh tiket servis yang masuk sudah ditugaskan kepada teknisi.
              </div>
            ) : (
              <div className="space-y-4">
                {unassignedServices.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {req.serviceNumber}
                          </span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Customer: <strong>{req.customer.name}</strong> • Masuk {formatTanggal(req.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        {req.deviceType === "LAPTOP" ? (
                          <Laptop className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-indigo-600" />
                        )}
                        <span>{req.brand} {req.model}</span>
                      </div>
                    </div>

                    <div className="py-2.5 text-xs text-slate-600">
                      <p className="line-clamp-2">
                        <strong className="text-slate-800">Keluhan:</strong> {req.complaint}
                      </p>
                    </div>

                    {/* Inline Assign Form */}
                    <div className="pt-2.5 border-t border-slate-200/60">
                      <AssignTechnicianForm
                        serviceId={req.id}
                        technicians={sanitizedTechnicians}
                        preferredDevice={req.deviceType}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Status Beban Kerja Teknisi */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-white">
            <CardHeader className="border-b border-slate-100 pb-3 mb-4">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Ketersediaan & Beban Teknisi
                </CardTitle>
                <CardDescription>
                  Pertimbangkan beban kerja sebelum menugaskan
                </CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-3">
              {technicians.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{tech.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Spesialis: {tech.technicianProfile?.specialization || "General"}
                      </p>
                    </div>
                    <span
                      className={`font-black rounded-lg px-2 py-0.5 text-xs ${
                        tech.assignedServices.length > 2
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {tech.assignedServices.length} Aktif
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
