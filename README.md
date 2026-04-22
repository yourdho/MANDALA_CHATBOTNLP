# Mandala Arena — Sports Venue Booking Platform

**Mandala Arena** adalah platform booking lapangan olahraga berbasis web yang dibangun dengan **Laravel 11**, **Inertia.js (React)**, dan NLP Chatbot berbahasa Indonesia. Platform ini memungkinkan pemesanan lapangan secara online, manajemen pembayaran via Midtrans, serta interaksi melalui chatbot AI yang bisa memahami percakapan natural.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🏟️ Booking Lapangan | Mini Soccer, Padel, Basket, Pilates dengan cek ketersediaan real-time |
| 🤖 NLP Chatbot | Chatbot berbahasa Indonesia dengan intent classification, entity extraction, dan state machine percakapan |
| 💳 Pembayaran Online | Terintegrasi Midtrans (QRIS, Virtual Account, dll) dengan webhook callback & conflict detection |
| 🔒 Auth & Role | User / Admin dengan Breeze + Sanctum |
| 🏆 Loyalty & Reward | Sistem poin dan voucher diskon |
| ⚔️ Matchmaking | Fitur cari lawan tanding sesama pengguna |
| 📊 Laporan Admin | Analytics revenue, occupancy rate, trending pemain |
| 📝 Blog | Artikel & kategori yang bisa dikelola admin |
| 📡 Real-time | Laravel Reverb (WebSocket) untuk notifikasi booking langsung |

---

## 🚀 Tech Stack

### Backend
| Komponen | Teknologi |
|---|---|
| Framework | Laravel 11, PHP 8.2+ |
| Database | MySQL 8 (development & production) |
| Auth | Laravel Breeze + Sanctum |
| Real-time | Laravel Reverb (WebSocket) |
| Payment Gateway | Midtrans PHP SDK |
| NLP | Custom pipeline — Sastrawi stemmer, TF-weighted intent classifier |
| Queue | Laravel Queue (database driver) |

### Frontend
| Komponen | Teknologi |
|---|---|
| Framework | React 18 + Inertia.js |
| Styling | Tailwind CSS v3 |
| UI Components | Headless UI, Heroicons, Framer Motion |
| Form | React Hook Form + Zod |
| State | Zustand |
| Real-time | Laravel Echo + Pusher-js |
| Export | xlsx (Excel reporting) |

---

## 📂 Struktur Direktori

```
mandala-arena/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Web/                  # Controller halaman (Inertia)
│   │       │   ├── BookingController.php
│   │       │   ├── ChatbotController.php
│   │       │   ├── FacilityController.php
│   │       │   └── ...
│   │       └── Admin/               # Controller area admin
│   ├── Models/                      # Eloquent Models
│   │   ├── Booking.php
│   │   ├── Facility.php
│   │   ├── User.php
│   │   ├── Reward.php / UserReward.php
│   │   ├── SportsMatch.php
│   │   ├── BlogPost.php / BlogCategory.php
│   │   └── ...
│   ├── Services/
│   │   ├── BookingService.php        # Core booking logic + race condition prevention
│   │   ├── ChatbotService.php        # Orchestrator chatbot + context-switching
│   │   ├── MidtransService.php       # Snap token generation + refund
│   │   ├── NotificationService.php   # WhatsApp & email notification
│   │   ├── RewardService.php         # Poin & voucher
│   │   ├── WhatsAppService.php       # WA API integration
│   │   ├── Chatbot/                  # State machine chatbot
│   │   │   ├── BookingFlowManager.php
│   │   │   ├── PaymentFlowManager.php
│   │   │   └── ChatbotLogger.php
│   │   └── Nlp/                      # NLP Pipeline
│   │       ├── NlpPipeline.php        # Entry point pipeline
│   │       ├── TextNormalizer.php     # Slang normalization, cleaning
│   │       ├── Tokenizer.php          # Tokenizer + Sastrawi stemmer
│   │       ├── IntentClassifier.php   # Multi-layer TF-weighted classifier
│   │       ├── EntityExtractor.php    # Slot/entity extraction (tanggal, waktu, fasilitas)
│   │       └── ResponseGenerator.php  # Dynamic NLG template engine
│   ├── Events/                        # Broadcast events (BookingCreated, BookingUpdated, ChatbotMessageReceived)
│   ├── Contracts/Services/            # Interface definitions
│   └── Providers/
│       └── AppServiceProvider.php     # DI bindings
├── config/
│   ├── chatbot_nlp.php                # Konfigurasi NLP (intent phrases, thresholds, entity kamus)
│   └── midtrans.php                   # Konfigurasi payment gateway
├── database/
│   ├── migrations/                    # Schema migrations
│   ├── seeders/                       # Seed data fasilitas, harga, reward
│   └── factories/                     # Model factories untuk testing
├── resources/js/
│   ├── Pages/                         # Halaman Inertia (React)
│   │   ├── Welcome.jsx                # Landing page
│   │   ├── Dashboard.jsx              # Dashboard user & admin
│   │   ├── Bookings/                  # Booking flow pages
│   │   ├── Facilities/                # Halaman fasilitas
│   │   ├── Admin/                     # Panel admin (Bookings, Reports, Pricing, Blog)
│   │   ├── Matches/                   # Matchmaking
│   │   └── Rewards/                   # Reward marketplace
│   └── Components/
│       ├── Chatbot/                   # Chatbot UI
│       │   ├── Chatbot.jsx            # Root component (auth guard + Echo listener)
│       │   ├── ChatHeader.jsx
│       │   ├── MessageList.jsx
│       │   ├── ChatInput.jsx
│       │   └── Cards/                 # Card UI untuk booking summary, payment, dll
│       ├── Layouts/                   # Layout utama (AuthenticatedLayout, GuestLayout)
│       ├── Shared/                    # Komponen bersama (Navbar, Footer)
│       └── UI/                        # Komponen UI atom (Button, Modal, dll)
├── routes/
│   ├── web.php                        # Rute halaman (guest + auth + admin)
│   ├── api.php                        # Rute API (Sanctum)
│   └── channels.php                   # WebSocket channel authorization
└── tests/
    ├── Unit/                          # NLP unit tests (IntentClassifier, EntityExtractor)
    └── Feature/                       # Integration tests (booking flow, webhook)
```

