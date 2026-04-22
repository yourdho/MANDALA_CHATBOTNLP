<?php

namespace Database\Factories;

use App\Models\Facility;
use Illuminate\Database\Eloquent\Factories\Factory;

class FacilityFactory extends Factory
{
    protected $model = Facility::class;

    public function definition(): array
    {
        $categories = ['Mini Soccer', 'Padel', 'Basket', 'Pilates'];

        return [
            'name'               => $this->faker->words(3, true) . ' Arena',
            'category'           => $this->faker->randomElement($categories),
            'description'        => $this->faker->sentence(),
            'price_per_hour'     => $this->faker->randomElement([150000, 200000, 250000, 300000]),
            'open_time'          => '08:00:00',
            'close_time'         => '22:00:00',
            'is_active'          => true,
            'images'             => [],
            'addons'             => [],
        ];
    }

    /** Facility yang tidak aktif */
    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    /** Mini Soccer spesifik */
    public function miniSoccer(): static
    {
        return $this->state([
            'name'           => 'Mini Soccer Arena ' . $this->faker->numerify('#'),
            'category'       => 'Mini Soccer',
            'price_per_hour' => 300000,
        ]);
    }
}
