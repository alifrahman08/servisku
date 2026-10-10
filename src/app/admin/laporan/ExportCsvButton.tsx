"use client";

import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

interface ServiceReportRow {
  serviceNumber: string;
  date: string;
  customer: string;
  deviceType: string;
  brandModel: string;
  technician: string;
  status: string;
  cost: number;
  paymentStatus: string;
}

export function ExportCsvButton({ data }: { data: ServiceReportRow[] }) {
  function handleDownload() {
    const headers = [
      "Nomor Servis",
      "Tanggal",
      "Customer",
      "Perangkat",
      "Model",
      "Teknisi",
      "Status",
      "Total Biaya (IDR)",
      "Status Pembayaran",
    ];

    const rows = data.map((d) => [
      `"${d.serviceNumber}"`,
      `"${d.date}"`,
      `"${d.customer}"`,
      `"${d.deviceType}"`,
      `"${d.brandModel}"`,
      `"${d.technician}"`,
      `"${d.status}"`,
      d.cost,
      `"${d.paymentStatus}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_ServisKu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="gap-1.5 text-xs bg-white text-slate-700"
    >
      <Download className="h-3.5 w-3.5 text-blue-600" />
      Ekspor Laporan (CSV)
    </Button>
  );
}