---

## ⚙️ Instalasi (Development)

**Prasyarat:** PHP 8.2+, Composer, Node.js 18+, NPM, SQLite (atau MySQL)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/yourdho/mandala-arena.git
cd mandala-arena

composer install
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` dan sesuaikan:

```env
# Database (SQLite untuk dev, MySQL untuk production)
DB_CONNECTION=sqlite

# Midtrans (sandbox untuk testing)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false

# Laravel Reverb (WebSocket)
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
```

### 3. Setup Database

```bash
php artisan migrate
php artisan db:seed        # Seed fasilitas, harga, dan data awal
```

### 4. Jalankan Aplikasi

Butuh **3 terminal** yang berjalan bersamaan:

```bash
# Terminal 1 — Backend server
php artisan serve

# Terminal 2 — WebSocket (Reverb)
php artisan reverb:start

# Terminal 3 — Vite (HMR frontend)
npm run dev
```

Akses di: `http://127.0.0.1:8000`

> **Tips:** Setelah `npm run build`, Terminal 3 tidak diperlukan.

### 5. Akun Default

Setelah seeder selesai, login dengan:
- **Admin:** cek output seeder atau buat manual via `php artisan tinker`
- **User:** Register melalui halaman `/register`

---

## 🛡️ Keamanan

Ringkasan implementasi keamanan yang sudah diterapkan:

| Area | Implementasi |
|---|---|
| **CSRF** | Exception CSRF hanya untuk `/payment/callback` (webhook server-to-server) |
| **IDOR Booking** | URL halaman sukses pakai UUID `booking_token` bukan integer ID |
| **IDOR Payment** | `PaymentController` dilindungi ownership check via `BookingPolicy::pay()` |
| **Webhook** | Signature `hash_equals()` + strict regex order_id + idempotency guard |
| **Broadcast** | `PrivateChannel` + authorization di `channels.php` — tidak ada public channel |
| **Upload** | `FileUploadService` — UUID filename, `Storage::disk('public')`, tanpa `mkdir` manual |
| **Authorization** | `BookingPolicy` + `MatchPolicy` menggantikan manual `abort(403)` |
| **Chatbot Privacy** | PII redaction (email, telp, kartu) sebelum log disimpan. Retensi 90 hari via scheduler |
| **Debug Mode** | `!debug` command hanya untuk role admin |
| **Race Condition** | `isSlotTakenForWrite()` dengan `lockForUpdate()` hanya dalam `DB::transaction()` |

---


Chatbot memproses pesan user melalui pipeline bertahap:

