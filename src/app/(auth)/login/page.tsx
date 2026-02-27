"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2, Mail, Lock, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Berhasil masuk!");
      if (data.user?.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        "Gagal masuk. Periksa kredensial anda.";
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
              PPDB Online
            </p>
            <p className="text-yellow-300 text-xs font-semibold">
              SMA Methodist 1 Palembang
            </p>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Selamat Datang <span className="animate-bounce inline-block">👋</span>
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          Masukkan email dan password untuk mengakses sistem PPDB.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-white/80 text-sm font-medium block"
          >
            Email
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail className="h-4 w-4 text-blue-300" />
            </div>
            <Input
              id="email"
              placeholder="nama@contoh.com"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
              className={`pl-10 h-12 text-sm bg-white border text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 rounded-xl ${
                errors.email
                  ? "border-red-400 bg-red-50"
                  : "border-white/30 focus:border-blue-400"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-300 flex items-center gap-1 ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-white/80 text-sm font-medium block"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-300 hover:text-blue-200 hover:underline transition-colors"
            >
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="h-4 w-4 text-blue-300" />
            </div>
            <Input
              id="password"
              placeholder="Masukkan password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
              className={`pl-10 h-12 text-sm bg-white border text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 rounded-xl ${
                errors.password
                  ? "border-red-400 bg-red-50"
                  : "border-white/30 focus:border-blue-400"
              }`}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-300 flex items-center gap-1 ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          disabled={isLoading}
          className="w-full h-12 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all hover:shadow-xl rounded-xl mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "Masuk Sekarang"
          )}
        </Button>
      </form>

      {/* Divider + register link */}
      <div className="flex items-center gap-3">
        <span className="flex-1 border-t border-white/20" />
        <span className="text-white/50 text-xs">Belum punya akun?</span>
        <span className="flex-1 border-t border-white/20" />
      </div>

      <Link
        href="/register"
        className="flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all duration-200 active:scale-95"
      >
        Daftar Akun Baru
      </Link>
    </div>
  );
}
