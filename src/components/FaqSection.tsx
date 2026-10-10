"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "Bagaimana cara melacak perkembangan perbaikan perangkat saya?",
    answer:
      "Anda dapat memasukkan Nomor Servis unik (misalnya SRV-20261001-8192) pada menu Lacak Servis di halaman utama tanpa harus login, atau masuk ke dashboard Customer untuk melihat timeline lengkap pengerjaan, diagnosis teknisi, dan persetujuan biaya.",
  },
  {
    question: "Berapa lama estimasi diagnosis dan perbaikan perangkat?",
    answer:
      "Diagnosis awal biasanya membutuhkan waktu 1 - 2 hari kerja tergantung tingkat kesulitan kerusakan. Setelah teknisi selesai memeriksa, Anda akan menerima rincian kerusakan dan estimasi biaya perbaikan untuk disetujui.",
  },
  {
    question: "Apakah data penting di laptop atau smartphone saya aman?",
    answer:
      "Keamanan dan kerahasiaan data pelanggan adalah prioritas utama kami. Kami menerapkan SOP ketat untuk tidak mengakses dokumen atau data pribadi selain keperluan pengujian fungsi hardware.",
  },
  {
    question: "Bagaimana jika biaya perbaikan ternyata melebihi anggaran saya?",
    answer:
      "Kami menerapkan sistem persetujuan biaya transparan. Teknisi tidak akan melakukan penggantian suku cadang berbayar sebelum Anda menyetujui estimasi biaya di dashboard. Jika Anda membatalkan, perangkat dapat diambil kembali sesuai ketentuan pemeriksaan.",
  },
  {
    question: "Apakah setiap servis mendapatkan garansi?",
    answer:
      "Ya! Semua perbaikan dan penggantian suku cadang resmi di ServisKu dilengkapi dengan garansi toko mulai dari 30 hingga 90 hari kalender tergantung pada jenis komponen dan perbaikan.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="py-4">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between text-left text-base font-semibold text-slate-900 transition hover:text-blue-600 focus:outline-none"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                  isOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>
            {isOpen && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 animate-in fade-in duration-200">
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
