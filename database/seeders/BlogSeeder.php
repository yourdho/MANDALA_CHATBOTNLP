<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        // First ensure categories exist if not already
        $categories = ['Pengumuman', 'Tips & Trik', 'Event', 'Promo'];
        foreach ($categories as $cat) {
            BlogCategory::firstOrCreate(['name' => $cat], ['slug' => Str::slug($cat)]);
        }

        $newsCat = BlogCategory::where('name', 'Pengumuman')->first();
        $tipsCat = BlogCategory::where('name', 'Tips & Trik')->first();

        $posts = [
            [
                'title' => 'Pembukaan Lapangan Padel Baru!',
                'slug' => Str::slug('Pembukaan Lapangan Padel Baru!'),
                'excerpt' => 'Mandala Arena dengan bangga mengumumkan lapangan Padel ke-4 kami resmi dibuka.',
                'content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lapangan Padel baru ini menggunakan standar World Padel Tour.',
                'thumbnail' => 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80',
                'blog_category_id' => $newsCat->id,
                'author' => 'Admin Mandala',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'Tips Main Mini Soccer di Malam Hari',
                'slug' => Str::slug('Tips Main Mini Soccer di Malam Hari'),
                'excerpt' => 'Tetap prima meski main malam. Simak tips pemanasan dan asupan berikut.',
                'content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bermain malam hari membutuhkan penyesuaian khusus pada sistem pernapasan dan mata.',
                'thumbnail' => 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80',
                'blog_category_id' => $tipsCat->id,
                'author' => 'Coach Budi',
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Update Sistem Booking mandalaarena.com',
                'slug' => Str::slug('Update Sistem Booking mandalaarena.com'),
                'excerpt' => 'Sekarang kamu bisa memilih add-on seperti bola atau rompi langsung saat pesan.',
                'content' => 'Kami mendengarkan masukan kalian! Fitur add-on telah diaktifkan untuk semua jenis lapangan.',
                'thumbnail' => 'https://images.unsplash.com/photo-1543326727-cf6c30211833?auto=format&fit=crop&q=80',
                'blog_category_id' => $newsCat->id,
                'author' => 'Tech Team',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
        ];

        foreach ($posts as $p) {
            BlogPost::updateOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
