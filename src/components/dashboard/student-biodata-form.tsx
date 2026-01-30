"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/axios";

// Schema Validation
const biodataSchema = z.object({
  // Student Data
  student: z.object({
    fullName: z.string().min(1, "Nama lengkap wajib diisi"),
    gender: z.enum(["L", "P"]),
    birthPlace: z.string().min(1, "Tempat lahir wajib diisi"),
    birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
    originSchool: z.string().min(1, "Sekolah asal wajib diisi"),
    religion: z.string().min(1, "Agama wajib diisi"),
    livingWith: z.string().optional(),
    siblingCount: z.coerce.number().optional(),
    address: z.object({
      street: z.string().min(1, "Alamat jalan wajib diisi"),
      rt: z.string().optional(),
      rw: z.string().optional(),
      village: z.string().min(1, "Kelurahan wajib diisi"), // Kelurahan
      district: z.string().min(1, "Kecamatan wajib diisi"), // Kecamatan
      city: z.string().min(1, "Kota/Kabupaten wajib diisi"),
      province: z.string().min(1, "Provinsi wajib diisi"),
    }),
  }),
  // Parent Data
  father: z
    .object({
      name: z.string().min(1, "Nama ayah wajib diisi"),
      birthDate: z.string().optional(),
      education: z.string().optional(),
      job: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  mother: z
    .object({
      name: z.string().min(1, "Nama ibu wajib diisi"),
      birthDate: z.string().optional(),
      education: z.string().optional(),
      job: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  guardian: z
    .object({
      name: z.string().optional(),
      job: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
});

type BiodataFormValues = z.infer<typeof biodataSchema>;

interface StudentBiodataFormProps {
  initialData?: any;
}

export function StudentBiodataForm({ initialData }: StudentBiodataFormProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");

  const getDefaultValues = (): Partial<BiodataFormValues> => {
    const studentData = initialData?.registration?.student || {};
    const userData = initialData?.user || {};
    const fatherData = initialData?.registration?.father || {};
    const motherData = initialData?.registration?.mother || {};
    const guardianData = initialData?.registration?.guardian || {};

    const formatDate = (dateString: string) =>
      dateString ? new Date(dateString).toISOString().split("T")[0] : "";

    return {
      student: {
        fullName: studentData.fullName || userData.name || "",
        gender: studentData.gender || "L",
        birthPlace: studentData.birthPlace || "",
        birthDate: formatDate(studentData.birthDate),
        originSchool: studentData.originSchool || "",
        religion: studentData.religion || "",
        livingWith: studentData.livingWith || "",
        siblingCount: studentData.siblingCount || 0,
        address: {
          street: studentData.address?.street || "",
          rt: studentData.address?.rt || "",
          rw: studentData.address?.rw || "",
          village: studentData.address?.village || "",
          district: studentData.address?.district || "",
          city: studentData.address?.city || "",
          province: studentData.address?.province || "",
        },
      },
      father: {
        name: fatherData.name || "",
        birthDate: formatDate(fatherData.birthDate),
        education: fatherData.education || "",
        job: fatherData.job || "",
        phone: fatherData.phone || "",
      },
      mother: {
        name: motherData.name || "",
        birthDate: formatDate(motherData.birthDate),
        education: motherData.education || "",
        job: motherData.job || "",
        phone: motherData.phone || "",
      },
      guardian: {
        name: guardianData.name || "",
        job: guardianData.job || "",
        phone: guardianData.phone || "",
        address: guardianData.address || "",
      },
    };
  };

  const form = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataSchema) as any,
    defaultValues: getDefaultValues(),
  });

  // Reset form when initialData loads
  useEffect(() => {
    if (initialData) {
      form.reset(getDefaultValues());
    }
  }, [initialData, form]);

  const mutation = useMutation({
    mutationFn: async (data: BiodataFormValues) => {
      const response = await api.put("/student/profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Biodata berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menyimpan biodata");
      console.error(error);
    },
  });

  function onSubmit(data: BiodataFormValues) {
    mutation.mutate(data);
  }

  const { errors } = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Lengkapi Biodata
          </h2>
          <p className="text-muted-foreground">
            Mohon isi data diri dengan benar dan lengkap sesuai dokumen resmi
            (KK/Akta).
          </p>
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          Simpan Data
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="personal">Data Pribadi</TabsTrigger>
          <TabsTrigger value="parents">Data Orang Tua</TabsTrigger>
          <TabsTrigger value="guardian">Data Wali (Opsional)</TabsTrigger>
        </TabsList>

        {/* --- PERSONAL DATA TAB --- */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Data Pribadi Siswa</CardTitle>
              <CardDescription>
                Informasi detail mengenai calon peserta didik.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student.fullName">Nama Lengkap</Label>
                  <Input
                    id="student.fullName"
                    placeholder="Sesuai Akta Kelahiran"
                    {...form.register("student.fullName")}
                  />
                  {errors.student?.fullName && (
                    <p className="text-destructive text-xs">
                      {errors.student.fullName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student.gender">Jenis Kelamin</Label>
                  <select
                    id="student.gender"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("student.gender")}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  {errors.student?.gender && (
                    <p className="text-destructive text-xs">
                      {errors.student.gender.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Birth Place/Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student.birthPlace">Tempat Lahir</Label>
                  <Input
                    id="student.birthPlace"
                    placeholder="Contoh: Palembang"
                    {...form.register("student.birthPlace")}
                  />
                  {errors.student?.birthPlace && (
                    <p className="text-destructive text-xs">
                      {errors.student.birthPlace.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student.birthDate">Tanggal Lahir</Label>
                  <Input
                    id="student.birthDate"
                    type="date"
                    {...form.register("student.birthDate")}
                  />
                  {errors.student?.birthDate && (
                    <p className="text-destructive text-xs">
                      {errors.student.birthDate.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Origin School & Religion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student.originSchool">Asal Sekolah</Label>
                  <Input
                    id="student.originSchool"
                    placeholder="Nama SMP Asal"
                    {...form.register("student.originSchool")}
                  />
                  {errors.student?.originSchool && (
                    <p className="text-destructive text-xs">
                      {errors.student.originSchool.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student.religion">Agama</Label>
                  <select
                    id="student.religion"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...form.register("student.religion")}
                  >
                    <option value="">Pilih Agama</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Islam">Islam</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Konghucu">Konghucu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  {errors.student?.religion && (
                    <p className="text-destructive text-xs">
                      {errors.student.religion.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Other Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="student.livingWith">Tinggal Bersama</Label>
                  <Input
                    id="student.livingWith"
                    placeholder="Orang Tua / Wali / Asrama"
                    {...form.register("student.livingWith")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student.siblingCount">
                    Jumlah Saudara Kandung
                  </Label>
                  <Input
                    id="student.siblingCount"
                    type="number"
                    min="0"
                    {...form.register("student.siblingCount")}
                  />
                </div>
              </div>

              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Alamat Lengkap</h3>
                <div className="space-y-2">
                  <Label htmlFor="student.address.street">Alamat Jalan</Label>
                  <Textarea
                    id="student.address.street"
                    placeholder="Nama Jalan, No. Rumah"
                    {...form.register("student.address.street")}
                  />
                  {errors.student?.address?.street && (
                    <p className="text-destructive text-xs">
                      {errors.student.address.street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>RT</Label>
                    <Input
                      {...form.register("student.address.rt")}
                      placeholder="001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RW</Label>
                    <Input
                      {...form.register("student.address.rw")}
                      placeholder="002"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Kelurahan</Label>
                    <Input
                      {...form.register("student.address.village")}
                      placeholder="Kelurahan"
                    />
                    {errors.student?.address?.village && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.village.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Kecamatan</Label>
                    <Input
                      {...form.register("student.address.district")}
                      placeholder="Kecamatan"
                    />
                    {errors.student?.address?.district && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.district.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Kota/Kabupaten</Label>
                    <Input
                      {...form.register("student.address.city")}
                      placeholder="Kota"
                    />
                    {errors.student?.address?.city && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <Input
                      {...form.register("student.address.province")}
                      placeholder="Provinsi"
                    />
                    {errors.student?.address?.province && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.province.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PARENTS DATA TAB --- */}
        <TabsContent value="parents">
          <div className="grid gap-6">
            {/* Father */}
            <Card>
              <CardHeader>
                <CardTitle>Data Ayah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="father.name">Nama Lengkap Ayah</Label>
                  <Input
                    {...form.register("father.name")}
                    placeholder="Nama Ayah"
                  />
                  {errors.father?.name && (
                    <p className="text-destructive text-xs">
                      {errors.father.name.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Input type="date" {...form.register("father.birthDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon / HP</Label>
                    <Input
                      {...form.register("father.phone")}
                      placeholder="08..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pendidikan Terakhir</Label>
                    <Input
                      {...form.register("father.education")}
                      placeholder="SMA/S1/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pekerjaan</Label>
                    <Input
                      {...form.register("father.job")}
                      placeholder="Pekerjaan saat ini"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mother */}
            <Card>
              <CardHeader>
                <CardTitle>Data Ibu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mother.name">Nama Lengkap Ibu</Label>
                  <Input
                    {...form.register("mother.name")}
                    placeholder="Nama Ibu"
                  />
                  {errors.mother?.name && (
                    <p className="text-destructive text-xs">
                      {errors.mother.name.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tanggal Lahir</Label>
                    <Input type="date" {...form.register("mother.birthDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon / HP</Label>
                    <Input
                      {...form.register("mother.phone")}
                      placeholder="08..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pendidikan Terakhir</Label>
                    <Input
                      {...form.register("mother.education")}
                      placeholder="SMA/S1/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pekerjaan</Label>
                    <Input
                      {...form.register("mother.job")}
                      placeholder="Pekerjaan saat ini"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- GUARDIAN DATA TAB --- */}
        <TabsContent value="guardian">
          <Card>
            <CardHeader>
              <CardTitle>Data Wali</CardTitle>
              <CardDescription>
                Isi jika tinggal bersama wali (bukan orang tua kandung).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guardian.name">Nama Wali</Label>
                <Input
                  {...form.register("guardian.name")}
                  placeholder="Nama Wali"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pekerjaan</Label>
                  <Input {...form.register("guardian.job")} />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon / HP</Label>
                  <Input
                    {...form.register("guardian.phone")}
                    placeholder="08..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian.address">Alamat Wali</Label>
                <Textarea
                  {...form.register("guardian.address")}
                  placeholder="Alamat lengkap wali"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pb-8">
        <Button size="lg" type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          Simpan Semua Data
        </Button>
      </div>
    </form>
  );
}
