"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cancelServiceByCustomerAction } from "@/actions/customer";
import { toast } from "sonner";
import { Ban } from "lucide-react";

export function CustomerCancelServiceButton({
  serviceId,
  serviceNumber,
}: {
  serviceId: string;
  serviceNumber: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCancel(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("serviceRequestId", serviceId);
    formData.append("reason", reason || "Dibatalkan oleh customer");

    const res = await cancelServiceByCustomerAction(formData);
    setIsLoading(false);

    if (!res.success) {
      toast.error(res.error || "Gagal membatalkan servis");
      return;
    }

    toast.success(res.message);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 text-xs px-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      >
        <Ban className="h-3 w-3 mr-1" />
        Batalkan
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Konfirmasi Pembatalan Servis"
        description={`Apakah Anda yakin ingin membatalkan permohonan tiket ${serviceNumber}?`}
      >
        <form onSubmit={handleCancel} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Alasan Pembatalan (Opsional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Berikan alasan pembatalan agar tim kami dapat meningkatkan layanan..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isLoading}
            >
              Ya, Batalkan Servis
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
