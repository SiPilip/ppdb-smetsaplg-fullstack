"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Loader2, Search, Download, Printer, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function VerificationListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: verifications, isLoading } = useQuery({
    queryKey: ["adminVerifications"],
    queryFn: async () => {
      const response = await api.get("/admin/verifications");
      return response.data.registrations;
    },
  });

  // Filter Logic
  const filteredData = useMemo(() => {
    if (!verifications) return [];

    return verifications.filter((item: any) => {
      // 1. Search Filter
      const matchesSearch =
        item.student?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        item.userId?.phoneNumber?.includes(search);

      // 2. Status Filter
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      // 3. Date Filter
      let matchesDate = true;
      if (dateRange?.from) {
        const itemDate = new Date(item.createdAt);
        if (dateRange.to) {
          matchesDate = itemDate >= dateRange.from && itemDate <= dateRange.to;
        } else {
          matchesDate = itemDate >= dateRange.from;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [verifications, search, statusFilter, dateRange]);

  // Export to Excel
  const handleExportExcel = () => {
    if (!filteredData.length) return;

    const exportData = filteredData.map((item: any) => {
      const s = item.student || {};
      const f = item.father || {};
      const m = item.mother || {};
      const g = item.guardian || {};
      const d = item.documents || {};
      const addr = s.address || {};

      return {
        // Registrasi
        "No. Pendaftaran": item.registrationNumber || "-",
        Gelombang: item.wave || "-",
        "Tanggal Daftar": item.createdAt
          ? format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")
          : "-",
        "Status Validasi": item.status,
        "Akun Email": item.userId?.email || "-",
        "Akun No. HP": item.userId?.phoneNumber || "-",

        // Siswa
        NISN: s.nisn || "-",
        "Nama Lengkap": s.fullName || "-",
        "Jenis Kelamin":
          s.gender === "L" ? "Laki-laki" : s.gender === "P" ? "Perempuan" : "-",
        "Tempat Lahir": s.birthPlace || "-",
        "Tanggal Lahir": s.birthDate
          ? format(new Date(s.birthDate), "yyyy-MM-dd")
          : "-",
        Agama: s.religion || "-",
        "Asal Sekolah": s.originSchool || "-",
        "Jumlah Saudara": s.siblingCount || 0,
        "Tinggal Bersama": s.livingWith || "-",

        // Alamat
        Alamat: addr.street || "-",
        RT: addr.rt || "-",
        RW: addr.rw || "-",
        Kelurahan: addr.village || "-",
        Kecamatan: addr.district || "-",
        Kota: addr.city || "-",
        Provinsi: addr.province || "-",

        // Ayah
        "Nama Ayah": f.name || "-",
        "No. HP Ayah": f.phone || "-",
        "Pekerjaan Ayah": f.job || "-",
        "Pendidikan Ayah": f.education || "-",
        "Tgl Lahir Ayah": f.birthDate
          ? format(new Date(f.birthDate), "yyyy-MM-dd")
          : "-",

        // Ibu
        "Nama Ibu": m.name || "-",
        "No. HP Ibu": m.phone || "-",
        "Pekerjaan Ibu": m.job || "-",
        "Pendidikan Ibu": m.education || "-",
        "Tgl Lahir Ibu": m.birthDate
          ? format(new Date(m.birthDate), "yyyy-MM-dd")
          : "-",

        // Wali
        "Nama Wali": g.name || "-",
        "No. HP Wali": g.phone || "-",
        "Pekerjaan Wali": g.job || "-",
        "Alamat Wali": g.address || "-",

        // Dokumen
        "Link KK": d.familyCard || "-",
        "Link Akta": d.birthCertificate || "-",
        "Link Bukti Bayar": d.paymentProof || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-width columns
    const wscols = Object.keys(exportData[0]).map(() => ({ wch: 20 }));
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lengkap PPDB");
    XLSX.writeFile(
      workbook,
      `Data_Lengkap_PPDB_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`,
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Diterima</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">
            Perlu Verifikasi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Verifikasi Pendaftaran
          </h2>
          <p className="text-muted-foreground">
            Kelola data pendaftaran siswa baru.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="default" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm print:hidden">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau no.hp..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="verified">Diterima</SelectItem>
              <SelectItem value="pending">Perlu Verifikasi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="w-[300px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border rounded-md bg-white print:border-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Siswa</TableHead>
              <TableHead>Gelombang</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right print:hidden">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  Tidak ada data ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    {item.student?.fullName || "Tanpa Nama"}
                    <div className="text-xs text-muted-foreground">
                      {item.userId?.phoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>{item.wave || "-"}</TableCell>
                  <TableCell>
                    {item.createdAt
                      ? format(new Date(item.createdAt), "dd MMM yyyy", {
                          locale: id,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right print:hidden">
                    <Link href={`/admin/verifications/${item._id}`}>
                      <Button size="sm" variant="outline">
                        Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="hidden print:block text-center mt-8 text-sm text-gray-500">
        Dicetak pada {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}
        <br />
        Panitia PPDB SMA Methodist 1 Palembang
      </div>
    </div>
  );
}
