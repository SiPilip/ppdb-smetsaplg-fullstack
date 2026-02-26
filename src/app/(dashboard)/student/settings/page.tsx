"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User as UserIcon,
  KeyRound,
  ShieldCheck,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// ── Schemas ──────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  phoneNumber: z.string().min(10, "Nomor HP tidak valid"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ── Status badge helper ───────────────────────────────────
const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-500" },
  pending: {
    label: "Menunggu Verifikasi",
    className: "bg-yellow-500 text-black",
  },
  verified: { label: "Diterima ✓", className: "bg-green-600" },
  rejected: { label: "Ditolak", className: "bg-red-600" },
};

// ─────────────────────────────────────────────────────────
export default function StudentSettingsPage() {
  const queryClient = useQueryClient();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch current user & registration data ──────────────
  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((r) => r.data.user),
  });

  const { data: profileData } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: () => api.get("/student/profile").then((r) => r.data),
  });

  // ── Profile form ────────────────────────────────────────
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: userData?.name ?? "",
      phoneNumber: userData?.phoneNumber ?? "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => api.put("/auth/settings", data),
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal memperbarui profil"),
  });

  // ── Password form ───────────────────────────────────────
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      api.put("/auth/settings", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    onSuccess: () => {
      toast.success("Password berhasil diganti");
      passwordForm.reset();
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Gagal mengganti password"),
  });

  const registration = profileData?.registration;
  const status = registration?.status ?? "draft";
  const statusInfo = statusConfig[status] ?? statusConfig.draft;

  if (loadingUser) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pengaturan Akun</h2>
        <p className="text-muted-foreground">
          Kelola informasi profil dan keamanan akun Anda.
        </p>
      </div>

      {/* ── 1. Informasi Akun (read-only) ───────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Informasi Akun
          </CardTitle>
          <CardDescription>
            Detail akun yang tidak dapat diubah secara langsung.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground font-medium">Email</p>
              <p className="font-semibold">{userData?.email ?? "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-medium">
                No. Pendaftaran
              </p>
              <p className="font-semibold">
                {registration?.registrationNumber ?? "Belum digenerate"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-medium">Gelombang</p>
              <p className="font-semibold">{registration?.wave ?? "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground font-medium">
                Status Pendaftaran
              </p>
              <Badge className={`${statusInfo.className} capitalize`}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Edit Profil ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Edit Profil
          </CardTitle>
          <CardDescription>
            Perbarui nama tampilan dan nomor WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit((d) =>
              profileMutation.mutate(d),
            )}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-destructive text-xs">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="08xxxxxxxxxx"
                {...profileForm.register("phoneNumber")}
              />
              {profileForm.formState.errors.phoneNumber && (
                <p className="text-destructive text-xs">
                  {profileForm.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Profil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── 3. Ganti Password ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Ganti Password
          </CardTitle>
          <CardDescription>
            Pastikan password baru cukup kuat dan tidak mudah ditebak.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit((d) =>
              passwordMutation.mutate(d),
            )}
            className="space-y-4"
          >
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  {...passwordForm.register("currentPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrent((p) => !p)}
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-destructive text-xs">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <Separator />

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  {...passwordForm.register("newPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew((p) => !p)}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-destructive text-xs">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  {...passwordForm.register("confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm((p) => !p)}
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-xs">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="outline"
                disabled={passwordMutation.isPending}
              >
                {passwordMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Ganti Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
