# Laporan Analisis Website Eksisting & Rencana Prototipe PkM
## Mitra: Perkumpulan Klenteng Boen Tek Bio Tangerang (Didirikan 1684)

Dokumen ini disusun sebagai landasan analisis teknis dan konsep purwarupa (*prototype*) website untuk pengajuan program **Pengabdian kepada Masyarakat (PkM)** mahasiswa Teknik Informatika, Universitas Pamulang.

---

### 1. Profil Singkat Mitra

- **Nama Institusi**: Perkumpulan Boen Tek Bio (Klenteng Boen Tek Bio / Vihara Padumuttara)
- **Status**: Cagar Budaya Nasional & Tempat Ibadah Bersejarah Tertua di Tangerang
- **Tahun Berdiri**: Sekitar 1684 (Berusia lebih dari 340 tahun)
- **Alamat**: Jl. Bhakti No. 14, Kawasan Pasar Lama, Kel. Sukasari, Kec. Tangerang, Kota Tangerang, Banten 15118
- **Domain Resmi Saat Ini**: `https://boentekbio.or.id/`
- **Bidang Pelayanan**:
  1. **Keagamaan & Kebudayaan**: Pelayanan ibadah Tridharma/Buddha, pemeliharaan altar dan Kimsin, tradisi Gotong Toapekong 12 Tahunan, dan Festival Peh Cun.
  2. **Sosial & Kemanusiaan**: Pengelolaan Rumah Duka Boen Tek Bio dan Tanah Makam (TPU Boen Tek Bio).
  3. **Pendidikan & Riset**: Bantuan pendidikan/sekolah dan Pusat Kajian Tionghoa Benteng (PKTB).

---

### 2. Hasil Audit Kritis Website Eksisting (`https://boentekbio.or.id`)

Berdasarkan penarikan data dan analisis teknis pada website resmi saat ini, ditemukan sejumlah kelemahan substansial yang menjadi dasar kuat (*problem statement*) proposal PkM:

#### A. Kelemahan Teknis & Bug Fatal
1. **Broken Images pada Artikel Sejarah & Epigrafi**:
   - Ditemukan puluhan gambar di artikel resmi (`profil.html`, `epigrafi.html`, `artikel_klenteng.html`, `tanah_makam.html`) yang **rusak / tidak muncul** di browser publik.
   - **Penyebab**: Pengembang sebelumnya secara keliru membiarkan URL lokal `http://127.0.0.1:8000/uploads/summernote/...` tersimpan di database konten langsung.
2. **Duplikasi Header & Struktur DOM Tidak Bersih**:
   - Terdapat dua elemen `<header>` bertumpuk di dalam HTML (`header-two` untuk desktop dan `fixed-header` untuk mobile) yang memicu pergeseran tata letak dan inefisiensi beban rendering.
3. **Beban Dependensi Usang (Script Bloat)**:
   - Website memuat 12+ pustaka eksternal lawas (Bootstrap 3/4, jQuery 1.12.4, jQuery UI, Slick Carousel, Colorbox, SimpleLightbox, Animate.css, dan panggilan Google Maps API yang kuncinya sudah kadaluarsa).
4. **Tipografi & Aksesibilitas Rendah**:
   - `font-size: 12px` pada tag `<body>` dengan teks rata kiri-kanan (*justify*) kaku membuat keterbacaan sangat buruk, terutama bagi umat lansia yang mengakses via smartphone.

#### B. Kelemahan Desain & Informasi Budaya
1. **Beranda Tidak Mencerminkan Nilai Sejarah**:
   - Halaman utama hanya menampilkan slide gambar berukuran raksasa tanpa deskripsi/narasi, diikuti beberapa kartu berita lama (postingan terakhir Juni 2024 dan 2021).
   - Pengunjung yang baru pertama kali membuka web tidak mendapatkan informasi ringkas tentang sejarah 340 tahun Klenteng Boen Tek Bio.
