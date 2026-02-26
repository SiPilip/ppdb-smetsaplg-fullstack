"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUpload } from "@/components/ui/file-upload";
import api from "@/lib/axios";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { BANK_INFO } from "@/lib/constants";

export default function DocumentPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const response = await api.get("/student/profile");
      return response.data;
    },
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // ... (keeping mutation logic same) ...
  // 1. Upload File to Server
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { path: response.data.url, type };
    },
    onMutate: ({ type }) => {
      setUploading((prev) => ({ ...prev, [type]: true }));
    },
    onSuccess: (data) => {
      // 2. Update Student Profile with new file path
      const newDocuments = {
        ...profile?.registration?.documents,
        [data.type]: data.path,
      };

      updateProfileMutation.mutate({
        documents: newDocuments,
      });
    },
    onError: (error: any) => {
      toast.error(
        "Gagal mengupload file: " +
          (error.response?.data?.error || "Unknown error"),
      );
      setUploading({});
    },
  });

  // 2. Update Profile Document Link
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put("/student/profile", data);
    },
    onSuccess: () => {
      toast.success("Dokumen berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
      setUploading({});
    },
    onError: () => {
      toast.error("Gagal menyimpan link dokumen.");
      setUploading({});
    },
  });

  const handleUpload = (file: File | null, type: string) => {
    if (file) {
      uploadMutation.mutate({ file, type });
    }
  };

  const handleRemove = (type: string) => {
    // Ideally we might want to delete from server too, but for now just unlink
    updateProfileMutation.mutate({
      documents: {
        ...profile?.registration?.documents,
        [type]: "", // Clear path
      },
    });
  };

  if (profileLoading || settingsLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const registration = profile?.registration;
  const docs = registration?.documents || {};

  // Calculate Fee
  const waveName = registration?.wave || "Gelombang 1";
  const wave = settings?.waves?.find((w: any) => w.name === waveName);
  const totalFee = wave
    ? (Object.values(wave.items || {}).reduce(
        (a: any, b: any) => a + Number(b),
        0,
      ) as number)
    : 0;

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Upload Dokumen</h2>
        <p className="text-muted-foreground">
          Lengkapi persyaratan pendaftaran dengan mengupload dokumen asli.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Perhatian</AlertTitle>
        <AlertDescription>
          Pastikan dokumen yang diupload dapat terbaca dengan jelas. Format yang
          didukung: JPG, PNG, PDF. Maksimal 2MB.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Kartu Keluarga */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Kartu Keluarga (KK)
              {docs.familyCard && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              label="Scan/Foto KK Asli"
              value={docs.familyCard}
              onChange={(file) => handleUpload(file, "familyCard")}
              onRemove={() => handleRemove("familyCard")}
              disabled={uploading["familyCard"]}
            />
            {uploading["familyCard"] && (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                Mengupload...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Akta Kelahiran */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Akta Kelahiran
              {docs.birthCertificate && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              label="Scan/Foto Akta Asli"
              value={docs.birthCertificate}
              onChange={(file) => handleUpload(file, "birthCertificate")}
              onRemove={() => handleRemove("birthCertificate")}
              disabled={uploading["birthCertificate"]}
            />
            {uploading["birthCertificate"] && (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                Mengupload...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Bukti Pembayaran */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Bukti Pembayaran Pendaftaran
                  {docs.paymentProof && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
                <CardDescription className="mt-2 text-foreground/90">
                  Silahkan transfer sebesar{" "}
                  <span className="font-bold text-primary">
                    {formatCurrency(totalFee)}
                  </span>{" "}
                  ({waveName})
                  <br />
                  Ke {BANK_INFO.BANK_NAME}{" "}
                  <span className="font-mono font-bold">
                    {BANK_INFO.ACCOUNT_NUMBER}
                  </span>{" "}
                  a.n {BANK_INFO.ACCOUNT_NAME}
                </CardDescription>
              </div>
              <Link href="/student/payment">
                <Button variant="outline" size="sm">
                  Rincian Biaya
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <FileUpload
              label="Foto Bukti Transfer"
              value={docs.paymentProof}
              onChange={(file) => handleUpload(file, "paymentProof")}
              onRemove={() => handleRemove("paymentProof")}
              disabled={uploading["paymentProof"]}
            />
            {uploading["paymentProof"] && (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">
                Mengupload...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
