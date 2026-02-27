import Image from "next/image";
import Link from "next/link";
import { AuthQuote } from "@/components/auth-quote";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/school-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-linear-to-t from-blue-900/90 via-blue-900/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-1 text-2xl font-bold tracking-tight backdrop-blur-sm bg-white/30 rounded-md w-fit p-2 shadow-md">
            <div className="rounded-lg">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="h-10 w-10"
              />
            </div>
            <p className="text-blue-950 mr-2 uppercase">
              SMA Methodist 1 Palembang
            </p>
          </div>
          <AuthQuote />
        </div>
      </div>

      {/* ── Right panel / mobile full-screen ── */}
      <main className="flex min-h-screen flex-col bg-linear-to-br from-blue-950 to-blue-800">
        {/* Mobile header — hidden on desktop */}
        <div className="flex lg:hidden items-center gap-3 px-5 pt-8 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1.5 shadow">
              <Image
                src="/logo.svg"
                alt="Logo SMA Methodist 1"
                width={32}
                height={32}
                className="h-9 w-9"
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                SMA Methodist 1
              </p>
              <p className="text-yellow-300 text-xs font-semibold leading-tight">
                Palembang
              </p>
            </div>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-start lg:items-center justify-center px-5 sm:px-8 pb-10 pt-4 lg:p-12">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
