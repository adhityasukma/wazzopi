"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useAppLoading } from "@/components/loading-provider";
import { useI18n } from "@/i18n/provider";

type ImageUploadProps = {
  name: string;
  defaultValue?: string | null;
  label?: string;
  hint?: string;
};

export function ImageUpload({
  name,
  defaultValue = "",
  label,
  hint,
}: ImageUploadProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const defaultLabel = isEn ? "Photo / Image" : "Foto / Gambar";
  const displayLabel = label || defaultLabel;

  const [preview, setPreview] = useState<string>(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showLoading, hideLoading } = useAppLoading();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    showLoading(isEn ? "Uploading image..." : "Sedang mengunggah gambar...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Failed to upload image" : "Gagal mengupload gambar"));
      }

      setPreview(data.url);
    } catch (err: any) {
      setError(err.message || (isEn ? "Upload failed" : "Terjadi kesalahan upload"));
    } finally {
      setUploading(false);
      hideLoading();
    }
  }

  function handleClear() {
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-espresso-700">{displayLabel}</label>
        {preview && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-rose-600 hover:underline inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" /> {isEn ? "Remove Photo" : "Hapus Foto"}
          </button>
        )}
      </div>

      {/* Hidden input yang akan disubmit ke Server Action */}
      <input type="hidden" name={name} value={preview} />

      <div className="flex items-center gap-4">
        {/* Preview Container */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-latte bg-cream/50 flex items-center justify-center">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-espresso-300" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-espresso-900/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-cream" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              id={`file-input-${name}`}
            />
            <label
              htmlFor={`file-input-${name}`}
              className="inline-flex items-center gap-2 rounded-lg border border-espresso-200 bg-white px-3 py-2 text-xs font-semibold text-espresso-800 shadow-xs hover:bg-latte cursor-pointer transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading
                ? (isEn ? "Uploading..." : "Mengupload...")
                : (isEn ? "Choose Image File" : "Pilih File Gambar")}
            </label>
          </div>

          <p className="text-[11px] text-espresso-400">
            {hint || (isEn
              ? "JPG, PNG, or WEBP format. Max 5MB. Automatically saved to server."
              : "Format JPG, PNG, atau WEBP. Maks. 5MB. Otomatis disimpan ke server.")}
          </p>

          {/* Atau input URL langsung */}
          <div className="pt-1">
            <input
              type="text"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder={isEn ? "Or paste image URL here..." : "Atau tempel URL gambar di sini..."}
              className="w-full rounded-md border border-espresso-100 bg-white px-2.5 py-1 text-xs text-espresso-700 placeholder:text-espresso-300 focus:outline-none focus:ring-1 focus:ring-caramel-500"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
