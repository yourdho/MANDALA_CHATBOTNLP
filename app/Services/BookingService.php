<?php

namespace App\Services;

use App\Repositories\BookingRepositoryInterface;
use App\Models\Booking;
use Exception;

class BookingService
{
    protected $bookingRepository;

    public function __construct(BookingRepositoryInterface $bookingRepository)
    {
        $this->bookingRepository = $bookingRepository;
    }

    public function createBooking(array $data): Booking
    {
        // Check for schedule conflicts
        $conflicts = $this->bookingRepository->getConflictingBookings(
            $data['venue_id'],
            $data['booking_date'],
            $data['start_time'],
            $data['end_time']
        );

        if ($conflicts->count() > 0) {
            throw new Exception('Jadwal bentrok dengan booking lain.');
        }

        // Calculate total hours or price logic here if needed, bypassing for now
        $data['status'] = 'pending';
        $data['payment_status'] = 'unpaid';

        return $this->bookingRepository->create($data);
    }

    // Add other methods like update, delete, getById...
}
