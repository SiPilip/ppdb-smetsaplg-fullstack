"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2, User, Mail, Phone, Lock, Key } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

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
  const router = useRouter();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [registeredPhone, setRegisteredPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const payload = {
        name: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      };
      const response = await api.post("/auth/register", payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      setRegisteredPhone(variables.phoneNumber);
      setIsOtpSent(true);
      toast.success(data.message || "OTP terkirim! Silahkan cek WhatsApp.");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Terjadi kesalahan saat mendaftar.";
      toast.error(message);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          const path = err.path[0];
          if (path) {
            setError(path as any, { message: err.message });
          }
        });
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/verify-otp", {
        phoneNumber: registeredPhone,
        otp: otpCode,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Verifikasi berhasil! Silakan login.");
      router.push("/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Verifikasi gagal.";
      toast.error(message);
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      toast.error("Masukkan 6 digit kode OTP.");
      return;
    }
    verifyOtpMutation.mutate();
  };

  const isLoading = registerMutation.isPending || verifyOtpMutation.isPending;

  if (isOtpSent) {
    return (
      <>
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white dark:text-gray-100">
            Verifikasi OTP
          </h1>
          <p className="text-sm text-white dark:text-gray-400">
            Masukkan 6 digit kode yang dikirim ke WhatsApp{" "}
            <strong>{registeredPhone}</strong>
          </p>
        </div>

        <div className="grid gap-6">
          <form onSubmit={onVerify} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp" className="sr-only">
                Kode OTP
              </Label>
              <Input
                id="otp"
                placeholder="Masukkan Kode OTP (contoh: 123456)"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="h-12 text-center text-lg tracking-widest bg-white text-black"
                maxLength={6}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verifikasi Akun
            </Button>

            <p className="text-xs text-center text-white/80">
              Salah nomor?{" "}
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="underline hover:text-white"
              >
                Kembali
              </button>
            </p>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-white dark:text-gray-100">
          Buat Akun Baru
        </h1>
        <p className="text-sm text-white dark:text-gray-400">
          Bergabunglah dengan komunitas kami untuk memulai
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="sr-only">
                Nama Lengkap Siswa
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-white z-10">
                  <User className="h-5 w-5 text-blue-950 z-10" />
                </div>
                <Input
                  id="fullName"
                  placeholder="Nama Lengkap Siswa"
                  disabled={isLoading}
                  {...register("fullName")}
                  className={`pl-10 h-11 bg-white text-white ${
                    errors.fullName
                      ? "border-destructive focus-visible:ring-destructive bg-red-50"
                      : "border-gray-200 focus-visible:ring-blue-600"
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-destructive ml-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-white z-10">
                  <Mail className="h-5 w-5 text-blue-950 z-10" />
                </div>
                <Input
                  id="email"
                  placeholder="nama@contoh.com"
                  type="email"
                  disabled={isLoading}
                  {...register("email")}
                  className={`pl-10 h-11 bg-white text-white ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive bg-red-50"
                      : "border-gray-200 focus-visible:ring-blue-600"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber" className="sr-only">
                Nomor WhatsApp
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-white z-10">
                  <Phone className="h-5 w-5 text-blue-950 z-10" />
                </div>
                <Input
                  id="phoneNumber"
                  placeholder="Nomor WhatsApp (08...)"
                  type="tel"
                  disabled={isLoading}
                  {...register("phoneNumber")}
                  className={`pl-10 h-11 bg-white text-white ${
                    errors.phoneNumber
                      ? "border-destructive focus-visible:ring-destructive bg-red-50"
                      : "border-gray-200 focus-visible:ring-blue-600"
                  }`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-destructive ml-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-white z-10">
                    <Lock className="h-5 w-5 text-blue-950 z-10" />
                  </div>
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    disabled={isLoading}
                    {...register("password")}
                    className={`pl-10 h-11 bg-white text-white ${
                      errors.password
                        ? "border-destructive focus-visible:ring-destructive bg-red-50"
                        : "border-gray-200 focus-visible:ring-blue-600"
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="sr-only">
                  Ulangi Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-white z-10">
                    <Key className="h-5 w-5 text-blue-950 z-10" />
                  </div>
                  <Input
                    id="confirmPassword"
                    placeholder="Ulangi Password"
                    type="password"
                    disabled={isLoading}
                    {...register("confirmPassword")}
                    className={`pl-10 h-11 bg-white text-white ${
                      errors.confirmPassword
                        ? "border-destructive focus-visible:ring-destructive bg-red-50"
                        : "border-gray-200 focus-visible:ring-blue-600"
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all hover:shadow-lg mt-2"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar Sekarang
            </Button>
          </div>
        </form>

        <div className="relative flex items-center">
          <div className="w-full flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase w-full text-nowrap">
            <span className="text-white dark:bg-zinc-950 px-2">
              Sudah punya akun?
            </span>
          </div>
          <div className="w-full flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50"
        >
          Masuk ke Akun
        </Link>
      </div>
    </>
  );
}
