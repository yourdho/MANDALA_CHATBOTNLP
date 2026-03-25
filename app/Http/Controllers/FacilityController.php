<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacilityController extends Controller
{
    /**
     * Display the landing page with facilities.
     */
    public function index()
    {
        return Inertia::render('Welcome');
    }

    /**
     * Display the public facilities list page.
     */
    public function indexPublic()
    {
        return Inertia::render('Facilities/IndexPublic', [
            'facilities' => Facility::all(),
        ]);
    }

    /**
     * Display the specified facility detail.
     */
    public function show(Request $request, Facility $facility)
    {
        // Tactical Domain Guard: Only allow core divisions
        if (!in_array($facility->category, ['Mini Soccer', 'Padel', 'Badminton', 'Pilates'])) {
            abort(404, 'Division Not Authorized');
        }

        $date = $request->query('date', today()->format('Y-m-d'));

        $facility->load([
            'bookings' => function ($q) use ($date) {
                $q->whereDate('starts_at', $date)
                    ->whereIn('status', ['pending', 'confirmed']);
            }
        ]);

        // Build busy slots 00:00 – 23:00
        $bookedSlots = $facility->bookings->flatMap(function ($booking) use ($date) {
            $slots = [];
            $start = (int) $booking->starts_at->format('H');

            // Check if booking ends on a different day
            if ($booking->ends_at->format('Y-m-d') > $date) {
                $end = 24; // If it's the next day, it's busy until midnight of the current day
            } else {
                $end = (int) $booking->ends_at->format('H');
            }

            for ($h = $start; $h < $end; $h++) {
                $slots[] = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            }
            return $slots;
        })->toArray();

        $openHour = $facility->open_time ? (int) substr($facility->open_time, 0, 2) : 8;
        $closeHour = $facility->close_time ? (int) substr($facility->close_time, 0, 2) : 22;

        $timeSlots = [];
        for ($h = $openHour; $h < $closeHour; $h++) {
            $time = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            $timeSlots[] = [
                'time' => $time,
                'available' => !in_array($time, $bookedSlots)
            ];
        }

        return Inertia::render('Facilities/Show', [
            'facility' => $facility,
            'timeSlots' => $timeSlots,
            'user_vouchers' => auth()->check()
                ? \App\Models\UserReward::where('user_id', auth()->id())
                    ->where('status', 'unused')
                    ->with('reward')
                    ->get()
                : []
        ]);
    }

    /** ── Admin Methods ── */

    public function adminIndex()
    {
        return Inertia::render('Admin/Facilities/Index', [
            'facilities' => Facility::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Facilities/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:Mini Soccer,Padel,Badminton,Pilates',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'images' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        Facility::create($validated);
        return redirect()->route('admin.facilities.index')->with('success', 'Fasilitas berhasil dibuat!');
    }

    public function edit(Facility $facility)
    {
        return Inertia::render('Admin/Facilities/Edit', ['facility' => $facility]);
    }

    public function update(Request $request, Facility $facility)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:Mini Soccer,Padel,Badminton,Pilates',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'images' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $facility->update($validated);
        return redirect()->route('admin.facilities.index')->with('success', 'Fasilitas berhasil diperbarui!');
    }

    public function destroy(Facility $facility)
    {
        $facility->delete();
        return redirect()->route('admin.facilities.index')->with('success', 'Fasilitas berhasil dihapus!');
    }
}
