<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Config;

class ResponseGenerator
{
    /**
     * Pilih satu variasi respons secara acak dari array template.
     * Ini membuat chatbot terdengar natural, bukan seperti mesin.
     */
    private function pick(array $variants): string
    {
        return $variants[array_rand($variants)];
    }

    public function generate(string $intent, array $chips = [], ?string $redirect = null, ?string $paymentUrl = null, ?string $snapToken = null, array $extraContext = []): array
    {
        $reply = "";

        // ── NLG: Variasi Template per Intent ──────────────────────────────────
        // Setiap intent memiliki 3–5 variasi jawaban agar percakapan terasa alami.
        $responses = [
            'greeting' => [
                'Halo! Sampurasun! 🙏 Saya Mandalabot 🤖. Ada yang bisa saya bantu untuk info penyewaan lapangan di Mandala Arena?',
                'Hai! Selamat datang di Mandala Arena 🏟️. Saya Mandalabot, siap membantu Kakak. Mau booking, cek jadwal, atau info fasilitas?',
                'Halo Kak! 👋 Sampurasun dari Mandala Arena. Ada yang bisa Mandalabot bantu hari ini?',
                'Wilujeng sumping di Mandala Arena! 🙏 Saya Mandalabot. Mau tahu info lapangan, harga, atau langsung booking?',
            ],

            'booking' => [
                'Siap! Untuk booking, sebutkan jenis lapangan (Mini Soccer / Basket / Padel / Pilates) dan tanggal mainnya ya. 📅',
                'Mantap, Mandalabot siap bantu booking! 🏆 Tinggal info fasilitas yang mau disewa dan tanggal / jam mainnya ya Kak.',
                'Oke Kak! Fasilitas apa yang mau dipesan? Bisa pilih: Mini Soccer, Basket, Padel, atau Pilates. Jangan lupa sebutkan tanggal dan jamnya! ⚽🏀🎾🧘',
                'Gas booking sekarang! 🔥 Kakak pilih lapangan apa dan mau main tanggal berapa? Yuk kabarin Mandalabot!',
            ],

            'check_schedule' => [
                'Bisa cek langsung ketersediaan jadwalnya dengan menyebutkan lapangan dan tanggal.',
                'Siap cek jadwal! Sebutkan lapangan apa dan tanggal yang mau dicek ya Kak.',
                'Mandalabot cek jadwal dulu ya. Lapangan apa dan untuk tanggal berapa Kak?',
            ],

            // ── Availability Check: Respons awal saat user tanya "ada jam kosong?" ──
            'availability_check' => [
                'Wah, Mandalabot langsung cek yuk! 🔍 Lapangan apa dan tanggal serta jam berapa yang mau dicek Kak?',
                'Siap bantu cek slot kosong! 📅 Sebutkan fasilitas, tanggal, dan jam yang diinginkan ya Kak.',
                'Ayo cek dulu, biar Kak nggak kecele! 😄 Lapangan apa, tanggal berapa, jam berapa?',
                'Tentu Kak! Kasih tahu lapangan dan waktu yang Kakak mau, Mandalabot langsung cek ke sistem.',
            ],

            // ── Slot Available: Template dinamis (dipakai BookingFlowManager langsung via pick) ──
            'slot_available' => [
                "Wah, kebetulan banget Kak! 🎉 Slot tersebut masih kosong. Mau langsung Mandalabot pesankan sekarang?",
                "Kabar baik! ✅ Jadwal yang Kakak minta masih tersedia. Ayo langsung dipesan sebelum kehabisan!",
                "Mantap, masih kosong! 🏟️ Mau Mandalabot langsung jadwalkan untuk Kakak?",
            ],

            // ── Add-ons Prompt: Template pertanyaan Wasit/Fotografer ──
            'addons_prompt' => [
                "Oke siap! 🎉 Biar mainnya makin pro, perlu Mandalabot siapkan **Wasit** atau **Fotografer** juga nggak Kak? Lumayan buat dokumentasi mabar nanti. 📷",
                "Mantap! Oh iya Kak, sekalian mau dibantu pesan **Wasit** atau **Fotografer** biar mainnya makin seru? 🏆",
                "Gas! Mau tambah **Wasit** biar fair, atau **Fotografer** buat abadiin momen epic-nya Kak? Pilih aja ya! 📸",
                "Siap diproses! Ngomong-ngomong, mau sekalian pesan **Wasit** (Rp 100rb) atau **Fotografer** (Rp 150rb) nggak Kak? Biar makin berkesan! ✨",
            ],

            'prices' => [
                "Harga sewa lapangan di **Mandala Arena** bervariasi:\n\n⚽ **Mini Soccer**: Mulai Rp 300rb/jam\n🏀 **Basket**: Mulai Rp 150rb/jam\n🎾 **Padel**: Mulai Rp 200rb/jam\n🧘 **Pilates**: Mulai Rp 100rb/sesi\n\nMau info harga yang lebih spesifik untuk lapangan mana?",
                "Berikut kisaran harga di **Mandala Arena** Kak:\n\n⚽ Mini Soccer mulai Rp 300rb/jam\n🏀 Basket mulai Rp 150rb/jam\n🎾 Padel mulai Rp 200rb/jam\n🧘 Pilates mulai Rp 100rb/sesi\n\nAda yang mau ditanyakan lebih detail?",
            ],

            'price_check' => [
                "Harga sewa lapangan di **Mandala Arena** bervariasi:\n\n⚽ **Mini Soccer**: Mulai Rp 300rb/jam\n🏀 **Basket**: Mulai Rp 150rb/jam\n🎾 **Padel**: Mulai Rp 200rb/jam\n🧘 **Pilates**: Mulai Rp 100rb/sesi\n\nMau info harga yang lebih spesifik untuk lapangan mana?",
                "Boleh! Info harga di **Mandala Arena** nih Kak 💰:\n\n⚽ Mini Soccer: ab Rp 300rb/jam\n🏀 Basket: ab Rp 150rb/jam\n🎾 Padel: ab Rp 200rb/jam\n🧘 Pilates: ab Rp 100rb/sesi\n\nBiasanya ada promo juga lho! Mau tanya fasilitas tertentu?",
                "Sabaraha? Ini harganya Kak 👇\n\n⚽ Mini Soccer: ~Rp 300rb/jam\n🏀 Basket: ~Rp 150rb/jam\n🎾 Padel: ~Rp 200rb/jam\n🧘 Pilates: ~Rp 100rb/sesi\n\nDi atas belum termasuk promo ya. Mau cek availability sekarang?",
            ],

            'facilities' => [
                'Di Mandala Arena, kami punya lapangan Mini Soccer, Futsal, Basket, Padel, dan studio Pilates. Fasilitasnya kumplit: parkir luas, ruang ganti, shower, jeung cafe oge aya! ☕',
                'Kami punya banyak pilihan Kak! 🏟️ Ada Mini Soccer, Basket, Padel, dan kelas Pilates. Plus fasilitas parkir, kamar mandi, dan cafe. Mau cobain yang mana?',
                'Lengkap banget fasilitasnya! Mandala Arena punya: ⚽ Mini Soccer, 🏀 Basket, 🎾 Padel, 🧘 Pilates. Ada juga parkir, ruang ganti & shower, dan café. Mantap kan!',
            ],

            'facility_info' => [
                'Di Mandala Arena, kami punya lapangan Mini Soccer, Basket, Padel, dan studio Pilates. Fasilitasnya kumplit: parkir luas, ruang ganti, shower, jeung cafe oge aya! ☕',
                'Lengkap banget Kak! Ada ⚽ Mini Soccer, 🏀 Basket, 🎾 Padel, 🧘 Pilates. Ditambah parkir luas, ruang ganti & shower, dan café. Mau info fasilitas yang mana?',
                'Mandala Arena siap melayani! 🏟️ Fasilitas tersedia: Mini Soccer, Basket, Padel, dan Pilates. Semua dilengkapi parkir, ruang ganti, shower, serta café. Ada yang mau ditanya lebih lanjut?',
                'Kami punya pilihan lengkap Kak: ⚽ Mini Soccer, 🏀 Basket, 🎾 Padel, 🧘 Pilates. Fasilitas pendukung: parkir, ruang ganti, shower, dan café juga aya!',
            ],

            'location' => [
                'Mandala Arena lokasinya di **Jalan KH. Hasan Arif, Garut**. Supaya teu nyasar, ketik aja "Mandala Arena" di Google Maps atau klik menu Lokasi di web! 📍',
                'Kami ada di **Jl. KH. Hasan Arif, Garut** Kak. Cari di Google Maps dengan kata kunci "Mandala Arena Garut" pasti ketemu deh! 🗺️',
                'Lokasi Mandala Arena: **Jalan KH. Hasan Arif, Garut**. Bisa dibuka di Google Maps ya Kak, ketik "Mandala Arena" terus ikutin petunjuknya! 📍',
            ],

            'location_info' => [
                'Mandala Arena lokasinya di **Jalan KH. Hasan Arif, Garut**. Supaya teu nyasar, ketik "Mandala Arena" di Google Maps atau klik menu Lokasi di web! 📍',
                'Kami ada di **Jl. KH. Hasan Arif, Garut** Kak 🗺️. Gampang ditemuinnya, cari aja "Mandala Arena Garut" di Google Maps!',
                'Lokasinya di **Jalan KH. Hasan Arif, Garut** ya Kak. Bisa langsung buka Google Maps dan ketik "Mandala Arena" untuk petunjuk arahnya. 📍',
            ],

            'payment' => [
                'Pembayaran sangat mudah! Bisa pakai QRIS, Transfer Bank (VA), atau e-Wallet via Midtrans. Untuk booking via Chatbot, Kakak akan langsung diberikan link pembayaran otomatis. Aman dan cepat! ⚡',
                'Banyak pilihan bayarnya Kak! 💳 Ada QRIS, Transfer Bank, Virtual Account, dan e-Wallet. Setelah booking, link pembayaran akan langsung muncul otomatis via Midtrans.',
                'Mau bayar pakai apa Kak? Tersedia: QRIS, Transfer Bank, Virtual Account, atau e-Wallet. Semuanya aman dan diproses via Midtrans. Setelah booking, link bayar langsung dikirim! ⚡',
            ],

            'payment_help' => [
                'Pembayaran sangat mudah! Bisa pakai QRIS, Transfer Bank (VA), atau e-Wallet via Midtrans. Setelah booking, link pembayaran akan langsung muncul otomatis. Aman dan cepat! ⚡',
                'Tersedia beragam metode pembayaran Kak 💳: QRIS, Transfer Bank, Virtual Account, dan e-Wallet. Semua diproses via Midtrans, aman dijamin!',
                'Gampang bayarnya Kak! Ada QRIS (scan langsung), Transfer Bank, VA, atau e-Wallet. Pilih yang paling nyaman ya. Setelah booking, link pembayaran otomatis muncul! 🔐',
            ],

            'cancel_booking' => [
                'Oke, siap! Pesanan dibatalkan. Ada lagi yang bisa Mandalabot bantu? 😊',
                'Baik Kak, pesanan sudah dibatalkan. Semoga lain kali bisa booking lagi ya! 🙏',
                'Sudah dibatalkan Kak. Jangan sungkan untuk kembali booking kapan pun ya! 😊',
            ],

            'cancel' => [
                'Oke, siap! Pesanan dibatalkan. Ada lagi yang bisa Mandalabot bantu? 😊',
                'Baik Kak, pesanan sudah dibatalkan. Kalau berubah pikiran, siap bantu booking lagi ya! 🙏',
                'Sudah di-cancel Kak. Jangan ragu balik lagi kalau mau main di Mandala Arena ya! 🤝',
            ],

            'contact' => [
                'Butuh bantuan admin? Chat ke WhatsApp kami di **0812-3456-7890** ya! 📱',
                'Bisa langsung hubungi admin kami via WhatsApp di **0812-3456-7890** Kak. Siap membantu! 💬',
                'Admin kami bisa dihubungi di WhatsApp **0812-3456-7890**. Jangan ragu untuk bertanya ya Kak! 📱',
            ],

            'promo_info' => [
                'Saat ini ada diskon khusus untuk pelajar setiap hari kerja sebelum jam 16:00! Segera pesen jadwalnya yuk. 🎉',
                'Ada promo menarik nih Kak! 🔥 Diskon khusus pelajar di hari kerja sebelum pukul 16:00. Cepetan sebelum slot-nya penuh!',
                'Info promo terbaru: 🎊 Pelajar dapat potongan harga di weekday sebelum jam 4 sore. Jangan sampai kelewatan ya!',
                'Kak mau promo? Ada diskon pelajar untuk hari kerja (Senin–Jumat) sebelum jam 16:00 lho! Langsung booking sekarang yuk 🏆',
            ],

            'operating_hours' => [
                'Kami buka setiap hari dari jam **06:00 pagi sampai jam 23:00 malam**. ⏰ Lengkap banget kan!',
                'Mandala Arena buka setiap hari (termasuk weekend) mulai **pk 06:00 – 23:00 WIB** Kak. Jadi bisa main kapan aja! ⏰',
                'Jam operasional kami: **Setiap hari, 06.00 – 23.00 WIB**. Sabtu dan Minggu juga buka lho Kak! 🗓️',
                'Buka tiap hari dari **pagi jam 6 sampai malam jam 11** Kak. Fleksibel banget, bisa disesuaikan jadwal Kakak! ⏰',
            ],

            'reschedule' => [
                'Untuk merubah jadwal, silakan ajukan pembatalan (ketik "batal") lalu buat jadwal baru, atau hubungi admin ya Kak.',
                'Mau reschedule? Caranya: ketik "batal" untuk batalkan dulu, lalu buat booking baru di tanggal/jam yang berbeda. Atau bisa langsung hubungi admin! 📅',
                'Jadwal mau diubah? Bisa Kak! Batalkan booking dulu (ketik "batal"), lalu buat yang baru. Atau kontak admin di WhatsApp ya untuk bantuan lebih lanjut.',
            ],

            'thanks' => [
                'Sama-sama Kak! Ditunggu kedatangannya di Mandala Arena! 🔥',
                'Nuhun balik Kak! 🙏 Mandalabot senang bisa membantu. Sampai ketemu di Mandala Arena ya!',
                'Dengan senang hati Kak! 😊 Semoga aktivitas di Mandala Arena menyenangkan. Yuk ke sini soon!',
                'Sami-sami Kak! 🏟️ Kalau ada yang perlu ditanya lagi, Mandalabot siap membantu kapan saja.',
            ],

            'matchmaking' => [
                'Fitur cari lawan main sedang kami kembangkan! 🚀 Nantikan segera update seru ini di web kami ya Kak.',
                'Wah, mau mabar nih! 🔥 Fitur matchmaking-nya sedang dalam pengembangan. Stay tuned di web Mandala Arena ya!',
                'Sabar ya Kak, fitur cari lawan main & sparring partner masih on the way! 🛠️ Akan segera hadir di Mandala Arena.',
            ],

            'complaint' => [
                'Waduh, maaf atas ketidaknyamanannya Kak. 🙏 Bisa ceritakan lebih lanjut? CS kami akan segera membantu.',
                'Aduh, mohon maaf ya Kak! 😔 Ceritakan masalahnya, Mandalabot catat dan teruskan ke tim kami segera.',
                'Maaf banget Kak atas pengalaman yang kurang menyenangkan. 🙏 Tolong ceritakan detailnya agar bisa kami tindaklanjuti secepatnya!',
                'Kami minta maaf Kak. 😔 Tim CS kami siap membantu, bisa hubungi WhatsApp admin atau ceritakan masalahnya langsung di sini.',
            ],

            // ── Additional Services: Respons konfirmasi pilih add-ons ──
            'addon_confirmed_wasit' => [
                'Oke, Wasit sudah disiapkan! 🟡 Mainnya makin seru dan fair nih Kak.',
                'Mantap! Wasit akan hadir di lapangan. Siap wasit stand by! 🟡',
            ],
            'addon_confirmed_fotografer' => [
                'Keren! Fotografer siap mengabadikan momen terbaik Kakak. 📷✨',
                'Oke, Fotografer sudah di-booking! Siap-siap masuk feed ya Kak. 📸',
            ],
            'addon_confirmed_both' => [
                'Wah, paket lengkap nih! 🎉 Wasit + Fotografer sudah siap. Bakal jadi sesi paling epic!',
                'Mantap banget! Wasit & Fotografer siap hadir. Main serius, foto keren! 🏆📷',
            ],
            'addon_declined' => [
                'Sip Kak! Fokus main aja dulu. Kapan-kapan bisa tambah add-ons ya. 💪',
                'Oke, skip add-ons. Tetap semangat mainnya Kak! 🔥',
            ],
        ];

        if ($intent === 'low_confidence') {
            $reply = Config::get('chatbot_nlp.fallback_phrases.low_confidence');
            $chips = [
                ['label' => '⚽ Booking', 'msg' => 'booking'],
                ['label' => '📍 Lokasi', 'msg' => 'lokasi'],
                ['label' => '🤝 Mabar', 'msg' => 'mabar'],
            ];
        } elseif ($intent === 'ambiguous') {
            $reply = Config::get('chatbot_nlp.clarification_templates.ambiguous');
            $opt1 = $extraContext[0] ?? 'Booking';
            $opt2 = $extraContext[1] ?? 'Lainnya';
            $reply = str_replace(['[OPTION_1]', '[OPTION_2]'], [strtoupper($opt1), strtoupper($opt2)], $reply);
            $chips = [
                ['label' => ucwords(str_replace('_', ' ', $opt1)), 'msg' => str_replace('_', ' ', $opt1)],
                ['label' => ucwords(str_replace('_', ' ', $opt2)), 'msg' => str_replace('_', ' ', $opt2)],
            ];
        } else {
            if ($intent === 'unknown') {
                $reply = "Maaf Kak, instruksi tidak dikenal. Ketik 'bantuan' jika bingung.";
            } else {
                $variants = $responses[$intent] ?? null;
                $reply = $variants
                    ? $this->pick($variants)
                    : ("Siap laksanakan! Terkait " . ucwords(str_replace('_', ' ', $intent)) . ".");

                if ($intent == 'login_help') {
                    $reply = "Silakan masuk ke akun Anda melalui link berikut ya Kak!";
                    $redirect = route('login');
                }
                if ($intent == 'register_help') {
                    $reply = "Silakan daftar akun baru Anda melalui link berikut ya Kak!";
                    $redirect = route('register');
                }
            }
        }

        return [
            'reply'      => $reply,
            'chips'      => $chips,
            'redirect'   => $redirect,
            'paymentUrl' => $paymentUrl,
            'snapToken'  => $snapToken,
        ];
    }

