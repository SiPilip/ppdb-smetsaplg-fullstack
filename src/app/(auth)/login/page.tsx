"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2, Mail, Lock } from "lucide-react";
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
      // Redirect based on role or default to student dashboard
      // Ideally we check role from response data
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
    <>
      <div className="flex flex-col space-y-2 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-white dark:text-gray-100">
          Selamat Datang{" "}
          <span className="animate-bounce transition-all duration-500">👋</span>
        </h1>
        <p className="text-sm text-white dark:text-gray-100">
          Anda memasuki sistem Penerimaan Peserta Didik Baru. <br />
          Masukan kredensial akun anda untuk mengakses sistem atau daftar
          terlebih dahulu
        </p>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
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
                  className={`pl-10 h-11 text-white ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive bg-red-400"
                      : "border-gray-200 dark:border-gray-800 focus-visible:ring-blue-600"
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
                  className={`pl-10 h-11  text-white ${
                    errors.password
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-gray-200 dark:border-gray-800 focus-visible:ring-blue-600"
                  }`}
                />
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              disabled={isLoading}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all hover:shadow-lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk Sekarang
            </Button>
          </div>
        </form>

        <div className="relative flex items-center">
          <div className="w-full flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase w-full text-nowrap">
            <span className="text-white dark:bg-zinc-950 px-2">
              Belum punya akun?
            </span>
          </div>
          <div className="w-full flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
        </div>

        <Link
          href="/register"
          className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-200 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50"
        >
          Daftar Akun Baru
        </Link>
      </div>
    </>
  );
}
