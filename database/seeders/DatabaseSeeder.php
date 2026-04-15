<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Facility;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin account
        User::create([
            'name' => 'Mandala Admin',
            'email' => 'admin@mandala.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '087892312759',
            'email_verified_at' => now(),
        ]);

        // 2. Regular user account
        User::create([
            'name' => 'Mission Member One',
            'email' => 'user@mandala.com',
            'password' => Hash::make('password'),
            'role' => 'user',
            'phone' => '08987654321',
            'email_verified_at' => now(),
        ]);

        // 3. Facilities
        $facilities = [
            [
                'name' => 'Mini Soccer Arena',
                'category' => 'Mini Soccer',
                'description' => 'Standard international synthetic turf. Optimized for high-intensity 7 vs 7 missions.',
                'price_per_hour' => 350000,
                'open_time' => '06:00',
                'close_time' => '23:00',
            ],
            [
                'name' => 'Padel Court 01',
                'category' => 'Padel',
                'description' => 'Premium glass-walled court. The future of racket sports is here at Mandala.',
                'price_per_hour' => 200000,
                'open_time' => '07:00',
                'close_time' => '22:00',
            ],
            [
                'name' => 'Pilates Reformer Zone',
                'category' => 'Pilates',
                'description' => 'Private reformer studio. Urban recovery and focus training at its peak.',
                'price_per_hour' => 150000,
                'open_time' => '06:00',
                'close_time' => '21:00',
            ],
            [
                'name' => 'Mandala Basket Hall',
                'category' => 'Basket',
                'description' => 'Full-size indoor basketball court with premium hardwood flooring and spectator seating.',
                'price_per_hour' => 450000,
                'open_time' => '06:00',
                'close_time' => '23:00',
                'images' => ['/images/facilities/basket/b1.jpg', '/images/facilities/basket/b2.jpg', '/images/facilities/basket/b3.jpg', '/images/facilities/basket/b4.jpg', '/images/facilities/basket/b5.jpg']
            ],
        ];

        foreach ($facilities as $f) {
            Facility::create($f);
        }

        // 4. Chatbot Data (Optional, but good to have)
        $this->call([
            ChatbotSeeder::class,
            UpdateFacilitiesSeeder::class,
            PriceScheduleSeeder::class,
            RewardSeeder::class,
            BlogSeeder::class,
        ]);
    }
}
