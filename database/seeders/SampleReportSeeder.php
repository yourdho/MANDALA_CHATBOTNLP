<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Facility;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SampleReportSeeder extends Seeder
{
    public function run()
    {
        // Temukan semua fasilitas
        $facilities = Facility::all();
        if ($facilities->isEmpty()) {
            $this->command->info('Tidak ada fasilitas. Buat fasilitas terlebih dahulu.');
            return;
        }

        // Hapus data sample sebelumnya jika ada
        DB::table('users')->where('email', 'like', '%@samplereport.com')->delete();

        $this->command->info('Mulai membuat data booking contoh...');

        $now = Carbon::now();
        $startDate = $now->copy()->subDays(30);
        $endDate = $now->copy()->addDays(30);

        $currentDate = $startDate->copy();

        $bookingCount = 0;

        while ($currentDate->lte($endDate)) {
            $this->command->info('Memproses tanggal: ' . $currentDate->toDateString());
            // Buat 1 sampai 5 booking per hari
            $dailyBookings = rand(1, 5);

            for ($j = 0; $j < $dailyBookings; $j++) {
                // User unik per booking
                $user = User::create([
                    'name' => 'Sample User ' . Str::random(4),
                    'email' => 'sample_' . uniqid() . '@samplereport.com',
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'phone' => '0812' . rand(10000000, 99999999),
                    'email_verified_at' => now(),
                ]);

                $facility = $facilities->random();

                // Waktu acak antara jam 08:00 sampai 20:00
                $startHour = rand(8, 20);
                $startsAt = $currentDate->copy()->setHour($startHour)->setMinute(0)->setSecond(0);
                $duration = rand(1, 2);
                $endsAt = $startsAt->copy()->addHours($duration);

                $price = $facility->price_per_hour ?? 150000;
                $totalPrice = $price * $duration;

                // Tambahan random addons
                $addonsTotal = 0;
                $selectedAddons = [];
                if (!empty($facility->addons) && is_array($facility->addons) && rand(0, 1)) {
                    $randomAddon = $facility->addons[array_rand($facility->addons)];
                    $selectedAddons[] = $randomAddon['name'];
                    $addonsTotal = (float) $randomAddon['price'];
                    $totalPrice += $addonsTotal;
                }

                try {
                    Booking::create([
                        'user_id' => $user->id,
                        'facility_id' => $facility->id,
                        'guest_name' => $user->name,
                        'guest_email' => $user->email,
                        'guest_phone' => $user->phone,
                        'starts_at' => $startsAt,
                        'ends_at' => $endsAt,
                        'duration_hours' => $duration,
                        'total_price' => $totalPrice,
                        'status' => Booking::STATUS_CONFIRMED,
                        'payment_status' => 'paid',
                        'payment_method' => 'lunas_online',
                        'payment_token' => 'DUMMY-' . uniqid(),
                        'paid_at' => $currentDate->copy()->subMinutes(rand(10, 100)), // Bayar sebelum starts_at
                        'selected_addons' => $selectedAddons,
                        'addons_total_price' => $addonsTotal,
                    ]);
                    $bookingCount++;
                } catch (\Exception $e) {
                    if (!str_contains($e->getMessage(), 'Integrity constraint violation')) {
                        $this->command->error($e->getMessage());
                    }
                }
            }

            $currentDate->addDay();
        }

        $this->command->info("Selesai! $bookingCount booking contoh (sebulan ke belakang sampai sebulan ke depan) telah dibuat dengan user berbeda-beda.");
    }
}
