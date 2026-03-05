<?php

namespace App\Http\Controllers;

use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MitraVenueController extends Controller
{
    public function index()
    {
        $venues = Venue::with('bookings')
            ->where('owner_id', Auth::id())
            ->get()
            ->map(function ($venue) {
                return [
                    'id' => $venue->id,
                    'name' => $venue->name,
                    'category' => $venue->category,
                    'address' => $venue->address,
                    'price_per_hour' => $venue->price_per_hour,
                    'status' => $venue->status,
                    'bookings_count' => $venue->bookings->count(),
                    'cover_image' => isset($venue->images[0]) ? '/storage/' . $venue->images[0] : null,
                ];
            });

        return Inertia::render('Mitra/Venues/Index', [
            'venues' => $venues,
        ]);
    }

    public function create()
    {
        return Inertia::render('Mitra/Venues/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'address' => 'required|string',
            'city' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'images' => 'nullable|array|max:6',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:3072',
        ], [
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.max' => 'Ukuran gambar maksimal 3MB.',
            'images.*.mimes' => 'Format gambar harus jpg, jpeg, png, atau webp.',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('venues', 'public');
            }
        }

        Venue::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'address' => $validated['address'],
            'city' => $validated['city'] ?? null,
            'description' => $validated['description'] ?? null,
            'price_per_hour' => $validated['price_per_hour'],
            'images' => $imagePaths ?: null,
            'owner_id' => Auth::id(),
            'status' => 'open',
        ]);

        return redirect()->route('mitra.venues.index')
            ->with('success', 'Venue berhasil ditambahkan!');
    }

    public function edit(Venue $venue)
    {
        if ($venue->owner_id !== Auth::id()) {
            abort(403);
        }

        $venue->image_urls = collect($venue->images ?? [])
            ->map(fn($path) => ['path' => $path, 'url' => '/storage/' . $path])
            ->values()
            ->toArray();

        return Inertia::render('Mitra/Venues/Edit', [
            'venue' => $venue,
        ]);
    }

    public function update(Request $request, Venue $venue)
    {
        if ($venue->owner_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'address' => 'required|string',
            'city' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'status' => 'required|in:open,closed,maintenance',
            'new_images' => 'nullable|array|max:6',
            'new_images.*' => 'image|mimes:jpg,jpeg,png,webp|max:3072',
            'removed_images' => 'nullable|array',
            'removed_images.*' => 'string',
        ]);

        // Remove deleted images
        $existingImages = $venue->images ?? [];
        $removedImages = $request->input('removed_images', []);
        foreach ($removedImages as $path) {
            Storage::disk('public')->delete($path);
            $existingImages = array_filter($existingImages, fn($p) => $p !== $path);
        }

        // Upload new images
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $file) {
                $existingImages[] = $file->store('venues', 'public');
            }
        }

        $venue->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'address' => $validated['address'],
            'city' => $validated['city'] ?? null,
            'description' => $validated['description'] ?? null,
            'price_per_hour' => $validated['price_per_hour'],
            'status' => $validated['status'],
            'images' => array_values($existingImages) ?: null,
        ]);

        return redirect()->route('mitra.venues.index')
            ->with('success', 'Venue berhasil diupdate!');
    }

    public function destroy(Venue $venue)
    {
        if ($venue->owner_id !== Auth::id()) {
            abort(403);
        }

        // Delete images from storage
        foreach ($venue->images ?? [] as $path) {
            Storage::disk('public')->delete($path);
        }

        $venue->delete();

        return redirect()->route('mitra.venues.index')
            ->with('success', 'Venue berhasil dihapus!');
    }

    public function bookings()
    {
        $bookings = \App\Models\Booking::with(['venue', 'user'])
            ->whereHas('venue', function ($q) {
                $q->where('owner_id', Auth::id());
            })
            ->orderByDesc('booking_date')
            ->get()
            ->map(function ($booking) {
                // Nomor telepon: user login pakai phone, guest pakai guest_phone
                $phone = $booking->user?->phone ?? $booking->guest_phone ?? null;
                $userName = $booking->user?->name ?? $booking->guest_name ?? 'Guest';

                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'user' => $userName,
                    'user_phone' => $phone,
                    'is_guest' => is_null($booking->user_id),
                    'venue' => $booking->venue->name,
                    'date' => $booking->booking_date->format('Y-m-d'),
                    'time' => substr($booking->start_time, 0, 5) . ' - ' . substr($booking->end_time, 0, 5),
                    'status' => $booking->status,
                    'price' => 'Rp ' . number_format($booking->total_price, 0, ',', '.'),
                    'price_raw' => (float) $booking->total_price,
                    'payment_status' => $booking->payment_status,
                    'payment_method' => $booking->payment_method,
                ];
            });

        return Inertia::render('Mitra/Bookings/Index', [
            'bookings' => $bookings,
        ]);
    }

    public function pendingCount()
    {
        $venueIds = Venue::where('owner_id', Auth::id())->pluck('id');

        $count = \App\Models\Booking::whereIn('venue_id', $venueIds)
            ->where('status', 'pending')
            ->count();

        $latestId = \App\Models\Booking::whereIn('venue_id', $venueIds)
            ->where('status', 'pending')
            ->max('id') ?? 0;

        return response()->json([
            'pending' => $count,
            'latest_id' => $latestId,
        ]);
    }
}
