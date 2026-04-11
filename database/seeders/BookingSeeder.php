<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Facility;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        // Facilities in DB: 1=Mini Soccer(350k), 2=Padel01(200k), 3=Badminton(50k), 4=Pilates(150k), 5=Padel02(200k)
        $facilities = Facility::all();
        $userIds = User::where('role', 'user')->pluck('id')->toArray();

        if ($facilities->isEmpty() || empty($userIds)) {
            $this->command->warn('No facilities or users found. Run DatabaseSeeder first.');
            return;
        }

        // Guest names for offline / manual bookings
        $guestNames = [
            'Budi Santoso',
            'Siti Rahayu',
            'Ahmad Fauzi',
            'Dewi Lestari',
            'Reza Pratama',
            'Rina Wati',
            'Hendra Gunawan',
            'Yanti Kusuma',
            'Agus Salim',
            'Mega Putri'
        ];
        $guestPhones = [
            '081234567890',
            '082345678901',
            '083456789012',
            '085678901234',
            '087890123456',
            '088901234567',
            '089012345678',
            '081109876543',
            '082298765432',
            '083387654321'
        ];

        $statuses = ['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled'];
        $paymentStatuses = ['paid', 'paid', 'paid', 'pending', 'failed'];
        $paymentMethods = ['midtrans', 'bayar_ditempat', 'midtrans', 'bayar_ditempat', 'midtrans'];

        // Time slots: each booking is 1 or 2 hours in realistic slots
        $timeSlots = [
            ['08:00', '09:00'],
            ['09:00', '10:00'],
            ['10:00', '11:00'],
            ['14:00', '15:00'],
            ['15:00', '16:00'],
            ['16:00', '17:00'],
            ['17:00', '19:00'],
            ['19:00', '21:00'],
        ];

        $bookings = [];

        // Generate bookings for 90 days back from today
        $startDate = Carbon::now()->subDays(89)->startOfDay();
        $endDate = Carbon::now()->startOfDay();

        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            foreach ($facilities as $facility) {
                // Randomize: 0–3 bookings per day per facility (weighted so most days have at least 1)
                $count = fake()->randomElement([0, 1, 1, 2, 2, 3]);

                $usedSlots = [];

                for ($i = 0; $i < $count; $i++) {
                    // Pick a slot that hasn't been used yet today for this facility
                    $availableSlots = array_filter($timeSlots, fn($s) => !in_array($s[0], $usedSlots));
                    if (empty($availableSlots))
                        break;

                    $slot = fake()->randomElement(array_values($availableSlots));
                    $usedSlots[] = $slot[0];

                    $startsAt = $current->copy()->setTimeFromTimeString($slot[0]);
                    $endsAt = $current->copy()->setTimeFromTimeString($slot[1]);
                    $durationHours = $startsAt->diffInHours($endsAt);

                    $statusIdx = fake()->numberBetween(0, 4);
                    $status = $statuses[$statusIdx];
                    $paymentStatus = $paymentStatuses[$statusIdx];
                    $paymentMethod = $paymentMethods[$statusIdx];
                    $totalPrice = $facility->price_per_hour * $durationHours;

                    // Alternate between real users and guest bookings
                    $isGuest = fake()->boolean(35);
                    $userId = $isGuest
                        ? null
                        : $userIds[array_rand($userIds)];

                    $guestIdx = fake()->numberBetween(0, count($guestNames) - 1);

                    $bookings[] = [
                        'user_id' => $userId ?? $userIds[0],
                        'facility_id' => $facility->id,
                        'starts_at' => $startsAt,
                        'ends_at' => $endsAt,
                        'duration_hours' => $durationHours,
                        'is_with_referee' => fake()->boolean(15),
                        'referee_price' => fake()->boolean(15) ? 75000 : 0,
                        'total_price' => $totalPrice,
                        'points_used' => 0,
                        'status' => $status,
                        'payment_status' => $paymentStatus,
                        'payment_method' => $paymentMethod,
                        'payment_token' => null,
                        'payment_url' => null,
                        'guest_name' => $isGuest ? $guestNames[$guestIdx] : null,
                        'guest_phone' => $isGuest ? $guestPhones[$guestIdx] : null,
                        'guest_email' => $isGuest ? strtolower(str_replace(' ', '.', $guestNames[$guestIdx])) . '@gmail.com' : null,
                        'created_at' => $startsAt->copy()->subDays(fake()->numberBetween(1, 7)),
                        'updated_at' => $startsAt->copy()->subDays(fake()->numberBetween(0, 3)),
                    ];
                }
            }

            $current->addDay();
        }

        // Insert in chunks for performance
        foreach (array_chunk($bookings, 100) as $chunk) {
            DB::table('bookings')->insert($chunk);
        }

        $this->command->info('✅ BookingSeeder: Inserted ' . count($bookings) . ' sample bookings across ' . $facilities->count() . ' facilities for 90 days.');
    }
}
