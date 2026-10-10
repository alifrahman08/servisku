"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createOrUpdateServiceCatalogAction } from "@/actions/admin";
import { toast } from "sonner";
import { PlusCircle, Edit3 } from "lucide-react";

interface Props {
  mode: "CREATE" | "EDIT";
  catalog?: any;
}

export function AdminServiceCatalogActions({ mode, catalog }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createOrUpdateServiceCatalogAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal memproses layanan");
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
          Tambah Paket Layanan
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)} className="text-xs h-8 px-2.5">
          <Edit3 className="h-3 w-3 mr-1" />
          Edit
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={mode === "CREATE" ? "Tambah Paket Layanan Baru" : `Edit Layanan: ${catalog?.name}`}
        description="Kelola paket reparasi yang tersedia untuk dipilih oleh pelanggan"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "EDIT" && <input type="hidden" name="id" value={catalog?.id} />}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Nama Layanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={catalog?.name || ""}
              placeholder="cth: Ganti Layar LCD Laptop"
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Jenis Perangkat</label>
              <select
                name="deviceType"
                defaultValue={catalog?.deviceType || "LAPTOP"}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="LAPTOP">Laptop Saja</option>
                <option value="SMARTPHONE">Smartphone Saja</option>
                <option value="BOTH">Keduanya (Laptop & HP)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Tarif Dasar Mulai (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                required
                defaultValue={catalog?.basePrice || ""}
                placeholder="cth: 150000"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">Estimasi Durasi Kerja</label>
            <input
              type="text"
              name="estimatedDuration"
              defaultValue={catalog?.estimatedDuration || "1 - 2 Hari"}
              placeholder="cth: 1 - 2 Hari, 2 - 3 Jam"
              className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Deskripsi Layanan & Cakupan Kerja <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={catalog?.description || ""}
              placeholder="Jelaskan komponen dan proses perbaikan yang termasuk dalam paket ini..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                name="isActive"
                value="true"
                defaultChecked={catalog ? catalog.isActive : true}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Tampilkan di Publik & Aktifkan Paket Ini
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Simpan Paket Layanan
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
