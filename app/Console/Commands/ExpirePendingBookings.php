<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Command;

class ExpirePendingBookings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expire pending bookings that are older than 15 minutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $expiredCount = Booking::where('status', Booking::STATUS_PENDING)
            ->where('payment_status', 'pending')
            ->where('created_at', '<', now()->subMinutes(15))
            ->update([
                'status' => Booking::STATUS_CANCELLED,
                'payment_status' => 'failed',
                'conflict_note' => 'Otomatis dibatalkan oleh sistem karena batas waktu pembayaran habis (15 menit).'
            ]);

        if ($expiredCount > 0) {
            $this->info("Successfully expired {$expiredCount} bookings.");
        } else {
            $this->info("No pending bookings found to expire.");
        }
    }
}
