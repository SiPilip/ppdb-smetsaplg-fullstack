"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BANK_INFO } from "@/lib/constants";

export default function PaymentPage() {
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/student/profile");
      return response.data;
    },
  });

  const { data: settingsData } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Ensure data availability
  if (!profileData || !settingsData) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const studentWaveName = profileData?.registration?.wave || "Gelombang 1"; // Default
  const waves = settingsData?.waves || [];

  const labels: any = {
    registration: "Uang Pendaftaran",
    participation: "Dana Partisipasi Pendidikan",
    uniformSport: "Seragam Olah Raga/Badge/Kaos Kaki",
    uniformBatik: "Seragam Batik",
    developmentArts: "Pengembangan Prestasi Olahraga, Bahasa, dan Seni",
    developmentAcademic: "Pengembangan Prestasi Bidang Akademik (Olimpiade)",
    books: "Buku Tulis",
    orientation: "Masa Pengenalan Lingkungan Sekolah (MPLS)",
    lab: "Lab IPA, Bahasa, Komputer",
    library: "Perpustakaan",
    healthUnit: "Unit Kesehatan Sekolah (UKS)",
    osis: "Uang OSIS",
    tuition: "Uang Sekolah dan Uang Ujian (SPP)",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Rincian Biaya</h2>
        <p className="text-muted-foreground">
          Berikut adalah rincian biaya pendaftaran untuk setiap gelombang.
          <br />
          Paket Anda saat ini adalah:{" "}
          <span className="font-bold text-primary">{studentWaveName}</span>
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {waves.map((wave: any, index: number) => {
          const isAssigned = wave.name === studentWaveName;
          const items = wave.items || {};
          const total = Object.values(items).reduce(
            (acc: any, curr: any) => acc + Number(curr),
            0,
          ) as number;

          return (
            <Card
              key={index}
              className={`transition-all duration-300 ${isAssigned ? "border-4 border-primary shadow-lg scale-[1.01]" : "border shadow-sm opacity-80 hover:opacity-100"}`}
            >
              <CardHeader className={isAssigned ? "bg-primary/10" : ""}>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{wave.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(wave.startDate).toLocaleDateString("id-ID")} -{" "}
                      {new Date(wave.endDate).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  {isAssigned && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      Paket Anda
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Keterangan</TableHead>
                      <TableHead className="text-right">Biaya</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(items).map(([key, value]) => (
                      <TableRow key={key} className="h-8">
                        <TableCell className="py-2 font-medium text-sm">
                          {labels[key] || key}
                        </TableCell>
                        <TableCell className="py-2 text-right text-sm">
                          {formatCurrency(Number(value))}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>Total Biaya</TableCell>
                      <TableCell className="text-right text-lg">
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-300">
            Instruksi Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-900 dark:text-blue-200">
          <p>Silahkan transfer total biaya ke rekening berikut:</p>
          <div className="font-bold text-lg my-2">
            {BANK_INFO.BANK_NAME}: {BANK_INFO.ACCOUNT_NUMBER} (a.n.{" "}
            {BANK_INFO.ACCOUNT_NAME})
          </div>
          <p>
            Setelah melakukan pembayaran, harap upload bukti transfer pada menu{" "}
            <strong>Dokumen</strong>. Status pendaftaran akan berubah menjadi
            "Diproses" setelah bukti diupload.
          </p>
          <p className="text-red-500">
            <strong>Perhatian:</strong> Setiap pembayaran yang telah masuk ke
            rekening diatas tidak dapat dikembalikan dengan alasan apapun.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
