<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Event & Kompetisi',
            'Sparing & Mabar',
            'Update Lapangan',
            'Tips & Trik Olahraga',
            'Informasi Member',
        ];

        foreach ($categories as $cat) {
            BlogCategory::firstOrCreate(['slug' => Str::slug($cat)], ['name' => $cat]);
        }
    }
}
