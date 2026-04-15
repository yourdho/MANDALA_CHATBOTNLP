<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatbotDictionary;
use App\Models\ChatbotSetting;

class ChatbotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Normalization Data (Slang to Formal)
        $normalizationData = [
            ['slang' => 'ga', 'formal' => 'tidak'],
            ['slang' => 'gak', 'formal' => 'tidak'],
            ['slang' => 'nggak', 'formal' => 'tidak'],
            ['slang' => 'ok', 'formal' => 'oke'],
            ['slang' => 'siap', 'formal' => 'oke'],
            ['slang' => 'mau', 'formal' => 'ingin'],
            ['slang' => 'pengen', 'formal' => 'ingin'],
            ['slang' => 'mw', 'formal' => 'ingin'],
            ['slang' => 'udh', 'formal' => 'sudah'],
            ['slang' => 'udah', 'formal' => 'sudah'],
            ['slang' => 'blm', 'formal' => 'belum'],
            ['slang' => 'blom', 'formal' => 'belum'],
            ['slang' => 'sy', 'formal' => 'saya'],
            ['slang' => 'gw', 'formal' => 'saya'],
            ['slang' => 'lu', 'formal' => 'kamu'],
            ['slang' => 'aja', 'formal' => 'saja'],
            ['slang' => 'aj', 'formal' => 'saja'],
            ['slang' => 'lap', 'formal' => 'lapangan'],
            // Sundanese
            ['slang' => 'abdi', 'formal' => 'saya'],
            ['slang' => 'hoyong', 'formal' => 'ingin'],
            ['slang' => 'bade', 'formal' => 'mau'],
            ['slang' => 'tos', 'formal' => 'sudah'],
            ['slang' => 'acan', 'formal' => 'belum'],
            ['slang' => 'nuhun', 'formal' => 'terimakasih'],
            ['slang' => 'mangga', 'formal' => 'silakan'],
            ['slang' => 'punten', 'formal' => 'permisi'],
            ['slang' => 'minsoc', 'formal' => 'mini soccer'],
            ['slang' => 'minsok', 'formal' => 'mini soccer'],
            ['slang' => 'maen', 'formal' => 'main'],
            ['slang' => 'maen bola', 'formal' => 'mini soccer'],
            ['slang' => 'lapang bola', 'formal' => 'mini soccer'],

            ['slang' => 'futsal', 'formal' => 'mini soccer'],
            ['slang' => 'raket', 'formal' => 'padel'],
            ['slang' => 'tenis', 'formal' => 'padel'],
            ['slang' => 'lebet', 'formal' => 'login'],
            ['slang' => 'asup', 'formal' => 'login'],
            ['slang' => 'tamu', 'formal' => 'guest'],
            ['slang' => 'moal', 'formal' => 'batal'],
            ['slang' => 'bolay', 'formal' => 'batal'],
            ['slang' => 'teu cios', 'formal' => 'batal'],
        ];



        foreach ($normalizationData as $item) {
            ChatbotDictionary::updateOrCreate(['slang' => $item['slang']], [
                'slang' => $item['slang'],
                'formal' => $item['formal'],
                'intent' => null, // Clear intent fields for normalization rows
                'keywords' => null,
                'response' => null,
            ]);
        }

        // 2. Intent Data (NLP Classification)
        $intentData = [
            [
                'intent' => 'greeting',
                'keywords' => ['halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'min', 'admin', 'bot', 'ping', 'p', 'punten', 'sampurasun', 'uy', 'euy', 'halo min'],
                'response' => 'Halo! Sampurasun! 🙏 Saya Mandalabot 🤖. Ada yang bisa saya bantu untuk info penyewaan lapangan di Mandala Arena?'
            ],
            [
                'intent' => 'booking',
                'keywords' => ['pesan', 'booking', 'sewa', 'mau main', 'boking', 'reservasi', 'book', 'jadwalin', 'pesen', 'nyewa', 'bade main', 'hoyong booking', 'bade nyewa', 'booking lapang', 'maen', 'maen bola', 'otorisasi', 'main'],
                'response' => 'Siap! Untuk booking, sebutkan jenis lapangan (Futsal/Mini Soccer/Basket/Padel/Pilates) dan tanggal mainnya ya. (Contoh: "Min, pesan mini soccer buat besok")'
            ],
            [
                'intent' => 'check_schedule',
                'keywords' => ['jadwal', 'kosong', 'kapan', 'tersedia', 'ada slot', 'slot', 'cek', 'jam berapa', 'hari ini', 'besok', 'jadwal poe ieu', 'iraha nu kosong', 'aya keneh', 'jadwalna', 'cek jadwal'],
                'response' => 'Bisa cek langsung ketersediaan jadwalnya dengan menyebutkan lapangan dan tanggal. (Contoh: "Cek jadwal futsal dinten ieu / hari ini")'
            ],
            [
                'intent' => 'prices',
                'keywords' => ['harga', 'berapa', 'tarif', 'biaya', 'pricelist', 'price list', 'harganya', 'bayar', 'sabaraha', 'sabarahaan', 'pangaos', 'hargana', 'ongkos', 'berapaan'],
                'response' => "Harga sewa lapangan di **Mandala Arena** bervariasi:\n\n⚽ **Mini Soccer**: Mulai Rp 300rb/jam\n🏀 **Basket**: Mulai Rp 150rb/jam\n🎾 **Padel**: Mulai Rp 200rb/jam\n🧘 **Pilates**: Mulai Rp 100rb/sesi\n\nMau info harga yang lebih spesifik untuk lapangan mana?"
            ],
            [
                'intent' => 'facilities',
                'keywords' => ['fasilitas', 'lapangan apa aja', 'ada lapangan', 'jenis lapangan', 'olahraga apa', 'padel', 'futsal', 'mini soccer', 'basket', 'pilates', 'lapang naon wae', 'aya lapang naon', 'minsok', 'kumplit'],
                'response' => 'Di Mandala Arena, kami punya lapangan Mini Soccer, Futsal, Basket, Padel, dan studio Pilates. Fasilitasnya kumplit: parkir luas, ruang ganti, shower, jeung cafe oge aya!'
            ],
            [
                'intent' => 'location',
                'keywords' => ['lokasi', 'alamat', 'dimana', 'daerah mana', 'gmaps', 'maps', 'rute', 'patokan', 'palih mana', 'di mana tempatna', 'lokasina'],
                'response' => 'Mandala Arena lokasinya di **Jalan KH. Hasan Arif, Garut**. Supaya teu nyasar, ketik aja "Mandala Arena" di Google Maps atau klik menu Lokasi di web!'
            ],
            [
                'intent' => 'payment',
                'keywords' => ['bayar pakai apa', 'metode pembayaran', 'transfer', 'qris', 'cash', 'dp', 'lunas', 'pembayaran', 'cara bayar', 'kumaha bayarna', 'tiasa dp', 'midtrans', 'otorisasi'],
                'response' => 'Pembayaran sangat mudah! Bisa pakai QRIS, Transfer Bank (VA), atau e-Wallet via Midtrans. Untuk booking via Chatbot, Anda akan langsung diberikan link pembayaran otomatis. Aman dan cepat! ⚡'
            ],
            [
                'intent' => 'cancel_booking',
                'keywords' => ['batal', 'cancel', 'refund', 'gak jadi', 'ubah jadwal', 'reschedule', 'pembatalan', 'teu cios', 'batalin', 'ngabolaykeun', 'moal', 'bolay'],
                'response' => 'Oke, siap! Pesanan dibatalkan. Ada lagi yang bisa Mandalabot bantu? 😊'
            ],
            [
                'intent' => 'contact',
                'keywords' => ['nomor', 'wa', 'telepon', 'kontak', 'hubungi', 'no wa', 'admin', 'cs', 'nomer admin', 'nomer wa'],
                'response' => 'Butuh bantuan admin? Chat ke WhatsApp kami di **0812-3456-7890** ya! 📱'
            ]
        ];

        foreach ($intentData as $item) {

            ChatbotDictionary::updateOrCreate(['intent' => $item['intent']], [
                'intent' => $item['intent'],
                'keywords' => $item['keywords'],
                'response' => $item['response'],
                'slang' => null, // Clear slang fields for intent rows
                'formal' => null,
            ]);
        }

        // 3. Settings
        ChatbotSetting::updateOrCreate(
            ['key' => 'greeting'],
            ['value' => "Halo! Sampurasun! 🙏 Selamat datang di **Mandala Arena Command Bot** 🤖\n\nArena olahraga modern di Garut.\n\nSiap untuk misi olahraga hari ini?\nKami menyediakan:\n- ⚽ **Mini Soccer**\n- 🎾 **Padel**\n- 🏀 **Basket**\n- 🧘 **Pilates**\n\nKetik langsung untuk cek ketersediaan:\n_\"booking padel besok jam 10\"_ atau _\"ada fasilitas apa?\"_"]
        );
    }
}
