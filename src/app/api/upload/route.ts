import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireStaff } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Validasi session role (Admin & Karyawan diizinkan)
    await requireStaff();

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file harus berupa gambar (JPG, PNG, atau WEBP)" },
        { status: 400 }
      );
    }

    // Maksimal 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran gambar maksimal 5MB" }, { status: 400 });
    }

    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    const uniqueFileName = `${cleanName}-${Date.now()}${ext}`;

    // 1. PRIORITAS: JIKA DI VERCEL & MEMILIKI BLOB READ WRITE TOKEN
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`wazzopi/${uniqueFileName}`, file, {
        access: "public",
      });
      return NextResponse.json({ url: blob.url, success: true });
    }

    // 2. FALLBACK: SIMPAN KE LOCAL STORAGE (JIKA DI LOCALHOST / TANPA TOKEN)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({ url: publicUrl, success: true });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengupload gambar" },
      { status: 500 }
    );
  }
}
