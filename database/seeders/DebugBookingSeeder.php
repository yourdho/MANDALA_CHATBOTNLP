<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Facility;

class DebugBookingSeeder extends Seeder
{
    public function run()
    {
        try {
            $facility = Facility::with('bookings')->find(1);
            
            if (!$facility) {
                $this->command->error("Facility with ID 1 not found.");
                return;
            }

            $this->command->info("Checking bookings for Facility 1...");
            foreach ($facility->bookings as $booking) {
                $this->command->info("Booking ID: {$booking->id}");
                $starts = $booking->starts_at ? $booking->starts_at->format('Y-m-d H:i') : 'NULL';
                $ends = $booking->ends_at ? $booking->ends_at->format('Y-m-d H:i') : 'NULL';
                $this->command->line("Starts At: {$starts} | Ends At: {$ends}");
            }
            $this->command->info("Done.");
        } catch (\Exception $e) {
            $this->command->error("Caught Error: " . $e->getMessage());
        }
    }
}
