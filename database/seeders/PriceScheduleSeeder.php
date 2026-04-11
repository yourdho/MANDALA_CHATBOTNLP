<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PriceScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('price_schedules')->truncate();
        DB::table('additional_items')->truncate();

        // === MINI SOCCER ===
        DB::table('price_schedules')->insert([
            ['sport_type' => 'Mini Soccer', 'session_name' => 'Pagi', 'start_time' => '06:00:00', 'end_time' => '11:59:59', 'price' => 450000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Mini Soccer', 'session_name' => 'Siang', 'start_time' => '12:00:00', 'end_time' => '17:59:59', 'price' => 550000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Mini Soccer', 'session_name' => 'Malam', 'start_time' => '18:00:00', 'end_time' => '23:59:59', 'price' => 650000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // === BASKETBALL ===
        DB::table('price_schedules')->insert([
            ['sport_type' => 'Basketball', 'session_name' => 'Pagi', 'start_time' => '06:00:00', 'end_time' => '12:00:00', 'price' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Basketball', 'session_name' => 'Siang', 'start_time' => '12:00:00', 'end_time' => '18:00:00', 'price' => 200000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Basketball', 'session_name' => 'Malam', 'start_time' => '18:00:00', 'end_time' => '23:59:00', 'price' => 250000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // === PADEL ===
        DB::table('price_schedules')->insert([
            ['sport_type' => 'Padel', 'session_name' => 'Pagi', 'start_time' => '06:00:00', 'end_time' => '17:59:59', 'price' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Padel', 'session_name' => 'Malam', 'start_time' => '18:00:00', 'end_time' => '23:59:59', 'price' => 275000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Padel', 'session_name' => 'Coaching Class', 'start_time' => null, 'end_time' => null, 'price' => 150000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Padel', 'session_name' => 'Private Class', 'start_time' => null, 'end_time' => null, 'price' => 375000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // === AKADEMI PADEL ===
        DB::table('price_schedules')->insert([
            ['sport_type' => 'Akademi Padel', 'session_name' => 'Paket Bulanan', 'start_time' => null, 'end_time' => null, 'price' => 600000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Akademi Padel', 'session_name' => 'Visit Only', 'start_time' => null, 'end_time' => null, 'price' => 80000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // === PILATES ===
        DB::table('price_schedules')->insert([
            ['sport_type' => 'Pilates', 'session_name' => '1 Session', 'start_time' => null, 'end_time' => null, 'price' => 199000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Pilates', 'session_name' => '4 Session Package', 'start_time' => null, 'end_time' => null, 'price' => 720000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Pilates', 'session_name' => '8 Session Package', 'start_time' => null, 'end_time' => null, 'price' => 1440000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Pilates', 'session_name' => '16 Session Package', 'start_time' => null, 'end_time' => null, 'price' => 2880000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Pilates', 'session_name' => '20 Session Package', 'start_time' => null, 'end_time' => null, 'price' => 3600000, 'created_at' => now(), 'updated_at' => now()],
            ['sport_type' => 'Pilates', 'session_name' => '40 Session Package', 'start_time' => null, 'end_time' => null, 'price' => 7200000, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // === ADDITIONAL ITEMS ===
        DB::table('additional_items')->insert([
            ['name' => 'Raket Dewasa', 'price' => 30000, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Raket Anak', 'price' => 20000, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
