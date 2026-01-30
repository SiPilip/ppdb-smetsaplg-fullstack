import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Siswa</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status Pendaftaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Belum Terkirim</div>
            <p className="text-xs text-muted-foreground">
              Silahkan lengkapi biodata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gelombang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gelombang 1</div>
            <p className="text-xs text-muted-foreground">
              Berakhir 31 Okt 2025
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Panduan Pendaftaran</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <ol className="list-decimal space-y-2 text-sm text-muted-foreground">
            <li>Lengkapi Biodata Siswa dan Orang Tua.</li>
            <li>Upload dokumen yang diperlukan (KK, Akta, dll).</li>
            <li>Lakukan pembayaran biaya pendaftaran.</li>
            <li>Upload bukti pembayaran.</li>
            <li>Tunggu verifikasi dari admin.</li>
            <li>Cetak Kartu Ujian/Bukti Pendaftaran.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
