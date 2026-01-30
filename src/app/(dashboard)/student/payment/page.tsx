"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentPage() {
  // Fetch Student Profile to get 'golongan'
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const response = await api.get("/student/profile");
      return response.data;
    },
  });

  // Fetch Settings to get 'feeGroups'
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data;
    },
  });

  if (isProfileLoading || isSettingsLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const studentGolongan = profileData?.registration?.golongan || "Reguler";
  const feeGroups = settingsData?.feeGroups || [];

  // Find the fee group that matches the student's golongan
  // If not found, default to the first one or show error
  const activeFeeGroup =
    feeGroups.find((g: any) => g.name === studentGolongan) || feeGroups[0];
  const items = activeFeeGroup?.items || {};

  // Map of keys to readable labels
  const labels: Record<string, string> = {
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

  const total = Object.values(items).reduce(
    (acc: number, val: any) => acc + (Number(val) || 0),
    0,
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/student/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">
          Rincian Pembayaran
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biaya Pendidikan - Golongan {studentGolongan}</CardTitle>
          <CardDescription>
            Berikut adalah rincian biaya yang harus dibayarkan untuk Tahun
            Ajaran 2025/2026.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Keterangan</TableHead>
                  <TableHead className="text-right">Biaya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(items).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {labels[key] || key}
                    </TableCell>
                    <TableCell className="text-right">
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
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Catatan Pembayaran:</strong> <br />
            Silahkan transfer total biaya pendaftaran (Uang Pendaftaran:{" "}
            {formatCurrency(Number(items.registration || 0))}) ke Rekening{" "}
            <strong>BCA 8888-9999-00</strong> a.n Yayasan Methodist. <br />
            Biaya lainnya dapat diangsur sesuai ketentuan sekolah setelah siswa
            diterima.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
