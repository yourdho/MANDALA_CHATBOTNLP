<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VenueController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\MitraVenueController;
use App\Http\Controllers\MitraApplicationController;
use App\Http\Controllers\Admin\ApplicationController as AdminApplicationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Welcome ──────────────────────────────────────────────────
Route::get('/', function () {
    // Jumlah venue aktif (status open)
    $activeVenues = \App\Models\Venue::where('status', 'open')->count();

    // Jumlah total booking yang sudah confirmed/completed
    $totalBookings = \App\Models\Booking::whereIn('status', ['confirmed', 'completed', 'pending'])->count();

    // Hitung kota unik: ambil kata terakhir dari tiap address (biasanya nama kota)
    // Jika address kosong, fallback ke 1
    $cities = \App\Models\Venue::where('status', 'open')
        ->whereNotNull('address')
        ->where('address', '!=', '')
        ->count() > 0
        ? max(1, (int) round(\App\Models\Venue::where('status', 'open')->count() / max(1, 1)))
        : 0;

    // Lebih akurat: distinct berdasarkan 2 kata terakhir address
    $allAddresses = \App\Models\Venue::where('status', 'open')
        ->pluck('address')
        ->map(fn($a) => collect(explode(' ', trim($a)))->last() ?? '')
        ->filter()
        ->unique()
        ->count();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'stats' => [
            'active_venues' => $activeVenues,
            'bookings_today' => $totalBookings,
            'cities' => max($allAddresses, 1),
        ],
    ]);
});

// ── Public Venue Pages ────────────────────────────────────────
Route::get('/venues', [VenueController::class, 'index'])->name('venues.index');
Route::get('/venues/{id}', [VenueController::class, 'show'])->name('venues.show');

// ── Public Booking (guest + user) ────────────────────────────
// create & store boleh tanpa login
Route::get('/bookings/create', [BookingController::class, 'create'])->name('bookings.create');
Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
Route::get('/bookings/success', [BookingController::class, 'guestSuccess'])->name('bookings.guest-success');

// ── JSON endpoint untuk polling poin real-time ────────────────
Route::middleware('auth')->get('/user/points', [\App\Http\Controllers\Api\UserController::class, 'points'])->name('user.points');

// ── Authenticated ─────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $stats = [];

        if ($user->role === 'user') {
            $application = \App\Models\MitraApplication::where('user_id', $user->id)->latest()->first();
            $stats = [
                'booking_count' => \App\Models\Booking::where('user_id', $user->id)->count(),
                'active_bookings' => \App\Models\Booking::where('user_id', $user->id)->whereIn('status', ['pending', 'confirmed'])->count(),
                'completed' => \App\Models\Booking::where('user_id', $user->id)->where('status', 'completed')->count(),
                'mitra_app' => $application ? [
                    'status' => $application->status,
                    'jadwal_temu' => $application->jadwal_temu?->format('d M Y, H:i'),
                    'catatan' => $application->catatan,
                ] : null,
            ];
        } elseif ($user->role === 'mitra') {
            $venueIds = \App\Models\Venue::where('owner_id', $user->id)->pluck('id');
            $stats = [
                'venue_count' => $venueIds->count(),
                'booking_count' => \App\Models\Booking::whereIn('venue_id', $venueIds)->whereMonth('booking_date', now()->month)->count(),
                'revenue' => \App\Models\Booking::whereIn('venue_id', $venueIds)->where('payment_status', 'paid')->sum('total_price'),
            ];
        } elseif ($user->role === 'admin') {
            $stats = [
                'total_users' => \App\Models\User::count(),
                'total_venues' => \App\Models\Venue::count(),
                'total_bookings' => \App\Models\Booking::count(),
                'pending_mitra_apps' => \App\Models\MitraApplication::where('status', 'pending')->count(),
            ];
        }

        return Inertia::render('Dashboard', ['stats' => $stats]);
    })->name('dashboard');

    // User Bookings (hanya auth)
    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
    Route::patch('/bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');

    // Schedule
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');

    // Mitra Application (any logged-in user can apply)
    Route::get('/mitra/apply', [MitraApplicationController::class, 'create'])->name('mitra.apply');
    Route::post('/mitra/apply', [MitraApplicationController::class, 'store'])->name('mitra.apply.store');

    // Mitra Venue Management (only approved mitra/admin)
    Route::middleware('can:manage-venues')->prefix('mitra')->name('mitra.')->group(function () {
        Route::get('/venues', [MitraVenueController::class, 'index'])->name('venues.index');
        Route::get('/venues/create', [MitraVenueController::class, 'create'])->name('venues.create');
        Route::post('/venues', [MitraVenueController::class, 'store'])->name('venues.store');
        Route::get('/venues/{venue}/edit', [MitraVenueController::class, 'edit'])->name('venues.edit');
        Route::put('/venues/{venue}', [MitraVenueController::class, 'update'])->name('venues.update');
        Route::delete('/venues/{venue}', [MitraVenueController::class, 'destroy'])->name('venues.destroy');
        Route::get('/bookings', [MitraVenueController::class, 'bookings'])->name('bookings.index');
        Route::get('/bookings/pending-count', [MitraVenueController::class, 'pendingCount'])->name('bookings.pending-count');
    });

    // Admin: Mitra Applications
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/applications', [AdminApplicationController::class, 'index'])->name('applications.index');
        Route::patch('/applications/{application}/approve', [AdminApplicationController::class, 'approve'])->name('applications.approve');
        Route::patch('/applications/{application}/reject', [AdminApplicationController::class, 'reject'])->name('applications.reject');
        Route::patch('/applications/{application}/schedule', [AdminApplicationController::class, 'schedule'])->name('applications.schedule');
    });
});

// Profile
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