    /**
     * Hasilkan respons availability yang kaya konteks.
     * Dipanggil langsung oleh BookingFlowManager setelah cek DB.
     *
     * @param string $facilityName  Nama fasilitas
     * @param string $dateLabel     Label tanggal yang sudah diformat
     * @param string $timeLabel     Label waktu (misal "19:00–20:00")
     * @param bool   $isAvailable   True jika slot kosong
     */
    public function generateAvailabilityResponse(
        string $facilityName,
        string $dateLabel,
        string $timeLabel,
        bool $isAvailable
    ): string {
        if ($isAvailable) {
            $templates = [
                "Wah, kebetulan banget Kak! 🎉 Untuk **{$dateLabel}** jam **{$timeLabel}** di **{$facilityName}** masih ada slot kosong nih. Mau langsung Mandalabot pesankan sekarang?",
                "Kabar baik! ✅ Slot **{$facilityName}** tanggal **{$dateLabel}** jam **{$timeLabel}** masih tersedia. Ayo, langsung dipesan sebelum diambil orang, Kak! 😄",
                "Mantap, masih kosong! 🏟️ Lapangan **{$facilityName}** pada **{$dateLabel}** pukul **{$timeLabel}** belum ada yang book. Mau Mandalabot langsung jadwalkan?",
                "Rejeki Kak! 🙌 **{$facilityName}** di tanggal **{$dateLabel}** jam **{$timeLabel}** masih free nih. Gas langsung booking?",
            ];
        } else {
            $templates = [
                "Waduh 😱 jadwal **{$facilityName}** pada **{$dateLabel}** jam **{$timeLabel}** sudah penuh Kak. Mau geser ke jam lain?",
                "Sayang banget, slot **{$facilityName}** jam **{$timeLabel}** tanggal **{$dateLabel}** sudah terisi. Mau coba jam lain Kak? 🕐",
                "Yah, sudah ada yang book duluan 😅 **{$facilityName}** jam **{$timeLabel}** penuh. Masih banyak slot lain kok, mau pilih jam berapa?",
            ];
        }

        return $templates[array_rand($templates)];
    }

