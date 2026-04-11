<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reward;
use Carbon\Carbon;

class RewardSeeder extends Seeder
{
    public function run(): void
    {
        $rewards = [
            [
                'title' => 'Ramadan Kareem Promo',
                'description' => 'Potongan harga Rp 50.000 untuk semua booking lapangan Mini Soccer.',
                'points_required' => 500,
                'discount_type' => 'fixed',
                'discount_value' => 50000.00,
                'max_discount' => 50000.00,
                'valid_until' => Carbon::now()->addMonths(2),
                'quota' => 100,
                'is_active' => true,
            ],
            [
                'title' => 'Weekend Warrior ',
                'description' => 'Diskon 15% untuk booking Padel di hari Sabtu & Minggu.',
                'points_required' => 300,
                'discount_type' => 'percentage',
                'discount_value' => 15.00,
                'max_discount' => 30000.00,
                'valid_until' => Carbon::now()->addMonths(1),
                'quota' => 50,
                'is_active' => true,
            ],
            [
                'title' => 'Early Bird Perk',
                'description' => 'Main pagi hari jam 06:00 - 09:00 diskon Rp 20.000.',
                'points_required' => 200,
                'discount_type' => 'fixed',
                'discount_value' => 20000.00,
                'max_discount' => 20000.00,
                'valid_until' => Carbon::now()->addMonths(3),
                'quota' => 200,
                'is_active' => true,
            ],
            [
                'title' => 'New Member Special',
                'description' => 'Voucher pertama kali booking. Potongan Rp 10.000.',
                'points_required' => 0,
                'discount_type' => 'fixed',
                'discount_value' => 10000.00,
                'max_discount' => 10000.00,
                'valid_until' => Carbon::now()->addYears(1),
                'quota' => 999,
                'is_active' => true,
            ],
        ];

        foreach ($rewards as $r) {
            Reward::updateOrCreate(['title' => $r['title']], $r);
        }
    }
}
