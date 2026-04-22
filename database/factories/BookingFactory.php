<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Facility;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $startsAt = Carbon::now()->addDay()->setHour(10)->startOfHour();
        $endsAt   = $startsAt->copy()->addHours(2);

        return [
            'user_id'            => User::factory(),
            'facility_id'        => Facility::factory(),
            'guest_name'         => $this->faker->name(),
            'guest_email'        => $this->faker->safeEmail(),
            'guest_phone'        => '08' . $this->faker->numerify('#########'),
            'booking_token'      => (string) Str::uuid(),
            'starts_at'          => $startsAt,
            'ends_at'            => $endsAt,
            'duration_hours'     => 2,
            'total_price'        => 300000,
            'status'             => Booking::STATUS_PENDING,
            'payment_status'     => 'pending',
            'payment_method'     => 'transfer',
            'selected_addons'    => [],
            'addons_total_price' => 0,
        ];
    }

    /** Guest booking (tanpa user_id) */
    public function guest(): static
    {
        return $this->state(['user_id' => null]);
    }

    /** Booking yang sudah confirmed & paid */
    public function confirmed(): static
    {
        return $this->state([
            'status'         => Booking::STATUS_CONFIRMED,
            'payment_status' => 'paid',
            'paid_at'        => now(),
        ]);
    }

    /** Booking yang dibatalkan */
    public function cancelled(): static
    {
        return $this->state([
            'status'         => Booking::STATUS_CANCELLED,
            'payment_status' => 'failed',
        ]);
    }
}
