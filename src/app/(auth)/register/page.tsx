"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Key,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
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

// ─── Reusable field ───────────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-white/80 text-sm font-medium block"
      >
        {label}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="h-4 w-4 text-blue-300" />
        </div>
        {children}
      </div>
      {error && <p className="text-xs text-red-300 ml-1">{error}</p>}
    </div>
  );
}

const inputCls = (hasError?: boolean) =>
  `pl-10 h-12 text-sm bg-white border text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 rounded-xl ${
    hasError
      ? "border-red-400 bg-red-50"
      : "border-white/30 focus:border-blue-400"
  }`;

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OtpScreen({
  phone,
  otpCode,
  onOtpChange,
  onVerify,
  onBack,
  isLoading,
}: {
  phone: string;
  otpCode: string;
  onOtpChange: (v: string) => void;
  onVerify: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
              Verifikasi Akun
            </p>
            <p className="text-yellow-300 text-xs font-semibold">
              Cek WhatsApp Anda
            </p>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Masukkan Kode OTP
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          Kode 6 digit telah dikirim ke{" "}
          <span className="text-white font-semibold">{phone}</span> via
          WhatsApp.
        </p>
      </div>

      <form onSubmit={onVerify} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="otp"
            className="text-white/80 text-sm font-medium block"
          >
            Kode OTP
          </Label>
          <Input
            id="otp"
            placeholder="• • • • • •"
            value={otpCode}
            onChange={(e) =>
              onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="h-16 text-center text-3xl tracking-[0.5em] font-black bg-white/10 border border-white/20 text-white placeholder:text-white/20 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-0"
            maxLength={6}
            inputMode="numeric"
            disabled={isLoading}
          />
          <p className="text-xs text-white/50 text-center">
            {otpCode.length}/6 digit
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || otpCode.length < 6}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all hover:shadow-xl rounded-xl disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            "✓ Verifikasi Akun"
          )}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors py-2"
        >
          ← Salah nomor? Kembali
        </button>
      </form>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
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

  // ── OTP screen
  if (isOtpSent) {
    return (
      <OtpScreen
        phone={registeredPhone}
        otpCode={otpCode}
        onOtpChange={setOtpCode}
        onVerify={onVerify}
        onBack={() => setIsOtpSent(false)}
        isLoading={isLoading}
      />
    );
  }

  // ── Registration form
  return (
    <div className="w-full space-y-5">
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
          Buat Akun Baru
        </h1>
        <p className="text-sm text-white/70 leading-relaxed">
          Daftarkan diri Anda untuk memulai proses PPDB secara online.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Nama Lengkap */}
        <Field
          label="Nama Lengkap Siswa"
          htmlFor="fullName"
          icon={User}
          error={errors.fullName?.message}
        >
          <Input
            id="fullName"
            placeholder="Nama Lengkap Siswa"
            disabled={isLoading}
            autoComplete="name"
            {...register("fullName")}
            className={inputCls(!!errors.fullName)}
          />
        </Field>

        {/* Email */}
        <Field
          label="Email"
          htmlFor="email"
          icon={Mail}
          error={errors.email?.message}
        >
          <Input
            id="email"
            placeholder="nama@contoh.com"
            type="email"
            disabled={isLoading}
            autoComplete="email"
            {...register("email")}
            className={inputCls(!!errors.email)}
          />
        </Field>

        {/* Nomor WA */}
        <Field
          label="Nomor WhatsApp Aktif"
          htmlFor="phoneNumber"
          icon={Phone}
          error={errors.phoneNumber?.message}
        >
          <Input
            id="phoneNumber"
            placeholder="08xxxxxxxxxx"
            type="tel"
            inputMode="tel"
            disabled={isLoading}
            autoComplete="tel"
            {...register("phoneNumber")}
            className={inputCls(!!errors.phoneNumber)}
          />
        </Field>

        {/* Password & Konfirmasi — stack di mobile, 2-col di md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Field
            label="Password"
            htmlFor="password"
            icon={Lock}
            error={errors.password?.message}
          >
            <Input
              id="password"
              placeholder="Min. 6 karakter"
              type="password"
              disabled={isLoading}
              autoComplete="new-password"
              {...register("password")}
              className={inputCls(!!errors.password)}
            />
          </Field>

          <Field
            label="Ulangi Password"
            htmlFor="confirmPassword"
            icon={Key}
            error={errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              placeholder="Ulangi password"
              type="password"
              disabled={isLoading}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={inputCls(!!errors.confirmPassword)}
            />
          </Field>
        </div>

        <Button
          disabled={isLoading}
          className="w-full h-12 bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all hover:shadow-xl rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mendaftarkan...
            </>
          ) : (
            "Daftar Sekarang →"
          )}
        </Button>
      </form>

      {/* Divider + login link */}
      <div className="flex items-center gap-3">
        <span className="flex-1 border-t border-white/20" />
        <span className="text-white/50 text-xs">Sudah punya akun?</span>
        <span className="flex-1 border-t border-white/20" />
      </div>

      <Link
        href="/login"
        className="flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all duration-200 active:scale-95"
      >
        Masuk ke Akun
      </Link>
    </div>
  );
}
