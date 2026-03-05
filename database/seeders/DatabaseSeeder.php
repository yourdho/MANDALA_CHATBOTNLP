<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ──────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@janjee.com'],
            [
                'name' => 'Admin Janjee',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '08100000000',
                'email_verified_at' => now(),
                'points_balance' => 0,
            ]
        );

        // ── Regular User (dengan poin awal untuk testing) ──────────
        User::firstOrCreate(
            ['email' => 'user@janjee.com'],
            [
                'name' => 'User Test',
                'password' => Hash::make('password'),
                'role' => 'user',
                'phone' => '08200000000',
                'email_verified_at' => now(),
                'points_balance' => 500, // poin awal untuk testing real-time
            ]
        );

        // ── User ke-2 untuk demo poin lebih besar ──────────────────
        User::firstOrCreate(
            ['email' => 'demo@janjee.com'],
            [
                'name' => 'Demo Pelanggan',
                'password' => Hash::make('password'),
                'role' => 'user',
                'phone' => '08300000000',
                'email_verified_at' => now(),
                'points_balance' => 3750, // level Silver
            ]
        );
    }
}
