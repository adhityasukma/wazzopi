# Wazzopi — Toko Online Kopi Nusantara
> **Wazzopi — Satu Teguk, Banyak Cerita**

Aplikasi web toko online berbasis **Next.js 16 (App Router)**, **Tailwind CSS**, **Prisma ORM**, dan **Lucide React**, siap dideploy ke **Vercel**.

---

## ☕ Fitur Utama

### 1. Front End (Tampilan Publik)
- **Beranda (Home Page)**: Hero slide slider dengan auto-play dan navigasi, highlight nilai brand, kategori kopi, katalog produk unggulan, cerita brand Wazzopi, panduan proses seduh, dan testimoni pelanggan.
- **Katalog Produk & Filter**: Pencarian produk, filter kategori, sorting berdasarkan harga / terbaru / alfabet, serta badge diskon dan indikator ketersediaan stok.
- **Halaman Detail Produk**: Galeri foto, pemilihan varian dinamis (misal: 250g Biji Utuh, 500g Bubuk), counter jumlah pesanan, dan penambahan instan ke keranjang belanja (Zustand persist).
- **Keranjang Belanja**: Kelola kuantitas produk, hapus item, dan ringkasan subtotal estimasi.
- **Checkout & Pengiriman**: Input alamat pengiriman lengkap, pemilihan kurir (JNE, J&T, SiCepat, Pickup Store), dan opsi pembayaran (Transfer Bank, COD, Midtrans).
- **Halaman Terima Kasih (Success)**: Nomor order unik, instruksi pembayaran transfer bank dengan nomor rekening resmi, dan tombol cetak invoice / cek status.
- **Member Area & Autentikasi**: Login, Registrasi otomatis Customer, kelola alamat pengiriman utama, ubah password, dan riwayat status pesanan.

### 2. Backend (Admin Panel di `/admin`)
- **Autentikasi & RBAC (Role-Based Access Control)**:
  - **Administrator**: Memiliki hak penuh atas semua fitur (Dashboard, Produk, Kategori, Orders, Customers, Laporan, Pengaturan).
  - **Karyawan**: Hak akses dibatasi hanya untuk melihat daftar dan **menambah produk baru**. Halaman lain otomatis diblokir ke `/admin/forbidden`.
- **Dashboard Ringkasan**: KPI total pendapatan, total order, customer, dan produk; grafik area pendapatan 30 hari terakhir (Recharts) serta diagram donat komposisi status pesanan.
- **Kelola Produk**: Tambah/edit produk dengan varian tanpa batas atau harga tunggal, penentuan stok, SKU, berat (gram), dan status draft/published.
- **Kelola Kategori**: CRUD kategori produk kopi dan alat seduh.
- **Kelola Pesanan (Orders)**: Pantau seluruh transaksi masuk, filter berdasarkan status (`PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`, `CANCELLED`), serta ubah status pesanan yang otomatis menyinkronkan stok.
- **Daftar Pelanggan (Customers)**: Data kontak, kota domisili, jumlah riwayat pesanan, dan akumulasi nilai belanja (LTV).
- **Laporan Penjualan (Reports)**: Komparasi 2 rentang tanggal (*Date Range A* vs *Date Range B*) lengkap dengan persentase pertumbuhan (*growth rate*), visualisasi bar chart perbandingan omzet, dan tombol **Export CSV**.
- **Pengaturan Lengkap (Settings)**:
  - **General**: Nama toko, tagline, kontak email & nomor telepon, alamat fisik, dan kota asal.
  - **Opsi Mata Uang (Currency)**: Pilihan IDR, USD, dsb, simbol, pemisah ribuan (titik/koma/spasi), pemisah desimal, jumlah angka desimal, posisi simbol (kiri/kanan/spasi), lengkap dengan **Live Preview**.
  - **Pembayaran**: Konfigurasi daftar nomor rekening Bank Transfer, biaya penanganan COD, dan kredensial API Midtrans (Sandbox & Production).
  - **Pengiriman**: Manajemen kurir ekspedisi aktif, ongkir, batas minimal belanja gratis ongkir, dan opsi ambil di toko (*pickup*).
  - **Lainnya & SEO**: Meta title, meta description, media sosial, persentase pajak (PPN), dan threshold stok menipis.

---

## 🔑 Akun Demo Bawaan

| Role | Email | Password | Akses |
|---|---|---|---|
| **Administrator** | `admin@wazzopi.com` | `admin123` | Semua fitur Admin Panel |
| **Karyawan** | `karyawan@wazzopi.com` | `karyawan123` | Hanya Menambah Produk |
| **Customer (Demo)** | `customer@wazzopi.com` | `customer123` | Toko Publik & Member Area |

---

## 🚀 Panduan Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori
cd d:\Project\wazzopi

# 2. Setup Environment Variables
cp .env.example .env

# 3. Sinkronkan database & jalankan seed (580+ sample transaksi)
npm run db:push
npm run db:seed

# 4. Jalankan server development
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000) untuk tampilan toko publik dan [http://localhost:3000/admin](http://localhost:3000/admin) untuk panel admin.

---

## 🌐 Panduan Deploy ke Vercel

1. **Siapkan Database PostgreSQL** (contoh: [Neon.tech](https://neon.tech) atau Vercel Postgres).
2. Di file `prisma/schema.prisma`, ubah provider datasource menjadi:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Push kode proyek ke GitHub/GitLab.
4. Import repositori di Dashboard **Vercel**.
5. Isi Environment Variables di Vercel:
   - `DATABASE_URL`: URL PostgreSQL dari Neon/Vercel Postgres
   - `AUTH_SECRET`: String acak aman (minimal 32 karakter)
6. Jalankan deploy. Database schema akan di-generate otomatis saat proses build.
