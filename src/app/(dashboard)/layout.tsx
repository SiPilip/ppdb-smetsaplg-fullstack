"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  LayoutDashboard,
  User,
  FileText,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const sidebarItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/biodata", label: "Biodata Siswa", icon: User },
  { href: "/student/documents", label: "Dokumen", icon: FileText },
  { href: "/student/settings", label: "Pengaturan", icon: Settings },
];

const adminSidebarItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verifications", label: "Verifikasi", icon: FileText },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background border-gray-300">
      {/* Mobile Sidebar Trigger */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-300 bg-background/95 px-4 backdrop-blur lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <SidebarContent pathname={pathname} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6" />
          <span>PPDB Mobile</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 lg:block min-h-screen border-gray-300">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto border-gray-300 ">
        <div className="flex items-center justify-end p-4 border-b border-gray-300">
          <UserNav />
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-16 items-center border-b border-gray-300 px-6">
        <Link href="/" className="flex items-center font-semibold">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={32}
            height={32}
            className="h-10 w-10"
          />
          <span>PPDB Methodist 1</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {(pathname.startsWith("/admin")
            ? adminSidebarItems
            : sidebarItems
          ).map((item, index) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-gray-300">
        <div className="bg-primary/10 p-4 rounded-lg">
          <h4 className="font-semibold text-primary">Butuh Bantuan?</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Hubungi admin via WhatsApp jika ada kendala.
          </p>
        </div>
      </div>
    </div>
  );
}

function UserNav() {
  const pathname = usePathname();

  // Detect role from current path
  const isAdmin = pathname.startsWith("/admin");
  const settingsHref = isAdmin ? "/admin/settings" : "/student/settings";
  const profileHref = isAdmin ? "/admin/settings" : "/student/biodata";

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Generate initials from name
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
    : "??";

  const roleLabel = user?.role === "admin" ? "Administrator" : "Siswa";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name ?? "..."}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>
            <span className="text-xs text-primary font-medium mt-0.5">
              {roleLabel}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={profileHref}>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil / Biodata</span>
          </DropdownMenuItem>
        </Link>
        <Link href={settingsHref}>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Pengaturan</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
