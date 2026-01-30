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
      <div className="hidden lg:block relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('/school-bg.png')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-linear-to-t from-blue-900/90 via-blue-900/40 to-transparent" />

        {/* Content Overlay */}
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

      <main className="flex items-center justify-center p-8 lg:p-12 bg-linear-to-br from-blue-950 to-blue-800 dark:bg-linear-to-br dark:from-blue-950 dark:to-blue-800">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
