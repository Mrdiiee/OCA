# Oxygen Gear Equipment — Website

Proyek website ini dibuat dengan Next.js dan siap di-deploy ke Vercel (gratis).

## Cara mengunggah ke GitHub

1. Buat akun di https://github.com jika belum punya.
2. Klik tombol hijau "New" untuk membuat repository baru, beri nama misalnya `oxygen-gear-website`, lalu klik "Create repository".
3. Di halaman repository yang baru dibuat, klik "uploading an existing file".
4. Seret (drag & drop) semua file dan folder di dalam folder proyek ini ke halaman tersebut.
5. Klik "Commit changes" di bagian bawah untuk menyimpannya.

## Cara deploy ke Vercel

1. Buat akun di https://vercel.com (bisa daftar pakai akun GitHub kamu langsung, lebih cepat).
2. Klik "Add New" → "Project".
3. Pilih repository `oxygen-gear-website` yang tadi diunggah, lalu klik "Deploy".
4. Tunggu beberapa menit — Vercel akan memberi kamu alamat sementara seperti `oxygen-gear-website.vercel.app`.

## Cara menyambungkan domain sendiri

1. Di dashboard Vercel, buka project ini → tab "Settings" → "Domains".
2. Masukkan nama domain yang sudah kamu punya, lalu klik "Add".
3. Vercel akan menampilkan 1–2 baris data DNS (biasanya tipe `A` dan/atau `CNAME`).
4. Login ke akun penyedia domain kamu (Niagahoster, Rumahweb, dll), cari menu "DNS Management" / "Kelola DNS".
5. Tambahkan data DNS sesuai yang diberikan Vercel, lalu simpan.
6. Tunggu beberapa menit hingga maksimal 24 jam sampai domain aktif.

## Menjalankan di komputer sendiri (opsional)

Jika ingin melihat website ini di komputer sebelum diunggah:

```bash
npm install
npm run dev
```

Lalu buka http://localhost:3000 di browser.

## Catatan

- Harga dan deskripsi produk di dalam `app/page.jsx` masih contoh awal — silakan ganti sesuai data asli.
- Form checkout masih mode uji coba (belum terhubung pembayaran asli). Ini akan disambungkan pada tahap berikutnya bersama Claude.
