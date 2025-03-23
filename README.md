# Sistem Manajemen Perumahan - Frontend

Repositori ini berisi aplikasi frontend untuk Sistem Manajemen Perumahan, yang dibangun menggunakan React, Vite, dan Material UI. Frontend menyediakan antarmuka pengguna untuk mengelola data penghuni, rumah, pembayaran, dan pengeluaran.

## Teknologi yang Digunakan

- Node.js v22.14.0
- React 19
- Vite 6
- Material UI 6
- Axios
- React Router DOM 7
- Chart.js dan React-Chartjs-2
- React-Toastify

## Persyaratan Sistem

- Node.js v22.14.0 atau lebih tinggi
- NPM
- Backend API yang berjalan

## Komponen Utama

1. **Dashboard** - Menampilkan ringkasan data perumahan dan keuangan
2. **Manajemen Penghuni** - Mengelola data penghuni dengan fitur CRUD
3. **Manajemen Rumah** - Mengelola data rumah dan penghuni rumah
4. **Manajemen Pembayaran** - Mencatat dan melacak pembayaran iuran bulanan
5. **Manajemen Pengeluaran** - Mencatat dan melacak pengeluaran perumahan
6. **Laporan** - Menampilkan laporan keuangan dalam bentuk grafik dan tabel

## Struktur Proyek

```
src/
├── api/
│   └── api.js              # Service API untuk komunikasi dengan backend
├── assets/                 # Static assets
├── components/
│   ├── common/
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   ├── FormFields.jsx
│   │   ├── Loading.jsx
│   │   ├── PageHeader.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Layout.jsx
│   │   └── Navbar.jsx
│   └── pages/
│       ├── expenses/
│       │   ├── ExpenseForm.jsx
│       │   └── ExpenseList.jsx
│       ├── houses/
│       │   ├── HouseDetail.jsx
│       │   ├── HouseForm.jsx
│       │   └── HouseList.jsx
│       ├── payments/
│       │   ├── PaymentForm.jsx
│       │   └── PaymentList.jsx
│       ├── reports/
│       │   ├── MonthlyDetail.jsx
│       │   └── PaymentSummary.jsx
│       └── residents/
│           ├── ResidentForm.jsx
│           └── ResidentList.jsx
├── App.css
├── App.jsx                 # Main App component
├── main.jsx                # Entry point
└── theme.js                # Material UI theme configuration
```

## Cara Instalasi

1. Clone repositori
```bash
git clone https://github.com/arifafandi/rt-management-system-frontend.git
cd rt-management-system-frontend
```

2. Install dependensi
```bash
npm install
```

3. Jalankan aplikasi dalam mode development
```bash
npm run dev
```

Aplikasi akan berjalan di http://localhost:5173

> **Catatan**: Pastikan backend sudah berjalan di http://localhost:8000 sebelum menjalankan frontend, karena API URL sudah dikonfigurasi di file `api.js`.

## Routes dan Navigasi

Aplikasi ini menggunakan React Router v7 untuk navigasi dengan routes utama:

- `/` - Dashboard
- `/residents` - Daftar penghuni
- `/residents/create` - Tambah penghuni baru
- `/residents/edit/:id` - Edit penghuni
- `/houses` - Daftar rumah
- `/houses/:id` - Detail rumah
- `/houses/create` - Tambah rumah
- `/houses/edit/:id` - Edit rumah
- `/payments` - Daftar pembayaran
- `/payments/create` - Tambah pembayaran baru
- `/payments/edit/:id` - Edit pembayaran
- `/expenses` - Daftar pengeluaran
- `/expenses/create` - Tambah pengeluaran baru
- `/expenses/edit/:id` - Edit pengeluaran
- `/reports/payment-summary` - Laporan keuangan ringkasan
- `/reports/monthly-detail` - Laporan keuangan bulanan

## Visualisasi Data

Aplikasi menggunakan Chart.js dan React-Chartjs-2 untuk visualisasi data, seperti:
- Grafik pemasukan dan pengeluaran bulanan
- Diagram lingkaran untuk distribusi jenis pengeluaran
- Statistik dashboard dalam bentuk visual

## Notifikasi

React-Toastify digunakan untuk menampilkan notifikasi kepada pengguna, seperti:
- Konfirmasi berhasil menambah/mengedit/menghapus data
- Pesan error saat terjadi kesalahan
- Peringatan validasi


## Terkait

Lihat juga repositori backend untuk aplikasi ini:
- [Backend Laravel](https://github.com/arifafandi/rt-management-system-backend)

Untuk informasi lebih lanjut tentang proyek secara keseluruhan:
- [Repositori Utama](https://github.com/arifafandi/rt-management-system)