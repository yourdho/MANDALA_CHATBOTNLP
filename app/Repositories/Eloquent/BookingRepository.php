<?php

namespace App\Repositories\Eloquent;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;

class BookingRepository implements BookingRepositoryInterface
{
    public function getAll(): Collection
    {
        return Booking::all();
    }

    public function findById(int $id): ?Booking
    {
        return Booking::find($id);
    }

    public function create(array $data): Booking
    {
        return Booking::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $booking = Booking::find($id);
        if ($booking) {
            return $booking->update($data);
        }
        return false;
    }

    public function getConflictingBookings(int $venueId, string $date, string $startTime, string $endTime): Collection
    {
        return Booking::where('venue_id', $venueId)
            ->where('booking_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    // Check if new booking overlaps with existing booking
                    $q->where('start_time', '<', $endTime)
                        ->where('end_time', '>', $startTime);
                });
            })->get();
    }
}
