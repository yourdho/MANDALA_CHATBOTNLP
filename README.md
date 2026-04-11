# mandala_arena - Modern Futsal & Venue Booking Platform

mandala_arena adalah platform booking lapangan olahraga (Futsal, Mini Soccer) dan antrian digital (Barbershop) yang dibangun dengan stack modern menggunakan **Laravel 11** dan **Inertia.js (React)**.

Fitur utama meliputi:
- **Sistem Role**: Admin, Mitra (Pemilik Venue), dan User.
- **Booking Real-time**: Mencegah bentrok jadwal.
- **Sistem Antrian Digital**.
- **Fitur AI / Analytics**: Rekomendasi waktu sepi dan venue populer.
- **Stunning UI**: Dark theme modern menggunakan Tailwind CSS dan Framer Motion.

## 🚀 Tech Stack

- **Backend**: Laravel 11, PHP 8.2+, SQLite / MySQL
- **Frontend**: React 18, Inertia.js, Tailwind CSS, Headless UI, Framer Motion
- **Architecture**: Clean Architecture (Controller, Service, Repository)

---

## 🛠 Panduan Instalasi (Development)

Pastikan sistem Anda telah menginstal **PHP 8.2+**, **Composer**, **Node.js**, dan **NPM**.

### 1. Clone Repository & Install Dependencies
\`\`\`bash
# Backend dependencies
composer install

# Frontend dependencies
npm install
\`\`\`

### 2. Setup Database & Environment
Salin file environment:
\`\`\`bash
cp .env.example .env
\`\`\`
Sesuaikan konfigurasi database Anda di `.env`. Secara default di sistem pengembangan ini menggunakan **SQLite**, namun Anda bisa mengubah `DB_CONNECTION=mysql` dan mengisi kredensial database MySQL Anda.

### 3. Generate App Key & Jalankan Migrasi
\`\`\`bash
php artisan key:generate
php artisan migrate
\`\`\`
*(Jika Anda memiliki file seeder, jalankan `php artisan db:seed`)*

### 4. Menjalankan Aplikasi

Anda membutuhkan dua terminal yang berjalan bersamaan:

**Terminal 1 (Backend - PHP Server):**
\`\`\`bash
php artisan serve
\`\`\`

**Terminal 2 (Frontend - Vite Server):**
\`\`\`bash
npm run dev
\`\`\`

Akses aplikasi di `http://localhost:8000`.

---

## ⚙️ Background Services (Queue & Scheduler)

Untuk mengaktifkan fitur notifikasi asynchronous dan penjadwalan analitik, jalankan perintah berikut di tab terminal terpisah:

**1. Menjalankan Laravel Queue Worker**
Digunakan untuk memproses email, notifikasi, atau tugas berat lainnya:
\`\`\`bash
php artisan queue:work
\`\`\`

**2. Menjalankan Laravel Scheduler**
Khusus untuk men-trigger *Smart Features* seperti kalkulasi jam ramai harian:
\`\`\`bash
php artisan schedule:work
\`\`\`

*(Untuk server production, konfigurasikan cron job untuk menjalankan `php artisan schedule:run` setiap menit.)*

---

## 📂 Struktur Direktori Utama

- `app/Http/Controllers/Api/`: Controller untuk melayani request API/Web.
- `app/Services/`: Berisi logika/aturan bisnis aplikasi.
- `app/Repositories/`: Menangani komunikasi langsung dengan Model/Database.
- `resources/js/Pages/`: Komponen halaman utama React (Welcome, Dashboard, dll).
- `routes/api.php`: Definisi endpoint API.
- `routes/web.php`: Definisi rute halaman Inertia.

---

## 🌐 Panduan Deployment Server (Production)

Saat mengunggah (hosting) aplikasi ini ke server VPS atau CPanel, ada beberapa konfigurasi dan *best practice* yang diwajibkan demi performa dan keamanan sistem:

### 1. Environment & Database Server
Edit file `.env` di server Anda dengan konfigurasi berikut:
```env
APP_ENV=production
APP_DEBUG=false
```
**Database Production:** Di environment lokal (development) kita bisa menggunakan `sqlite`. Namun, untuk hosting wajib menggunakan **MySQL** atau **PostgreSQL** untuk menangani concurrency data (terhadap kemungkinan konflik tabel saat pengguna menekan tombol *booking* secara bersamaan).
```env
DB_CONNECTION=mysql
# Sesuaikan parameter di bawah ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mandala_arena
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 2. Queue Worker (Supervisor)
Aplikasi ini menjalankan banyak proses di latar belakang (*background processes*) seperti:
- Pengiriman Email Invoice.
- Pengiriman Notifikasi WhatsApp (via API).
- Proses pembersihan otomatis untuk "pending" tiket (expired payment).

Agar pekerjaan (*job*) ini tidak menghambat *response time* ke pengguna, fitur-fitur di atas didorong ke Queue. Di server development Anda cukup mengetik `php artisan queue:work`. Namun di **server production**, Anda wajib menggunakan Process Monitor seperti **Supervisor** atau PM2 agar *worker* tetap hidup meski server ter-restart.

### 3. Server Scheduler (Cron Job)
Tambahkan konfigurasi *Cron* berikut pada setting (Cron Jobs) di kontrol panel CPanel/VPS Anda:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```
Cron job ini memastikan seluruh *smart analytics*, update poin diskon member, dan pembatalan timeout otomatis sistem dieksekusi secara periodik per menit.

---
*Dibuat dengan ❤️ oleh Nadhif M Yusuf untuk pengalaman olahraga yang lebih baik.*
