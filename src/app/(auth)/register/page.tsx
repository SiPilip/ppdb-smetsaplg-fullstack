"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nama lengkap terlalu pendek"),
    email: z.string().email("Email tidak valid"),
    phoneNumber: z
      .string()
      .min(10, "Nomor WhatsApp tidak valid")
      .regex(
        /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
        "Format nomor tidak valid (contoh: 0812...)",
      ),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    // TODO: Implement actual registration logic
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Pendaftaran berhasil! Silakan cek WA untuk OTP.");
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Buat Akun PPDB
        </h1>
        <p className="text-sm text-muted-foreground">
          Daftar untuk memulai proses penerimaan siswa baru
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nama Lengkap Siswa</Label>
              <Input
                id="fullName"
                placeholder="Cth: Budi Santoso"
                disabled={isLoading}
                {...register("fullName")}
                className={
                  errors.fullName
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.fullName && (
                <p className="text-xs text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="nama@contoh.com"
                type="email"
                disabled={isLoading}
                {...register("email")}
                className={
                  errors.email
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
              <Input
                id="phoneNumber"
                placeholder="0812..."
                type="tel"
                disabled={isLoading}
                {...register("phoneNumber")}
                className={
                  errors.phoneNumber
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.phoneNumber && (
                <p className="text-xs text-destructive">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...register("password")}
                  className={
                    errors.password
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Ulangi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Button disabled={isLoading} className="w-full mt-2">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Sudah punya akun?
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Masuk ke Akun
        </Link>
      </div>
    </>
  );
}
