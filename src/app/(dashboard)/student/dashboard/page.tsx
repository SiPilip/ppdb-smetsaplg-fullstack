"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/dashboard/timeline";

export default function StudentDashboard() {
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const response = await api.get("/student/profile");
      return response.data;
    },
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const registration = profileData?.registration;
  const status = registration?.status || "Draft";
  const checklist = registration?.checklist || {};

  // Wave Info
  const waveName = registration?.wave || "Belum ditentukan";
  const wave = settingsData?.waves?.find((w: any) => w.name === waveName);
  const waveDateRange = wave
    ? `${new Date(wave.startDate).toLocaleDateString("id-ID")} - ${new Date(wave.endDate).toLocaleDateString("id-ID")}`
    : "-";

  // Helper for status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      case "rejected":
        return <XCircle className="h-8 w-8 text-red-600" />;
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
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
        {/* WAVE & STATUS INFO */}
        <div className="space-y-6 col-span-2 md:col-span-1">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status Pendaftaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {getStatusIcon(status)}
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
                  "Data anda sedang diverifikasi oleh admin. Periksa whatsapp / perangkat seluler anda untuk info selanjutnya."}
                {status === "verified" && "Selamat! Anda diterima."}
              </p>
            </CardContent>
          </Card>

          {/* Wave Card */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-700">Gelombang Kamu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waveName}</div>
              <p className="text-muted-foreground">{waveDateRange}</p>
            </CardContent>
          </Card>
        </div>

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
                  className={
                    checklist.biodata
                      ? "w-full bg-green-600 hover:bg-green-700 text-white opacity-100"
                      : "w-full"
                  }
                  disabled={checklist.biodata}
                  variant={checklist.biodata ? "default" : "default"}
                >
                  {checklist.biodata
                    ? "Biodata Lengkap (✓)"
                    : "Lengkapi Biodata"}
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">2. Dokumen</p>
              <Link
                href="/student/documents"
                className={checklist.documents ? "pointer-events-none" : ""}
              >
                <Button
                  className={
                    checklist.documents
                      ? "w-full bg-green-600 hover:bg-green-700 text-white opacity-100"
                      : "w-full"
                  }
                  disabled={checklist.documents}
                  variant={
                    checklist.documents
                      ? "default"
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
              <Link
                href="/student/documents"
                className={checklist.payment ? "pointer-events-none" : ""}
              >
                <Button
                  className={
                    checklist.payment
                      ? "w-full bg-green-600 hover:bg-green-700 text-white opacity-100"
                      : "w-full"
                  }
                  disabled={checklist.payment}
                  variant={
                    checklist.payment
                      ? "default"
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
