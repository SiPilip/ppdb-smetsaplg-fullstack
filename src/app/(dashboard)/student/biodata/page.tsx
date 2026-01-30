"use client";

import { StudentBiodataForm } from "@/components/dashboard/student-biodata-form";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function StudentBiodataPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studentProfile"],
    queryFn: async () => {
      const response = await api.get("/student/profile");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-destructive">
        Gagal memuat data. Silahkan coba lagi.
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <StudentBiodataForm initialData={data} />
    </div>
  );
}
