<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VenueController extends Controller
{
    public function index(Request $request)
    {
        $query = Venue::with(['owner', 'reviews'])->where('status', 'open');

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $nonJamCategories = ['Barbershop'];

        $venues = $query->get()->map(function ($venue) use ($nonJamCategories) {
            $isNonJam = in_array($venue->category, $nonJamCategories);
            return [
                'id' => $venue->id,
                'name' => $venue->name,
                'category' => $venue->category,
                'status' => 'Slot Tersedia',
                'description' => $venue->description ?? 'Venue terbaik di kotamu.',
                'price' => 'Rp ' . number_format($venue->price_per_hour, 0, ',', '.') . ($isNonJam ? '' : ' / Jam'),
                'price_raw' => $venue->price_per_hour,
                'location' => $venue->address,
                'cover_image' => isset($venue->images[0]) ? '/storage/' . $venue->images[0] : null,
                'rating' => $venue->averageRating(),
                'reviews_count' => $venue->reviews->count(),
            ];
        });

        // Distinct categories from DB
        $categories = Venue::where('status', 'open')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        return Inertia::render('Venues/Index', [
            'venues' => $venues,
            'categories' => $categories,
            'selectedCategory' => $request->category ?? 'all',
        ]);
    }

    public function show($id)
    {
        $venue = Venue::with([
            'owner',
            'reviews.user',
            'bookings' => function ($q) {
                $q->where('booking_date', today())
                    ->whereIn('status', ['pending', 'confirmed']);
            }
        ])->findOrFail($id);

        // Build time slots 07:00 – 22:00
        $bookedSlots = $venue->bookings->flatMap(function ($booking) {
            $slots = [];
            $start = (int) substr($booking->start_time, 0, 2);
            $end = (int) substr($booking->end_time, 0, 2);
            for ($h = $start; $h < $end; $h++) {
                $slots[] = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            }
            return $slots;
        })->toArray();

        $timeSlots = [];
        for ($h = 7; $h <= 22; $h++) {
            $time = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            $timeSlots[] = ['time' => $time, 'available' => !in_array($time, $bookedSlots)];
        }

        // Build image URLs
        $images = collect($venue->images ?? [])->map(fn($path) => '/storage/' . $path)->values()->toArray();

        $nonJamCategories = ['Barbershop'];
        $isNonJam = in_array($venue->category, $nonJamCategories);

        $venueData = [
            'id' => $venue->id,
            'name' => $venue->name,
            'category' => $venue->category,
            'description' => $venue->description ?? '',
            'price' => 'Rp ' . number_format($venue->price_per_hour, 0, ',', '.') . ($isNonJam ? '' : ' / Jam'),
            'price_raw' => $venue->price_per_hour,
            'address' => $venue->address,
            'rating' => $venue->averageRating(),
            'reviews_count' => $venue->reviews->count(),
            'owner' => $venue->owner->name,
            'status' => $venue->status,
            'images' => $images,
            'reviews' => $venue->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user' => $review->user->name,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->diffForHumans(),
                ];
            }),
        ];

        return Inertia::render('Venues/Show', [
            'venue' => $venueData,
            'timeSlots' => $timeSlots,
        ]);
    }
}
