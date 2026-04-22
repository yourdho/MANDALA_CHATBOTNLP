<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $bookingData;

    public function __construct(Booking $booking)
    {
        // Payload minimal — hanya field yang dibutuhkan UI untuk update status.
        // Tidak ada PII (email, phone, nama user) di payload broadcast.
        $this->bookingData = [
            'id'             => $booking->id,
            'booking_code'   => $booking->booking_code,
            'status'         => $booking->status,
            'payment_status' => $booking->payment_status,
            'updated_at'     => $booking->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Broadcast ke dua private channel:
     * 1. admin-bookings  → dashboard admin (semua update masuk ke sini)
     * 2. user-booking.{id} → channel per-booking agar user bersangkutan
     *    bisa menerima update status real-time (divalidasi di channels.php)
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-bookings'),
            new PrivateChannel('user-booking.' . $this->bookingData['id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BookingUpdated';
    }
}