2. **Tidak Ada Panduan Altar Digital**:
   - Klenteng Boen Tek Bio memiliki belasan altar Dewa-Dewi (Kimsin) utama (seperti YMS Kwan Im Hud Couw, Hok Tek Ceng Sin, Kwan Seng Te Kun, Sam Po Tay Jin), namun tidak ada panduan visual urutan bersembahyang bagi umat maupun panduan cagar budaya bagi wisatawan.
3. **Tidak Ada Kalender Upacara / Hari Besar Keagamaan**:
   - Umat tidak dapat melihat jadwal hari besar lunar (Imlek, Cap Go Meh, Peh Cun, Waisak, Lak Gwee Cap Kauw, Qingming) secara terintegrasi.
4. **Pelayanan Sosial Belum Digital**:
   - Informasi Rumah Duka dan Tanah Makam hanya berupa teks statis tanpa panduan alur pengurusan, rincian fasilitas, ataupun kontak darurat 24 jam yang mudah dihubungi via WhatsApp.

---

### 3. Rencana Pengembangan Prototipe PkM

Untuk memikat pengurus Yayasan Boen Tek Bio saat audiensi proposal, tim mahasiswa akan menyajikan prototipe modern dengan keunggulan berikut:

1. **Aset Visual & Cagar Budaya Berkelas (*Heritage Aesthetic*)**:
   - Palet warna tradisional: *Imperial Vermilion Red* (`#8B0000`), *Golden Lantern* (`#D4AF37`), *Jade Accent* (`#2D6A4F`), dan *Off-White Paper* (`#FAF8F5`).
   - Tipografi elegan nan mudah dibaca untuk semua usia.
2. **Fitur Unggulan Prototipe**:
   - **Beranda Interaktif**: Menampilkan *timeline* sejarah 1684 - 2026, status cagar budaya, dan video/galeri arsitektur otentik.
   - **Denah & Panduan Virtual Altar Klenteng (*Interactive Altar Guide*)**: Informasi detail setiap altar, filosofi dewa/dewi, dan tata cara ziarah budaya yang santun.
   - **Kalender Upacara & Ritual Tradisi**: Kalender interaktif penanggalan Masehi & Imlek beserta hitung mundur hari besar.
   - **Portal Pelayanan Umat Cepat Tanggap**: Informasi Rumah Duka, Krematorium, dan Tanah Makam dengan tombol kontak darurat langsung.
   - **Pusat Kajian Tionghoa Benteng (PKTB)**: Showcase arsip epigrafi batu kuno (abad ke-17 & 18) dan sejarah arak-arakan Gotong Toapekong 12 Tahunan yang sudah dipulihkan dari gambar rusak.
   - **100% Responsif & Ringan**: Dibangun dengan standar web modern (Vanilla HTML5/CSS/JS tanpa jQuery berat), kecepatan loading tinggi, dan ramah smartphone.

---

### 4. Struktur Folder Proyek

```text
website-boentekbio/
├── eksisting/                 <-- Arsip salinan lengkap web asli boentekbio.or.id
│   ├── index.html            <-- Beranda asli
│   ├── profil.html           <-- Profil asli
│   ├── sejarah.html          <-- Sejarah Toapekong asli
│   ├── agama_buddha.html     <-- Halaman keagamaan asli
│   ├── bidang_pendidikan.html<-- Pendidikan asli
│   ├── rumah_duka.html       <-- Rumah duka asli
│   ├── tanah_makam.html      <-- Tanah makam asli
│   ├── artikel_klenteng.html <-- Artikel klenteng asli
│   ├── epigrafi.html         <-- Epigrafi asli
│   ├── css/                  <-- Stylesheet asli
│   └── images/               <-- 34 file gambar resmi yang berhasil diselamatkan
│
├── ANALISIS_DAN_RENCANA_PROTOTIPE_PKM.md <-- Dokumen ini
└── (Tahap Selanjutnya: Folder prototipe modern untuk presentasi PkM)
```
