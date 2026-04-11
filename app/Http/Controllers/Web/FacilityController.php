<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FacilityController extends Controller
{
    /**
     * Display the landing page with facilities.
     */
    public function index()
    {
        $promos = \App\Models\Reward::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->where(function ($query) {
                $query->whereNull('quota')->orWhere('quota', '>', 0);
            })
            ->latest()
            ->limit(6)
            ->get();

        $facilities = \App\Models\Facility::where('is_active', true)->latest()->limit(4)->get();
        $recentBlogs = \App\Models\BlogPost::published()->latest()->limit(3)->get();

        return Inertia::render('Welcome', [
            'promos' => $promos,
            'facilities' => $facilities,
            'featuredBlog' => $recentBlogs->first(),
            'recentBlogs' => $recentBlogs->slice(1)->values(),
        ]);
    }

    /**
     * Display the public facilities list page.
     */
    public function indexPublic(Request $request)
    {
        $query = Facility::where('is_active', true);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $facilities = $query->latest()->get()->map(function ($f) {
            $prices = \App\Models\PriceSchedule::where('sport_type', $f->category)->pluck('price');
            $f->min_price = $prices->min() ?: (float) $f->price_per_hour;
            $f->max_price = $prices->max() ?: (float) $f->price_per_hour;
            return $f;
        });

        return Inertia::render('Facilities/IndexPublic', [
            'facilities' => $facilities,
            'selectedCategory' => $request->category,
        ]);
    }

    /**
     * Display the specified facility detail.
     */
    private function generateSlotsForFacility($facility, $date)
    {
        $facility->load([
            'bookings' => function ($q) use ($date) {
                $q->where(function ($qq) use ($date) {
                    $qq->whereDate('starts_at', '<=', $date)
                        ->whereDate('ends_at', '>=', $date);
                })
                    ->whereIn('payment_status', ['paid', 'settlement', 'confirmed']);
            }
        ]);

        $bookedSlots = $facility->bookings->flatMap(function ($booking) use ($date) {
            $slots = [];
            $start = (int) $booking->starts_at->format('H');

            if ($booking->ends_at->format('Y-m-d') > $date) {
                $end = 24;
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
        $currentHour = (int) now()->format('H');
        $isToday = $date === now()->format('Y-m-d');

        for ($h = $openHour; $h < $closeHour; $h++) {
            $time = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            $isAvailable = !in_array($time, $bookedSlots);

            if ($isToday && $h <= $currentHour) {
                $isAvailable = false;
            }

            $jamString = $time . ':00';
            $slotPrice = $this->getPrice($facility->category, $jamString);

            $timeSlots[] = [
                'time' => $time,
                'available' => $isAvailable,
                'price' => $slotPrice > 0 ? (float) $slotPrice : (float) $facility->price_per_hour
            ];
        }

        return $timeSlots;
    }

    /**
     * Mendapatkan harga dinamis berdasarkan tipe olahraga dan jam.
     */
    private function getPrice($sport_type, $jam = null, $session_name = null): float
    {
        $query = \App\Models\PriceSchedule::where('sport_type', $sport_type);

        if (strtolower($sport_type) === 'pilates') {
            if ($session_name) {
                $schedule = (clone $query)->where('session_name', $session_name)->first();
                return $schedule ? (float) $schedule->price : 0;
            }
            return 0;
        }

        if ($jam) {
            $schedule = (clone $query)
                ->where('start_time', '<=', $jam)
                ->where('end_time', '>=', $jam)
                ->first();

            if ($schedule) {
                return (float) $schedule->price;
            }
        }

        if ($session_name) {
            $schedule = (clone $query)->where('session_name', $session_name)->first();
            if ($schedule) {
                return (float) $schedule->price;
            }
        }

        return 0;
    }

    public function show(Request $request, Facility $facility)
    {
        if (!in_array($facility->category, ['Mini Soccer', 'Padel', 'Pilates', 'Basket'])) {
            abort(404, 'Division Not Authorized');
        }

        $date = $request->query('date', today()->format('Y-m-d'));

        $timeSlots = $this->generateSlotsForFacility($facility, $date);

        $relatedRaw = Facility::where('category', $facility->category)->where('is_active', true)->get();
        $relatedFacilities = $relatedRaw->map(function ($f) use ($date) {
            return [
                'id' => $f->id,
                'name' => $f->name,
                'timeSlots' => $this->generateSlotsForFacility($f, $date),
            ];
        });

        return Inertia::render('Facilities/Show', [
            'facility' => $facility,
            'timeSlots' => $timeSlots,
            'relatedFacilities' => $relatedFacilities,
            'price_schedules' => \App\Models\PriceSchedule::where('sport_type', $facility->category)->get(),
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
        return Inertia::render('Admin/Facilities/Create', [
            'price_schedules' => [],
            'master_addons' => \App\Models\AdditionalItem::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:Mini Soccer,Padel,Pilates,Basket',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'nullable',
            'addons' => 'nullable|array',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_account_name' => 'nullable|string',
            'qris_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            $categoryDir = str_replace(' ', '_', strtolower($validated['category']));
            $storagePath = public_path('aset_foto/' . $categoryDir);

            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0777, true);
            }

            foreach ($request->file('images') as $image) {
                $filename = time() . '_' . str_replace(' ', '_', $image->getClientOriginalName());
                $image->move($storagePath, $filename);
                $imagePaths[] = asset('aset_foto/' . $categoryDir . '/' . $filename);
            }
        }

        // Handle Facility Specific QRIS
        if ($request->hasFile('qris_image')) {
            $qrisCategoryDir = 'qris_' . str_replace(' ', '_', strtolower($validated['category']));
            $qrisStoragePath = public_path('aset_foto/' . $qrisCategoryDir);

            if (!file_exists($qrisStoragePath)) {
                mkdir($qrisStoragePath, 0777, true);
            }

            $qrisFile = $request->file('qris_image');
            $qrisName = 'qris_' . time() . '.' . $qrisFile->getClientOriginalExtension();
            $qrisFile->move($qrisStoragePath, $qrisName);
            $validated['qris_image_url'] = asset('aset_foto/' . $qrisCategoryDir . '/' . $qrisName);
        }

        $validated['images'] = $imagePaths;
        $validated['is_active'] = $request->boolean('is_active');
        $validated['addons'] = $request->input('addons', []);

        $facility = Facility::create($validated);

        // Auto-sync addons for Padel category to other Padel courts
        if ($validated['category'] === 'Padel') {
            Facility::where('category', 'Padel')
                ->where('id', '!=', $facility->id)
                ->get()
                ->each(fn($f) => $f->update(['addons' => $validated['addons']]));
        }

        // Update/Create Price Schedules for this category
        if ($request->has('price_schedules')) {
            foreach ($request->input('price_schedules') as $ps) {
                \App\Models\PriceSchedule::updateOrCreate(
                    [
                        'sport_type' => $validated['category'],
                        'session_name' => $ps['session_name'],
                        'start_time' => $ps['start_time'],
                        'end_time' => $ps['end_time'],
                    ],
                    [
                        'price' => $ps['price'],
                    ]
                );
            }
        }

        return redirect()->route('admin.facilities.index')->with('success', 'Fasilitas & Jadwal Harga berhasil ditambahkan!');
    }

    public function edit(Facility $facility)
    {
        return Inertia::render('Admin/Facilities/Edit', [
            'facility' => $facility,
            'price_schedules' => \App\Models\PriceSchedule::where('sport_type', $facility->category)->get(),
            'master_addons' => \App\Models\AdditionalItem::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Facility $facility)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:Mini Soccer,Padel,Pilates,Basket',
            'description' => 'nullable|string',
            'price_per_hour' => 'required|numeric|min:0',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'existing_images' => 'nullable|array',
            'images' => 'nullable|array',
            'is_active' => 'nullable',
            'addons' => 'nullable|array',
            'bank_name' => 'nullable|string',
            'bank_account_number' => 'nullable|string',
            'bank_account_name' => 'nullable|string',
            'qris_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imagePaths = $request->input('existing_images', []);

        if ($request->hasFile('images')) {
            $categoryDir = str_replace(' ', '_', strtolower($validated['category']));
            $storagePath = public_path('aset_foto/' . $categoryDir);

            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0777, true);
            }

            foreach ($request->file('images') as $image) {
                $filename = time() . '_' . str_replace(' ', '_', $image->getClientOriginalName());
                $image->move($storagePath, $filename);
                $imagePaths[] = asset('aset_foto/' . $categoryDir . '/' . $filename);
            }
        }

        // Handle Facility Specific QRIS
        if ($request->hasFile('qris_image')) {
            $qrisCategoryDir = 'qris_' . str_replace(' ', '_', strtolower($validated['category']));
            $qrisStoragePath = public_path('aset_foto/' . $qrisCategoryDir);

            if (!file_exists($qrisStoragePath)) {
                mkdir($qrisStoragePath, 0777, true);
            }

            $qrisFile = $request->file('qris_image');
            $qrisName = 'qris_' . time() . '.' . $qrisFile->getClientOriginalExtension();
            $qrisFile->move($qrisStoragePath, $qrisName);
            $validated['qris_image_url'] = asset('aset_foto/' . $qrisCategoryDir . '/' . $qrisName);
        } else {
            $validated['qris_image_url'] = $facility->qris_image_url;
        }

        $validated['images'] = $imagePaths;
        $validated['is_active'] = $request->boolean('is_active');
        $validated['addons'] = $request->input('addons', []);

        $facility->update($validated);

        // Auto-sync addons for Padel category to other Padel courts
        if ($validated['category'] === 'Padel') {
            Facility::where('category', 'Padel')
                ->where('id', '!=', $facility->id)
                ->get()
                ->each(fn($f) => $f->update(['addons' => $validated['addons']]));
        }

        // Update Price Schedules for this category
        if ($request->has('price_schedules')) {
            $incomingIds = collect($request->input('price_schedules'))->pluck('id')->filter()->toArray();

            // Delete schedules that are no longer in the request for this category
            \App\Models\PriceSchedule::where('sport_type', $validated['category'])
                ->whereNotIn('id', $incomingIds)
                ->delete();

            foreach ($request->input('price_schedules') as $ps) {
                if (isset($ps['id'])) {
                    \App\Models\PriceSchedule::where('id', $ps['id'])->update([
                        'session_name' => $ps['session_name'],
                        'start_time' => $ps['start_time'],
                        'end_time' => $ps['end_time'],
                        'price' => $ps['price'],
                        'sport_type' => $validated['category']
                    ]);
                } else {
                    \App\Models\PriceSchedule::create([
                        'sport_type' => $validated['category'],
                        'session_name' => $ps['session_name'],
                        'start_time' => $ps['start_time'],
                        'end_time' => $ps['end_time'],
                        'price' => $ps['price'],
                    ]);
                }
            }
        }

        return redirect()->route('admin.facilities.index')->with('success', 'Fasilitas & Jadwal Harga berhasil diperbarui!');
    }

    public function destroy(Facility $facility)
    {
        $facility->delete();
        return redirect()->route('admin.facilities.index')->with('success', 'Fasilitas berhasil dihapus!');
    }
}