    /**
     * Generate respons untuk tawaran add-ons (Wasit / Fotografer).
     */
    public function generateAddonsPrompt(): string
    {
        $questions = [
            "Oke siap! 🎉 Biar mainnya makin pro, perlu Mandalabot siapkan **Wasit** atau **Fotografer** juga nggak Kak? Lumayan buat dokumentasi mabar nanti. 📷",
            "Mantap! Oh iya Kak, sekalian mau dibantu pesan **Wasit** atau **Fotografer** biar mainnya makin seru? 🏆",
            "Gas! Mau tambah **Wasit** biar fair, atau **Fotografer** buat abadiin momen epic-nya Kak? Pilih aja ya! 📸",
            "Siap diproses! Ngomong-ngomong, mau sekalian pesan **Wasit** (Rp 100rb) atau **Fotografer** (Rp 150rb) nggak Kak? Biar makin berkesan! ✨",
        ];

        return $questions[array_rand($questions)];
    }

    /**
     * appendContextReminder — Gabungkan jawaban general intent dengan pengingat booking
     * yang sedang berjalan. Dipanggil HANYA saat terjadi Context-Switching.
     *
     * Logika:
     * - Jika slot sudah ada (facility + date/time), buat kalimat pengingat spesifik.
     * - Jika slot masih kosong, kembalikan baseReply saja tanpa tambahan.
     *
     * @param string $baseReply  Jawaban atas pertanyaan general user
     * @param array  $slots      Slot booking yang sudah terkumpul di session
     * @param string $currentState State percakapan saat ini
     */
    public function appendContextReminder(string $baseReply, array $slots, string $currentState = 'IDLE'): string
    {
        // Tidak ada context booking yang perlu diingatkan
        if (empty($slots) || empty($slots['facility_name'])) {
            return $baseReply;
        }

        $facilityName = $slots['facility_name'] ?? null;
        $date         = $slots['date']          ?? null;
        $time         = $slots['time']          ?? null;
        $duration     = $slots['duration']      ?? null;

        // ── Template Reminder berdasarkan kelengkapan slot ───────────────────

        // Slot lengkap: facility + date + time + duration
        if ($facilityName && $date && $time && $duration) {
            $dateLabel = \Carbon\Carbon::parse($date)->translatedFormat('l, d F');
            $timeLabel = \Carbon\Carbon::parse($time)->format('H:i');

            $reminders = [
                "\n\n---\nBtw Kak, tadi lagi proses booking **{$facilityName}** untuk **{$dateLabel}** jam **{$timeLabel}** selama **{$duration} jam** ya. Mau dilanjutkan sekarang?",
                "\n\n---\nOh iya, Mandalabot masih nunggu konfirmasi booking **{$facilityName}** di **{$dateLabel}** jam **{$timeLabel}**. Gas lanjut Kak? 😄",
                "\n\n---\nJangan lupa ya Kak, ada booking **{$facilityName}** yang belum selesai buat **{$dateLabel}** jam **{$timeLabel}**. Lanjut booking-nya? 🏟️",
            ];
            return $baseReply . $reminders[array_rand($reminders)];
        }

        // Slot sebagian: facility + date (waktu belum ada)
        if ($facilityName && $date) {
            $dateLabel = \Carbon\Carbon::parse($date)->translatedFormat('l, d F');

            $reminders = [
                "\n\n---\nNgomong-ngomong Kak, tadi mau booking **{$facilityName}** untuk **{$dateLabel}**. Mau lanjut isi jam mainnya?",
                "\n\n---\nBtw, masih ada booking **{$facilityName}** tanggal **{$dateLabel}** yang belum selesai. Lanjutin yuk Kak! ⏰",
            ];
            return $baseReply . $reminders[array_rand($reminders)];
        }

        // Slot minimal: hanya facility
        if ($facilityName) {
            $reminders = [
                "\n\n---\nKalau sudah jelas info-nya, yuk lanjut booking **{$facilityName}** Kak! Tadi kan baru mulai. 😊",
                "\n\n---\nBtw, booking **{$facilityName}** masih di-pending nih Kak. Lanjut sekarang atau nanti?",
            ];
            return $baseReply . $reminders[array_rand($reminders)];
        }

        return $baseReply;
    }

    public function generateRaw(string $text, array $chips = [], ?string $redirect = null, ?string $paymentUrl = null, ?string $snapToken = null): array
    {
        return [
            'reply'      => $text,
            'chips'      => $chips,
            'redirect'   => $redirect,
            'paymentUrl' => $paymentUrl,
            'snapToken'  => $snapToken,
        ];
    }
}
