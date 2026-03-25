<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UpdateFacilitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $minsokImages = ['/images/facilities/minsok/m1.webp', '/images/facilities/minsok/m2.jpeg', '/images/facilities/minsok/m3.webp'];
        $padelImages = ['/images/facilities/padel/1.we are padel.jpg', '/images/facilities/padel/b1.webp', '/images/facilities/padel/b2.webp', '/images/facilities/padel/b3.webp', '/images/facilities/padel/b4.jpg', '/images/facilities/padel/b5.jpg', '/images/facilities/padel/b6.webp'];
        $basketImages = ['/images/facilities/basket/b1.jpg', '/images/facilities/basket/b2.jpg', '/images/facilities/basket/b3.jpg', '/images/facilities/basket/b4.jpg', '/images/facilities/basket/b5.jpg'];
        $pilatesImages = ['/images/facilities/pilates/l1.mp4', '/images/facilities/pilates/l2.mp4', '/images/facilities/pilates/l3.webp'];

        // Update Mini Soccer
        $minsok = \App\Models\Facility::where('name', 'like', '%Mini Soccer%')->first();
        if ($minsok) {
            $minsok->update(['images' => $minsokImages]);
        }

        // Update Badmiton (Basketball? Wait, user says basket aset, maybe I change Badminton to Basketball or just update a Basket court. Let me check if Basketball exists.)
        $basket = \App\Models\Facility::where('name', 'like', '%Basket%')->first();
        if ($basket) {
            $basket->update(['images' => $basketImages]);
        } else {
            // Rename Badminton to Basket if it exists, or create new
            $badminton = \App\Models\Facility::where('name', 'like', '%Badminton%')->first();
            if ($badminton) {
                $badminton->update(['name' => 'Basketball Court', 'description' => 'Fasilitas bola basket.', 'images' => $basketImages]);
            }
        }

        // Update Pilates
        $pilates = \App\Models\Facility::where('name', 'like', '%Pilates%')->first();
        if ($pilates) {
            $pilates->update(['images' => $pilatesImages]);
        }

        // Padel: update existing and duplicate
        $padel1 = \App\Models\Facility::where('name', 'like', '%Padel%')->first();
        if ($padel1) {
            $padel1->update(['name' => 'Padel Court 01', 'images' => $padelImages]);

            // Create second padel
            $padel2 = \App\Models\Facility::where('name', 'Padel Court 02')->first();
            if (!$padel2) {
                $newPadel = $padel1->replicate();
                $newPadel->name = 'Padel Court 02';
                $newPadel->save();
            }
        }
    }
}
