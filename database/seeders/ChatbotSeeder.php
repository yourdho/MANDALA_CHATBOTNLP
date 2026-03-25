<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatbotDictionary;
use App\Models\ChatbotSetting;
use App\Models\Facility;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ChatbotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Chatbot Dictionary (Slang normalization)
        $dictionaries = [
            ['slang' => 'ga', 'formal' => 'tidak'],
            ['slang' => 'gak', 'formal' => 'tidak'],
            ['slang' => 'nggak', 'formal' => 'tidak'],
            ['slang' => 'ok', 'formal' => 'oke'],
            ['slang' => 'siap', 'formal' => 'oke'],
            ['slang' => 'booking', 'formal' => 'pesan'],
            ['slang' => 'pesen', 'formal' => 'pesan'],
            ['slang' => 'book', 'formal' => 'pesan'],
            ['slang' => 'mau', 'formal' => 'ingin'],
            ['slang' => 'pengen', 'formal' => 'ingin'],
            ['slang' => 'futsal', 'formal' => 'mini soccer'],
            ['slang' => 'bola', 'formal' => 'mini soccer'],
            ['slang' => 'raket', 'formal' => 'padel'],
            ['slang' => 'tenis', 'formal' => 'padel'],
            ['slang' => 'skrg', 'formal' => 'sekarang'],
            ['slang' => 'nanya', 'formal' => 'tanya'],
            ['slang' => 'info', 'formal' => 'tanya'],
            ['slang' => 'halo', 'formal' => 'halo'],
            ['slang' => 'makasih', 'formal' => 'terimakasih'],
        ];

        foreach ($dictionaries as $item) {
            ChatbotDictionary::updateOrCreate(['slang' => $item['slang']], $item);
        }

        // 2. Chatbot Greeting Setting (Mandala Theme)
        ChatbotSetting::updateOrCreate(
            ['key' => 'greeting'],
            ['value' => "Halo! Selamat datang di **Mandala Arena Command Bot** 🤖\n\nSiap untuk misi olahraga hari ini?\nKami menyediakan:\n- ⚽ **Mini Soccer**\n- 🎾 **Padel**\n- 🏸 **Badminton**\n- 🧘 **Pilates**\n\nKetik langsung untuk cek ketersediaan:\n_\"booking padel besok jam 10\"_ atau _\"ada fasilitas apa?\"_"]
        );

        // 3. (Optional) Chatbot behavior can be extended here
    }
}
