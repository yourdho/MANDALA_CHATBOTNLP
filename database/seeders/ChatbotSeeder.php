<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatbotSetting;

class ChatbotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Settings
        ChatbotSetting::updateOrCreate(
            ['key' => 'greeting'],
            ['value' => "Halo! Sampurasun! 🙏 Selamat datang di **Mandala Arena Command Bot** 🤖\n\nArena olahraga modern di Garut.\n\nSiap untuk misi olahraga hari ini?\nKami menyediakan:\n- ⚽ **Mini Soccer**\n- 🎾 **Padel**\n- 🏀 **Basket**\n- 🧘 **Pilates**\n\nKetik langsung untuk cek ketersediaan:\n_\"booking padel besok jam 10\"_ atau _\"ada fasilitas apa?\"_"]
        );
    }
}
