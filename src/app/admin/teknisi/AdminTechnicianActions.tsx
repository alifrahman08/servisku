"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createTechnicianAction, updateTechnicianAction } from "@/actions/admin";
import { toast } from "sonner";
import { PlusCircle, Edit3 } from "lucide-react";

interface Props {
  mode: "CREATE" | "EDIT";
  technician?: any;
}

export function AdminTechnicianActions({ mode, technician }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res =
      mode === "CREATE"
        ? await createTechnicianAction(formData)
        : await updateTechnicianAction(formData);

    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memproses data teknisi");
      return;
    }

    toast.success(res.message);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      {mode === "CREATE" ? (
        <Button size="sm" onClick={() => setIsOpen(true)} className="gap-1.5 shadow-sm text-xs">
          <PlusCircle className="h-4 w-4" />
          Tambah Teknisi Baru
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="text-xs h-8 px-2.5">
          <Edit3 className="h-3 w-3 mr-1" />
          Edit Profil
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={mode === "CREATE" ? "Tambah Akun Teknisi Baru" : `Edit Teknisi: ${technician?.name}`}
        description="Akun teknisi hanya dapat dibuat dan dikelola oleh administrator"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "EDIT" && <input type="hidden" name="id" value={technician?.id} />}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={technician?.name || ""}
              placeholder="cth: Budi Santoso"
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Email {mode === "CREATE" && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="email"
                name="email"
                required={mode === "CREATE"}
                disabled={mode === "EDIT"}
                defaultValue={technician?.email || ""}
                placeholder="nama@servisku.com"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Nomor Telepon</label>
              <input
                type="tel"
                name="phone"
                defaultValue={technician?.phone || ""}
                placeholder="08123456789"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {mode === "CREATE" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Password Awal <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Minimal 6 karakter"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Spesialisasi</label>
            <select
              name="specialization"
              defaultValue={technician?.technicianProfile?.specialization || "ALL"}
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="LAPTOP">Laptop Specialist (Motherboard / Chipset / Layar)</option>
              <option value="SMARTPHONE">Smartphone Specialist (Android & iOS / LCD / Baterai)</option>
              <option value="ALL">Semua Perangkat (General)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Bio & Catatan Keahlian</label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={technician?.technicianProfile?.bio || ""}
              placeholder="Pengalaman kerja, sertifikasi keahlian, atau catatan khusus..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {mode === "EDIT" && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  name="isAvailable"
                  value="true"
                  defaultChecked={technician?.technicianProfile?.isAvailable}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Tersedia Menerima Tugas
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={technician?.isActive}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Status Akun Aktif
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              {mode === "CREATE" ? "Simpan Teknisi" : "Perbarui Teknisi"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
