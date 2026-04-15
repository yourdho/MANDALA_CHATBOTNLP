<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Facility;

class BasketFacilitySeeder extends Seeder
{
    public function run()
    {
        $basket = Facility::where('name', 'like', '%Basket%')->first();
        $images = [
            '/images/facilities/basket/b1.jpg', 
            '/images/facilities/basket/b2.jpg', 
            '/images/facilities/basket/b3.jpg', 
            '/images/facilities/basket/b4.jpg', 
            '/images/facilities/basket/b5.jpg'
        ];

        if (!$basket) {
            Facility::create([
                'name' => 'Mandala Basket Hall',
                'category' => 'Basket',
                'description' => 'Full-size indoor basketball court with premium hardwood flooring and spectator seating.',
                'price_per_hour' => 450000,
                'open_time' => '06:00',
                'close_time' => '23:00',
                'images' => $images,
            ]);
            $this->command->info("Basket Facility Created Successfully.");
        } else {
            $basket->update(['images' => $images]);
            $this->command->info("Basket Facility Already Exists. Images updated.");
        }
    }
}