```
User Input
    ↓
TextNormalizer     → Normalisasi slang, case folding, strip karakter aneh
    ↓
Tokenizer          → Tokenisasi + Sastrawi morphological stemming
    ↓
IntentClassifier   → Multi-layer scoring (TF-weighted + Jaccard + entity boost)
    ↓
EntityExtractor    → Slot extraction: fasilitas, tanggal, jam, durasi, add-ons
    ↓
ChatbotService     → State-first routing + Context-switching
    ↓
BookingFlowManager / PaymentFlowManager   → State machine per domain
    ↓
ResponseGenerator  → Dynamic NLG template (randomized, kontekstual)
    ↓
Response JSON → Frontend (Inertia / Echo real-time)
```

**State machine booking:**
```
IDLE → COLLECTING_FACILITY → COLLECTING_DATE → COLLECTING_TIME → COLLECTING_DURATION
     → CHECKING_AVAILABILITY → SLOT_OFFERED → WAITING_ADDONS_CONFIRMATION
     → BOOKING_SUMMARY → WAITING_PAYMENT_METHOD → PAYMENT_PENDING → BOOKING_CONFIRMED
```

**Context-switching:** Jika user bertanya harga/lokasi di tengah booking, bot menjawab pertanyaan tersebut tanpa kehilangan state booking, lalu mengingatkan user untuk melanjutkan.

Konfigurasi NLP (intent phrases, thresholds, entity kamus) ada di: `config/chatbot_nlp.php`

---

## 💳 Payment Flow

```
Pilih metode bayar
    ↓
BookingService::createBooking()   → Buat booking pending + race condition lock
    ↓
MidtransService::getSnapToken()   → Generate Snap token (Midtrans API)
    ↓
Frontend tampilkan Snap popup
    ↓
User bayar → Midtrans kirim webhook ke POST /payment/callback
    ↓
BookingController::callback()     → Validasi signature + lockForUpdate
    ↓                               + conflict detection + auto-refund jika clash
booking.status = confirmed
booking.payment_status = paid
```

> **Webhook production:** Daftarkan URL `https://domain.anda/payment/callback` di dashboard Midtrans → Settings → Payment → Notification URL.

---

## 🚀 Deployment (Production)

### Environment

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain.anda

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=mandala_arena
DB_USERNAME=db_user
DB_PASSWORD=db_password

MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=Mid-server-xxxxx
```

### Build Frontend

```bash
npm run build
```

### Optimize Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Queue Worker (Supervisor)

Buat file `/etc/supervisor/conf.d/mandala-worker.conf`:

```ini
[program:mandala-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3 --timeout=90
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
```

```bash
supervisorctl reread && supervisorctl update && supervisorctl start mandala-worker:*
```

### Cron Job (Scheduler)

```bash
* * * * * cd /path/to/mandala-arena && php artisan schedule:run >> /dev/null 2>&1
```

### WebSocket (Reverb) — Production

```ini
[program:mandala-reverb]
command=php /path/to/artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/reverb.log
```

---

## 🧪 Testing

```bash
# Jalankan semua test
php artisan test

# Feature test saja
php artisan test --testsuite=Feature

# Unit test NLP saja
php artisan test --testsuite=Unit

# Test spesifik
php artisan test tests/Feature/BookingAuthorizationTest.php
php artisan test tests/Feature/MidtransWebhookTest.php
```

> **Catatan:** Test menggunakan database MySQL terpisah `mandala_arena_test`.
> Buat sekali sebelum menjalankan test: `CREATE DATABASE mandala_arena_test;`

Test yang tersedia:

| File | Coverage |
|---|---|
| `tests/Feature/BookingAuthorizationTest.php` | IDOR, ownership check, guest token, admin bypass |
| `tests/Feature/MidtransWebhookTest.php` | Signature validation, idempotency, state transition |
| `tests/Unit/NlpPipelineTest.php` | Pipeline NLP end-to-end |
| `tests/Unit/AdvancedNlpTest.php` | Intent & entity extraction edge cases |

---

## 📡 WebSocket Channels (Private)

| Channel | Tipe | Digunakan untuk |
|---|---|---|
| `private-admin-bookings` | Private | Notifikasi booking baru/diupdate — hanya admin |
| `private-user-booking.{id}` | Private | Update status booking — hanya pemilik booking |
| `private-chatbot.{userId}` | Private | Pesan chatbot real-time per user |

> **Semua channel bersifat Private.** Authorization didefinisikan di `routes/channels.php`.

---

*Dibuat oleh **Nadhif M. Yusuf** · [github.com/yourdho](https://github.com/yourdho)*
