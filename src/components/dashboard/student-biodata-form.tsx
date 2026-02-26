"use client";

import { useEffect, useState, useRef } from "react";
import { useIndonesiaRegions } from "@/hooks/useIndonesiaRegions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, CloudOff } from "lucide-react";
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

const DRAFT_KEY = "ppdb_biodata_draft";

// Schema Validation
const biodataSchema = z.object({
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
      village: z.string().min(1, "Kelurahan wajib diisi"),
      district: z.string().min(1, "Kecamatan wajib diisi"),
      city: z.string().min(1, "Kota/Kabupaten wajib diisi"),
      province: z.string().min(1, "Provinsi wajib diisi"),
    }),
  }),
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
  const [hasDraft, setHasDraft] = useState(false);
  const initialDataLoadedRef = useRef(false);

  // Cascading address state — store selected IDs for chaining API calls
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const {
    provinces,
    cities,
    districts,
    villages,
    loadingProvinces,
    loadingCities,
    loadingDistricts,
    loadingVillages,
    fetchProvinces,
    fetchCities,
    fetchDistricts,
    fetchVillages,
  } = useIndonesiaRegions();

  const getDefaultValues = (source?: any): Partial<BiodataFormValues> => {
    const data = source || initialData;
    const studentData = data?.registration?.student || {};
    const userData = data?.user || {};
    const fatherData = data?.registration?.father || {};
    const motherData = data?.registration?.mother || {};
    const guardianData = data?.registration?.guardian || {};

    const fmtDate = (d: string) =>
      d ? new Date(d).toISOString().split("T")[0] : "";

    return {
      student: {
        fullName: studentData.fullName || userData.name || "",
        gender: studentData.gender || "L",
        birthPlace: studentData.birthPlace || "",
        birthDate: fmtDate(studentData.birthDate),
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
        birthDate: fmtDate(fatherData.birthDate),
        education: fatherData.education || "",
        job: fatherData.job || "",
        phone: fatherData.phone || "",
      },
      mother: {
        name: motherData.name || "",
        birthDate: fmtDate(motherData.birthDate),
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

  // On mount: load from localStorage if draft exists
  useEffect(() => {
    if (initialData && !initialDataLoadedRef.current) {
      initialDataLoadedRef.current = true;
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          form.reset(parsed);
          setHasDraft(true);
        } catch {
          form.reset(getDefaultValues());
        }
      } else {
        form.reset(getDefaultValues());
      }
    }
  }, [initialData]);

  // Auto-save draft to localStorage whenever form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (initialDataLoadedRef.current) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  const discardDraft = () => {
    clearDraft();
    form.reset(getDefaultValues());
  };

  const mutation = useMutation({
    mutationFn: async (data: BiodataFormValues) => {
      const response = await api.put("/student/profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Biodata berhasil disimpan");
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ["studentProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menyimpan biodata");
    },
  });

  function onSubmit(data: BiodataFormValues) {
    mutation.mutate(data);
  }

  function onInvalid(errs: any) {
    const hasPersonalErrors = errs.student;
    const hasParentErrors = errs.father || errs.mother;
    const hasGuardianErrors = errs.guardian;

    if (activeTab === "personal" && hasPersonalErrors) {
      const firstMsg =
        errs.student?.fullName?.message ||
        errs.student?.birthPlace?.message ||
        errs.student?.birthDate?.message ||
        errs.student?.originSchool?.message ||
        errs.student?.religion?.message ||
        errs.student?.address?.street?.message ||
        errs.student?.address?.village?.message ||
        errs.student?.address?.district?.message ||
        errs.student?.address?.city?.message ||
        errs.student?.address?.province?.message ||
        "Ada field yang belum diisi di tab Data Pribadi.";
      toast.error(firstMsg);
    } else if (activeTab === "parents" && hasParentErrors) {
      const firstMsg =
        errs.father?.name?.message ||
        errs.mother?.name?.message ||
        "Ada field yang belum diisi di tab Data Orang Tua.";
      toast.error(firstMsg);
    } else if (activeTab === "guardian" && hasGuardianErrors) {
      toast.error("Ada field yang belum diisi di tab Data Wali.");
    } else if (hasPersonalErrors) {
      toast.error("Ada data yang belum lengkap di tab Data Pribadi.");
    } else if (hasParentErrors) {
      toast.error("Ada data yang belum lengkap di tab Data Orang Tua.");
    }
  }

  const { errors } = form.formState;

  const tabHasError = {
    personal: !!errors.student,
    parents: !!(errors.father || errors.mother),
    guardian: !!errors.guardian,
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="space-y-8"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Lengkapi Biodata
          </h2>
          <p className="text-muted-foreground">
            Mohon isi data diri dengan benar dan lengkap sesuai dokumen resmi
            (KK/Akta).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasDraft && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
              <CloudOff className="h-3.5 w-3.5" />
              <span>Draft belum tersimpan ke server</span>
              <button
                type="button"
                onClick={discardDraft}
                className="underline hover:text-amber-800 ml-1"
              >
                Buang
              </button>
            </div>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan Data
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger
            value="personal"
            className={tabHasError.personal ? "text-destructive" : ""}
          >
            Data Pribadi {tabHasError.personal && "⚠"}
          </TabsTrigger>
          <TabsTrigger
            value="parents"
            className={tabHasError.parents ? "text-destructive" : ""}
          >
            Data Orang Tua {tabHasError.parents && "⚠"}
          </TabsTrigger>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register("student.gender")}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

                {/* Street */}
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

                {/* Cascading selects: Province → City → District → Village */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Provinsi */}
                  <div className="space-y-2">
                    <Label>Provinsi</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                      value={selectedProvinceId}
                      onFocus={() => fetchProvinces()}
                      onChange={(e) => {
                        const opt = e.target.options[e.target.selectedIndex];
                        setSelectedProvinceId(e.target.value);
                        setSelectedCityId("");
                        setSelectedDistrictId("");
                        form.setValue(
                          "student.address.province",
                          opt.text === "-- Pilih Provinsi --" ? "" : opt.text,
                        );
                        form.setValue("student.address.city", "");
                        form.setValue("student.address.district", "");
                        form.setValue("student.address.village", "");
                        if (e.target.value) fetchCities(e.target.value);
                      }}
                    >
                      <option value="">
                        {loadingProvinces
                          ? "Memuat..."
                          : "-- Pilih Provinsi --"}
                      </option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama}
                        </option>
                      ))}
                    </select>
                    {errors.student?.address?.province && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.province.message}
                      </p>
                    )}
                  </div>

                  {/* Kab/Kota */}
                  <div className="space-y-2">
                    <Label>Kota / Kabupaten</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                      value={selectedCityId}
                      disabled={!selectedProvinceId || loadingCities}
                      onChange={(e) => {
                        const opt = e.target.options[e.target.selectedIndex];
                        setSelectedCityId(e.target.value);
                        setSelectedDistrictId("");
                        form.setValue(
                          "student.address.city",
                          opt.text === "-- Pilih Kota/Kabupaten --"
                            ? ""
                            : opt.text,
                        );
                        form.setValue("student.address.district", "");
                        form.setValue("student.address.village", "");
                        if (e.target.value) fetchDistricts(e.target.value);
                      }}
                    >
                      <option value="">
                        {loadingCities
                          ? "Memuat..."
                          : "-- Pilih Kota/Kabupaten --"}
                      </option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama}
                        </option>
                      ))}
                    </select>
                    {errors.student?.address?.city && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.city.message}
                      </p>
                    )}
                  </div>

                  {/* Kecamatan */}
                  <div className="space-y-2">
                    <Label>Kecamatan</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                      value={selectedDistrictId}
                      disabled={!selectedCityId || loadingDistricts}
                      onChange={(e) => {
                        const opt = e.target.options[e.target.selectedIndex];
                        setSelectedDistrictId(e.target.value);
                        form.setValue(
                          "student.address.district",
                          opt.text === "-- Pilih Kecamatan --" ? "" : opt.text,
                        );
                        form.setValue("student.address.village", "");
                        if (e.target.value) fetchVillages(e.target.value);
                      }}
                    >
                      <option value="">
                        {loadingDistricts
                          ? "Memuat..."
                          : "-- Pilih Kecamatan --"}
                      </option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama}
                        </option>
                      ))}
                    </select>
                    {errors.student?.address?.district && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.district.message}
                      </p>
                    )}
                  </div>

                  {/* Kelurahan / Desa */}
                  <div className="space-y-2">
                    <Label>Kelurahan / Desa</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                      disabled={!selectedDistrictId || loadingVillages}
                      defaultValue=""
                      onChange={(e) => {
                        const opt = e.target.options[e.target.selectedIndex];
                        form.setValue(
                          "student.address.village",
                          opt.text === "-- Pilih Kelurahan --" ? "" : opt.text,
                        );
                      }}
                    >
                      <option value="">
                        {loadingVillages
                          ? "Memuat..."
                          : "-- Pilih Kelurahan --"}
                      </option>
                      {villages.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.nama}
                        </option>
                      ))}
                    </select>
                    {errors.student?.address?.village && (
                      <p className="text-destructive text-xs">
                        {errors.student.address.village.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* RT & RW — tetap manual */}
                <div className="grid grid-cols-2 gap-4 max-w-xs">
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
                </div>

                {/* Show saved values as info when no dropdown selected yet */}
                {!selectedProvinceId &&
                  form.getValues("student.address.province") && (
                    <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      Alamat tersimpan sebelumnya:{" "}
                      <strong>
                        {form.getValues("student.address.province")}
                      </strong>
                      ,{" "}
                      <strong>{form.getValues("student.address.city")}</strong>,{" "}
                      {form.getValues("student.address.district")},{" "}
                      {form.getValues("student.address.village")}. Pilih
                      provinsi di atas untuk mengubah.
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PARENTS DATA TAB --- */}
        <TabsContent value="parents">
          <div className="grid gap-6">
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
    </form>
  );
}
