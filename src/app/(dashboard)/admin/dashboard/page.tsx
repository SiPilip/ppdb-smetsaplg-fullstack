"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const response = await api.get("/admin/stats");
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
      <div className="text-destructive p-4">Gagal memuat data statistik.</div>
    );
  }

  const { counts, recent, waveStats } = data;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendaftar
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">
              + {counts.draft} Draft (Belum Final)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Perlu Verifikasi
            </CardTitle>
            <Loader2 className="h-4 w-4 text-yellow-500 animate-spin-slow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {counts.pending}
            </div>
            <p className="text-xs text-muted-foreground">
              Menunggu tindakan admin
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
            <div className="h-4 w-4 text-green-500 font-bold">✓</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {counts.verified}
            </div>
            <p className="text-xs text-muted-foreground">
              Siswa resmi diterima
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <div className="h-4 w-4 text-red-500 font-bold">X</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {counts.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Data tidak valid</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Registrations */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Pendaftaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent?.map((item: any) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.student?.fullName ||
                        item.userId?.name ||
                        "Tanpa Nama"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.userId?.phoneNumber} • {item.wave || "Gelombang ?"}
                    </p>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === "verified"
                        ? "bg-green-100 text-green-800"
                        : item.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
              {recent?.length === 0 && (
                <p className="text-muted-foreground text-sm">Belum ada data.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wave Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Statistik Gelombang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {waveStats?.map((wave: any) => (
                <div key={wave._id} className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {wave._id || "Tidak ada Gelombang"}
                    </p>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{
                          width: `${(wave.count / counts.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="font-bold">{wave.count}</div>
                </div>
              ))}
              {waveStats?.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Belum ada data gelombang.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
