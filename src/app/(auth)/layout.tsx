import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900 mix-blend-multiply opacity-90" />
        <div className="absolute inset-0 bg-[url('/school-bg.jpg')] bg-cover bg-center mix-blend-overlay opacity-20" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="h-8 w-8" />
            <span>SMA Methodist 1 Palembang</span>
          </div>

          <div className="space-y-4">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Pendidikan adalah senjata paling ampuh yang bisa Anda
                gunakan untuk mengubah dunia.&rdquo;
              </p>
              <footer className="text-sm border-t border-white/20 pt-4 mt-4">
                Nelson Mandela
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      <main className="flex items-center justify-center p-8 lg:p-12 bg-background">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </main>
    </div>
  );
}
