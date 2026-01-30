"use client";

import { ChangeEvent, useRef, useState, useEffect } from "react";
import { UploadCloud, X, FileText, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  label: string;
  value?: string; // URL of the uploaded file
  onChange: (file: File | null) => void;
  onRemove: () => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  error?: string;
}

export function FileUpload({
  label,
  value,
  onChange,
  onRemove,
  disabled = false,
  accept = "image/*,application/pdf",
  maxSizeMB = 2,
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Sync preview with value prop
  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran file maksimal ${maxSizeMB}MB`);
      return;
    }

    setFileName(file.name);

    // Create local preview if image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  };

  const isPDF =
    value?.toLowerCase().endsWith(".pdf") ||
    fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </div>

      {!value && !preview ? (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-muted/50",
            disabled && "cursor-not-allowed opacity-50",
            error && "border-destructive/50 bg-destructive/5",
          )}
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Klik untuk upload atau drag & drop
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            (Max {maxSizeMB}MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm w-full p-4 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
            {isPDF ? (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={preview || value || ""}
                alt="Preview"
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {fileName || "File Terupload"}
            </p>
            <div className="flex gap-2 mt-1">
              {value && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline hover:text-primary/80"
                >
                  Lihat File
                </a>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Hapus file</span>
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
