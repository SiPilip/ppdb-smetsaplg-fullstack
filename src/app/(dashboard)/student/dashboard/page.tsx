"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/dashboard/timeline";

export default function StudentDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const response = await api.get("/student/profile");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive p-4">
        Gagal memuat data dashboard. Silahkan refresh.
      </div>
    );
  }

  const registration = data?.registration;
  const status = registration?.status || "Draft";
  const checklist = registration?.checklist || {};

  // Helper for status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending": // Changed from paid/pending_payment to pending per schema
        return "text-blue-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Calon Siswa
        </h2>
        <div className="flex gap-2">
          <Link href="/student/payment">
            <Button variant="outline">Rincian Biaya</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Status Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className={`text-3xl font-bold capitalize ${getStatusColor(status)}`}
              >
                {status === "pending" ? "Diproses" : status}
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              {status === "draft" &&
                "Silahkan lengkapi tahapan pendaftaran dibawah."}
              {status === "pending" &&
                "Data anda sedang diverifikasi oleh admin. Harap tunggu info selanjutnya."}
              {status === "verified" && "Selamat! Anda diterima."}
            </p>
          </CardContent>
        </Card>

        {/* Roadmap/Timeline */}
        <Card className="col-span-2 md:col-span-1 row-span-2">
          <CardHeader>
            <CardTitle>Tahapan Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline checklist={checklist} />
          </CardContent>
        </Card>

        {/* Actions / Guide */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Panduan & Aksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">1. Biodata</p>
              <Link
                href="/student/biodata"
                className={checklist.biodata ? "pointer-events-none" : ""}
              >
                <Button
                  className="w-full"
                  disabled={checklist.biodata}
                  variant={checklist.biodata ? "outline" : "default"}
                >
                  {checklist.biodata
                    ? "Biodata Lengkap (✓)"
                    : "Lengkapi Biodata"}
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">2. Dokumen</p>
              <Link href="/student/documents">
                <Button
                  className="w-full"
                  variant={
                    checklist.documents
                      ? "outline"
                      : checklist.biodata
                        ? "default"
                        : "secondary"
                  }
                >
                  {checklist.documents
                    ? "Dokumen Terupload (✓)"
                    : "Upload Dokumen"}
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">3. Pembayaran</p>
              {/* Re-use Document Page for Payment Proof - Or link to Payment Page? 
                        User said "Upload bukti pembayaran" is step 3. 
                        We already have it in /student/documents. 
                        Maybe link to /student/documents but anchor to payment? 
                        Or maybe /student/payment is for checking fees. 
                        Let's link to documents for now.
                     */}
              <Link href="/student/documents">
                <Button
                  className="w-full"
                  variant={
                    checklist.payment
                      ? "outline"
                      : checklist.documents
                        ? "default"
                        : "secondary"
                  }
                >
                  {checklist.payment
                    ? "Bukti Terkirim (✓)"
                    : "Upload Bukti Pembayaran"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
