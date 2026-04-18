<?php

namespace App\Services\Nlp;


use Illuminate\Support\Facades\Config;

class ResponseGenerator
{
    public function generate(string $intent, array $chips = [], ?string $redirect = null, ?string $paymentUrl = null, ?string $snapToken = null, array $extraContext = []): array
    {
        $reply = "";

        $responses = [
            'greeting' => 'Halo! Sampurasun! 🙏 Saya Mandalabot 🤖. Ada yang bisa saya bantu untuk info penyewaan lapangan di Mandala Arena?',
            'booking' => 'Siap! Untuk booking, sebutkan jenis lapangan (Futsal/Mini Soccer/Basket/Padel/Pilates) dan tanggal mainnya ya.',
            'check_schedule' => 'Bisa cek langsung ketersediaan jadwalnya dengan menyebutkan lapangan dan tanggal.',
            'availability_check' => 'Bisa cek langsung ketersediaan jadwalnya dengan menyebutkan lapangan dan tanggal.',
            'prices' => "Harga sewa lapangan di **Mandala Arena** bervariasi:\n\n⚽ **Mini Soccer**: Mulai Rp 300rb/jam\n🏀 **Basket**: Mulai Rp 150rb/jam\n🎾 **Padel**: Mulai Rp 200rb/jam\n🧘 **Pilates**: Mulai Rp 100rb/sesi\n\nMau info harga yang lebih spesifik untuk lapangan mana?",
            'price_check' => "Harga sewa lapangan di **Mandala Arena** bervariasi:\n\n⚽ **Mini Soccer**: Mulai Rp 300rb/jam\n🏀 **Basket**: Mulai Rp 150rb/jam\n🎾 **Padel**: Mulai Rp 200rb/jam\n🧘 **Pilates**: Mulai Rp 100rb/sesi\n\nMau info harga yang lebih spesifik untuk lapangan mana?",
            'facilities' => 'Di Mandala Arena, kami punya lapangan Mini Soccer, Futsal, Basket, Padel, dan studio Pilates. Fasilitasnya kumplit: parkir luas, ruang ganti, shower, jeung cafe oge aya!',
            'facility_info' => 'Di Mandala Arena, kami punya lapangan Mini Soccer, Futsal, Basket, Padel, dan studio Pilates. Fasilitasnya kumplit: parkir luas, ruang ganti, shower, jeung cafe oge aya!',
            'location' => 'Mandala Arena lokasinya di **Jalan KH. Hasan Arif, Garut**. Supaya teu nyasar, ketik aja "Mandala Arena" di Google Maps atau klik menu Lokasi di web!',
            'location_info' => 'Mandala Arena lokasinya di **Jalan KH. Hasan Arif, Garut**. Supaya teu nyasar, ketik aja "Mandala Arena" di Google Maps atau klik menu Lokasi di web!',
            'payment' => 'Pembayaran sangat mudah! Bisa pakai QRIS, Transfer Bank (VA), atau e-Wallet via Midtrans. Untuk booking via Chatbot, Anda akan langsung diberikan link pembayaran otomatis. Aman dan cepat! ⚡',
            'payment_help' => 'Pembayaran sangat mudah! Bisa pakai QRIS, Transfer Bank (VA), atau e-Wallet via Midtrans. Untuk booking via Chatbot, Anda akan langsung diberikan link pembayaran otomatis. Aman dan cepat! ⚡',
            'cancel_booking' => 'Oke, siap! Pesanan dibatalkan. Ada lagi yang bisa Mandalabot bantu? 😊',
            'cancel' => 'Oke, siap! Pesanan dibatalkan. Ada lagi yang bisa Mandalabot bantu? 😊',
            'contact' => 'Butuh bantuan admin? Chat ke WhatsApp kami di **0812-3456-7890** ya! 📱',
            'promo_info' => 'Saat ini ada diskon khusus untuk pelajar setiap hari kerja sebelum jam 16:00! Segera pesen jadwalnya yuk.',
            'operating_hours' => 'Kami buka setiap hari dari jam 06:00 pagi sampai jam 23:00 malam.',
            'reschedule' => 'Untuk merubah jadwal, silakan ajukan pembatalan (ketik "batal") lalu buat jadwal baru, atau hubungi admin.',
            'thanks' => 'Sama-sama Kak! Ditunggu kedatangannya di Mandala Arena! 🔥',
            'matchmaking' => 'Fitur cari lawan main sedang kami kembangkan! Nantikan segera update seru ini di web kami.',
            'complaint' => 'Waduh, maaf atas ketidaknyamanannya. Bisa ceritakan lebih lanjut? CS kami akan segera membantu.',
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
                 $reply = $responses[$intent] ?? ("Siap laksanakan! Terkait " . ucwords(str_replace('_', ' ', $intent)) . ".");
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
            'reply' => $reply,
            'chips' => $chips,
            'redirect' => $redirect,
            'paymentUrl' => $paymentUrl,
            'snapToken' => $snapToken
        ];
    }
    
    public function generateRaw(string $text, array $chips = [], ?string $redirect = null, ?string $paymentUrl = null, ?string $snapToken = null): array
    {
         return [
            'reply' => $text,
            'chips' => $chips,
            'redirect' => $redirect,
            'paymentUrl' => $paymentUrl,
            'snapToken' => $snapToken
        ];
    }
}
