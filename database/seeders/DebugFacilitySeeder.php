<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Facility;
use App\Models\PriceSchedule;

class DebugFacilitySeeder extends Seeder
{
    public function run()
    {
        try {
            $facility = Facility::find(1);
            if (!$facility) {
                $this->command->error("Facility with ID 1 not found.");
                return;
            }

            $this->command->info("Facility found: " . $facility->name . " (Category: " . $facility->category . ")");

            if (!in_array($facility->category, ['Mini Soccer', 'Padel', 'Pilates', 'Basket'])) {
                $this->command->warn("Category '" . $facility->category . "' is not allowed in show method.");
            }

            $schedules = PriceSchedule::where('sport_type', $facility->category)->get();
            $this->command->info("Schedules count for category " . $facility->category . ": " . $schedules->count());

        } catch (\Exception $e) {
            $this->command->error("Error: " . $e->getMessage());
        }
    }
}
