# beautyrossa.id

Website toko online skincare & makeup — tema elegan gold & hitam.

## Cara Menjalankan di Komputer Sendiri (opsional)

```bash
npm install
npm run dev
```

Lalu buka `http://localhost:5173` di browser.

## Cara Deploy ke Vercel (Gratis)

1. Buat akun di https://github.com (jika belum punya), lalu buat repository baru
   (misal `beautyrossa-id`) dan upload seluruh isi folder ini ke repository tersebut.
2. Buat akun di https://vercel.com menggunakan akun GitHub.
3. Klik **Add New → Project**, lalu pilih repository `beautyrossa-id` tadi.
4. Vercel akan otomatis mendeteksi ini sebagai project Vite. Klik **Deploy**.
5. Setelah selesai (biasanya < 1 menit), kamu akan mendapat link seperti
   `beautyrossa-id.vercel.app` — website sudah aktif.

## Menghubungkan Domain beautyrossa.id

1. Di dashboard project Vercel, buka **Settings → Domains**.
2. Ketik `beautyrossa.id`, klik **Add**.
3. Vercel akan menampilkan 1-2 DNS record yang perlu ditambahkan
   (biasanya record tipe **A** mengarah ke sebuah IP, dan/atau **CNAME** untuk `www`).
4. Login ke panel member IDCloudHost (member.idcloudhost.com) tempat domain
   `beautyrossa.id` terdaftar → cari menu **DNS Management** untuk domain ini.
5. Tambahkan record sesuai instruksi dari Vercel tadi, lalu simpan.
6. Tunggu propagasi DNS (biasanya beberapa menit, kadang sampai 24 jam).
   Setelah aktif, `beautyrossa.id` akan langsung menampilkan website ini.

## Struktur Project

- `src/App.jsx` — seluruh halaman & logika toko (produk, keranjang, checkout)
- `src/index.css` — warna, font, dan gaya visual (gold & hitam)
- `index.html` — halaman utama

## Cara Edit Sendiri

- **Ubah produk / harga**: buka `src/App.jsx`, cari bagian `const PRODUCTS = [...]`
- **Ubah warna**: cari kode warna seperti `#C6A15B` (emas) atau `#0B0908` (hitam)
  di `src/App.jsx` dan `src/index.css`
- **Ubah teks hero/judul**: cari bagian `<h1>` di `src/App.jsx`

Setelah edit, cukup push perubahan ke GitHub — Vercel akan otomatis
mem-build ulang dan mempublikasikan versi terbaru.
