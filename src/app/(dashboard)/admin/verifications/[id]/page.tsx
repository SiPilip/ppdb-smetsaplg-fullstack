"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Check, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const { data: registration, isLoading } = useQuery({
    queryKey: ["verificationDetail", params.id],
    queryFn: async () => {
      const response = await api.get(`/admin/verifications/${params.id}`);
      return response.data.registration;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      status,
      rejectionReason,
    }: {
      status: string;
      rejectionReason?: string;
    }) => {
      const response = await api.put("/admin/verify", {
        registrationId: params.id,
        status,
        rejectionReason,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Berhasil! Status diubah menjadi ${data.registration.status}`,
      );
      queryClient.invalidateQueries({ queryKey: ["adminVerifications"] });
      queryClient.invalidateQueries({
        queryKey: ["verificationDetail", params.id],
      });
      setIsRejectOpen(false);
    },
    onError: (error: any) => {
      toast.error("Gagal memproses: " + error.response?.data?.message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!registration) {
    return <div>Data tidak ditemukan.</div>;
  }

  const s = registration.student || {};
  const d = registration.documents || {};
  const p = registration.payment || {}; // If separate payment object exists

  const t = registration.timestamps || {};

  const formatLastModified = (dateString: string | undefined) => {
    if (!dateString) return null;
    return (
      <span className="text-xs text-muted-foreground font-normal ml-2">
        (Diubah: {new Date(dateString).toLocaleString("id-ID")})
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ... Header ... */}
      <div className="flex items-center gap-4">
        <Link href="/admin/verifications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{s.fullName}</h2>
          <p className="text-muted-foreground">
            {registration.wave} • {registration.userId?.email}
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            className={`text-base px-4 py-1 capitalize ${
              registration.status === "verified"
                ? "bg-green-600"
                : registration.status === "rejected"
                  ? "bg-red-600"
                  : "bg-yellow-500 text-black"
            }`}
          >
            {registration.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Biodata */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Biodata Lengkap Siswa</span>
              {formatLastModified(t.biodata)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ... Content ... */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Data Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    NISN
                  </span>
                  <p>{s.nisn || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Jenis Kelamin
                  </span>
                  <p>
                    {s.gender === "L"
                      ? "Laki-laki"
                      : s.gender === "P"
                        ? "Perempuan"
                        : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Tempat, Tanggal Lahir
                  </span>
                  <p>
                    {s.birthPlace},{" "}
                    {s.birthDate
                      ? new Date(s.birthDate).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Agama
                  </span>
                  <p>{s.religion || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Asal Sekolah
                  </span>
                  <p>{s.originSchool || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Jumlah Saudara
                  </span>
                  <p>{s.siblingCount ? `${s.siblingCount} Orang` : "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Tinggal Bersama
                  </span>
                  <p>{s.livingWith || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Alamat Lengkap</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Jalan / Alamat
                  </span>
                  <p>{s.address?.street || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    RT / RW
                  </span>
                  <p>
                    {s.address?.rt || "-"} / {s.address?.rw || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Kelurahan
                  </span>
                  <p>{s.address?.village || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Kecamatan
                  </span>
                  <p>{s.address?.district || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Kota / Kabupaten
                  </span>
                  <p>{s.address?.city || "-"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Provinsi
                  </span>
                  <p>{s.address?.province || "-"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Parents */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Data Orang Tua</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father */}
                <div className="space-y-2">
                  <h4 className="font-medium underline">Data Ayah</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Nama:
                      </span>
                      <p>{registration.father?.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Tgl Lahir:
                      </span>
                      <p>
                        {registration.father?.birthDate
                          ? new Date(
                              registration.father.birthDate,
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Pendidikan:
                      </span>
                      <p>{registration.father?.education || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Pekerjaan:
                      </span>
                      <p>{registration.father?.job || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        No. HP:
                      </span>
                      <p>{registration.father?.phone || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Mother */}
                <div className="space-y-2">
                  <h4 className="font-medium underline">Data Ibu</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Nama:
                      </span>
                      <p>{registration.mother?.name || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Tgl Lahir:
                      </span>
                      <p>
                        {registration.mother?.birthDate
                          ? new Date(
                              registration.mother.birthDate,
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Pendidikan:
                      </span>
                      <p>{registration.mother?.education || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Pekerjaan:
                      </span>
                      <p>{registration.mother?.job || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        No. HP:
                      </span>
                      <p>{registration.mother?.phone || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Guardian */}
            {registration.guardian?.name && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Data Wali</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Nama Wali
                    </span>
                    <p>{registration.guardian?.name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Pekerjaan
                    </span>
                    <p>{registration.guardian?.job || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      No. HP
                    </span>
                    <p>{registration.guardian?.phone || "-"}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Alamat
                    </span>
                    <p>{registration.guardian?.address || "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Documents & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border p-3 rounded flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      Link Kartu Keluarga
                    </span>
                  </div>
                  {d.familyCard ? (
                    <a
                      href={d.familyCard}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Buka
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-red-500">Belum ada</span>
                  )}
                </div>
                {formatLastModified(t.documents?.familyCard)}
              </div>

              <div className="border p-3 rounded flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      Link Akta Kelahiran
                    </span>
                  </div>
                  {d.birthCertificate ? (
                    <a
                      href={d.birthCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Buka
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-red-500">Belum ada</span>
                  )}
                </div>
                {formatLastModified(t.documents?.birthCertificate)}
              </div>

              <div className="border p-3 rounded flex flex-col gap-2 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Bukti Pembayaran
                    </span>
                  </div>
                  {d.paymentProof ? (
                    <a
                      href={d.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        Buka
                      </Button>
                    </a>
                  ) : (
                    <span className="text-xs text-red-500">Belum ada</span>
                  )}
                </div>
                {formatLastModified(t.documents?.paymentProof)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aksi Verifikasi</CardTitle>
              <CardDescription>
                Pastikan seluruh data dan pembayaran valid sebelum menerima.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => verifyMutation.mutate({ status: "verified" })}
                disabled={
                  verifyMutation.isPending || registration.status === "verified"
                }
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Terima Pendaftaran
              </Button>

              <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={
                      verifyMutation.isPending ||
                      registration.status === "rejected"
                    }
                  >
                    <X className="mr-2 h-4 w-4" />
                    Tolak / Minta Revisi
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tolak Pendaftaran</DialogTitle>
                    <DialogDescription>
                      Berikan alasan penolakan. Pesan ini akan dikirim ke siswa
                      via WhatsApp.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder="Contoh: Foto KK buram, mohon upload ulang."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsRejectOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        verifyMutation.mutate({
                          status: "rejected",
                          rejectionReason: rejectReason,
                        })
                      }
                    >
                      Kirim Penolakan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
