<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $bookingData;

    public function __construct(Booking $booking)
    {
        // Kirim hanya field minimal yang dibutuhkan UI admin.
        // JANGAN kirim PII (email, phone, guest_name) ke channel broadcast.
        $booking->loadMissing('facility');

        $this->bookingData = [
            'id'           => $booking->id,
            'booking_code' => $booking->booking_code,
            'facility'     => $booking->facility?->name,
            'category'     => $booking->facility?->category,
            'starts_at'    => $booking->starts_at?->toIso8601String(),
            'ends_at'      => $booking->ends_at?->toIso8601String(),
            'status'       => $booking->status,
            'total_price'  => $booking->total_price,
        ];
    }

    /**
     * Broadcast ke private channel admin-bookings.
     *
     * Hanya admin yang bisa subscribe (divalidasi di channels.php).
     * Tidak ada data booking yang bocor ke channel publik.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-bookings'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BookingCreated';
    }
}
