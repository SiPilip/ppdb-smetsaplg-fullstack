"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  User as UserIcon,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// ── Account schemas ──────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Wajib diisi"),
    newPassword: z.string().min(6, "Minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Wajib diisi"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch admin user data ──────────────────────────────
  const { data: adminUser } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((r) => r.data.user),
  });

  // ── Profile & password forms ───────────────────────────
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: adminUser?.name ?? "", email: adminUser?.email ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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

  // ── Wave / Fee settings ────────────────────────────────
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await api.get("/settings");
      return response.data;
    },
  });

  useEffect(() => {
    if (settings) {
      const initialData = JSON.parse(JSON.stringify(settings));
      if (!initialData.waves) initialData.waves = [];
      setFormData(initialData);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put("/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Pengaturan berhasil disimpan");
    },
    onError: (errors: any) => {
      toast.error(
        "Gagal menyimpan pengaturan: " + errors.response.data.message,
      );
    },
  });

  if (isLoading || !formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleWaveChange = (
    waveIndex: number,
    field: string,
    value: string,
  ) => {
    setFormData((prev: any) => {
      const newWaves = [...prev.waves];
      newWaves[waveIndex] = { ...newWaves[waveIndex], [field]: value };
      return { ...prev, waves: newWaves };
    });
  };

  const addWave = () => {
    const defaultItems = feeKeys.reduce((acc: any, key: string) => {
      acc[key] = 0;
      return acc;
    }, {});
    setFormData((prev: any) => ({
      ...prev,
      waves: [
        ...prev.waves,
        {
          name: `Gelombang ${prev.waves.length + 1}`,
          startDate: new Date(),
          items: defaultItems,
        },
      ],
    }));
  };

  const removeWave = (index: number) => {
    if (confirm("Hapus Gelombang ini?")) {
      setFormData((prev: any) => ({
        ...prev,
        waves: prev.waves.filter((_: any, i: number) => i !== index),
      }));
    }
  };

  const handleFeeItemChange = (
    waveIndex: number,
    feeKey: string,
    value: string,
  ) => {
    setFormData((prev: any) => {
      const newWaves = [...prev.waves];
      newWaves[waveIndex] = { ...newWaves[waveIndex] };
      newWaves[waveIndex].items = { ...(newWaves[waveIndex].items || {}) };
      newWaves[waveIndex].items[feeKey] = Number(value);
      return { ...prev, waves: newWaves };
    });
  };

  const saveSettings = () => updateMutation.mutate(formData);

  const feeKeys = [
    "registration",
    "participation",
    "uniformSport",
    "uniformBatik",
    "developmentArts",
    "developmentAcademic",
    "books",
    "orientation",
    "lab",
    "library",
    "healthUnit",
    "osis",
    "tuition",
  ];
  const feeLabels: Record<string, string> = {
    registration: "Uang Pendaftaran",
    participation: "Dana Partisipasi",
    uniformSport: "Seragam Olah Raga",
    uniformBatik: "Seragam Batik",
    developmentArts: "Pengembangan Seni",
    developmentAcademic: "Pengembangan Akademik",
    books: "Buku Tulis",
    orientation: "MPLS",
    lab: "Lab",
    library: "Perpustakaan",
    healthUnit: "UKS",
    osis: "OSIS",
    tuition: "SPP",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h2>
      </div>

      {/* ── Akun Administrator ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Profil */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4 text-primary" />
              Akun Administrator
            </CardTitle>
            <CardDescription>
              Ubah nama tampilan dan email login.
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
                <Label>Nama</Label>
                <Input {...profileForm.register("name")} />
                {profileForm.formState.errors.name && (
                  <p className="text-destructive text-xs">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email Login</Label>
                <Input type="email" {...profileForm.register("email")} />
                {profileForm.formState.errors.email && (
                  <p className="text-destructive text-xs">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={profileMutation.isPending}
                >
                  {profileMutation.isPending ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-3.5 w-3.5" />
                  )}
                  Simpan Profil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Ganti Password */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-primary" />
              Ganti Password
            </CardTitle>
            <CardDescription>
              Wajib verifikasi password lama terlebih dahulu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit((d) =>
                passwordMutation.mutate(d),
              )}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    {...passwordForm.register("currentPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    {...passwordForm.register("newPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              <div className="space-y-2">
                <Label>Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    {...passwordForm.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={passwordMutation.isPending}
                >
                  {passwordMutation.isPending ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-3.5 w-3.5" />
                  )}
                  Ganti Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Wave fee settings header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Pengaturan Gelombang & Biaya</h3>
        <div className="flex gap-2">
          <Button onClick={addWave} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Tambah Gelombang
          </Button>
          <Button onClick={saveSettings} disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" /> Simpan Gelombang
          </Button>
        </div>
      </div>

      {formData.waves?.map((wave: any, waveIndex: number) => (
        <Card
          key={waveIndex}
          className="border-l-4 border-l-primary shadow-sm mb-6"
        >
          <CardHeader className="flex flex-row items-start justify-between bg-muted/20 pb-4">
            <div className="space-y-2 w-full">
              <div className="flex gap-4 items-center">
                <Input
                  className="text-lg font-bold w-1/3 bg-background"
                  value={wave.name}
                  onChange={(e) =>
                    handleWaveChange(waveIndex, "name", e.target.value)
                  }
                  placeholder="Nama Gelombang"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => removeWave(waveIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="grid gap-1">
                  <Label className="text-xs">Mulai</Label>
                  <Input
                    type="date"
                    className="bg-background"
                    value={
                      wave.startDate
                        ? new Date(wave.startDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleWaveChange(waveIndex, "startDate", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs">Selesai</Label>
                  <Input
                    type="date"
                    className="bg-background"
                    value={
                      wave.endDate
                        ? new Date(wave.endDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleWaveChange(waveIndex, "endDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Total Biaya:
              </span>
              <span className="text-xl font-bold text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(
                  Object.values(wave.items || {}).reduce(
                    (a: any, b: any) => a + Number(b),
                    0,
                  ) as number,
                )}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Label className="mb-4 block text-base font-semibold">
              Rincian Biaya
            </Label>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {feeKeys.map((key) => (
                <div
                  key={key}
                  className="grid gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Label className="text-xs font-medium text-muted-foreground uppercase">
                    {feeLabels[key] || key}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-gray-500">
                      Rp
                    </span>
                    <Input
                      type="number"
                      className="pl-8 font-mono"
                      value={wave.items?.[key] || 0}
                      onChange={(e) =>
                        handleFeeItemChange(waveIndex, key, e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
