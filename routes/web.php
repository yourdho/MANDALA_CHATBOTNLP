<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ChatbotController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Chatbot Real-Time Routes ─────────────────────────────────
Route::post('/chatbot/message', [ChatbotController::class, 'handleMessage'])->name('chatbot.message');

// ── Home & Facilities ────────────────────────────────────────
Route::get('/', [FacilityController::class, 'index'])->name('welcome');
Route::get('/facilities', [FacilityController::class, 'indexPublic'])->name('facilities.public');
Route::get('/facility/{facility}', [FacilityController::class, 'show'])->name('facility.show');

// ── Payment & Callback ───────────────────────────────────────
Route::post('/payment/create/{booking_id}', [\App\Http\Controllers\PaymentController::class, 'createTransaction'])->name('payment.create');
Route::post('/payment/callback', [\App\Http\Controllers\PaymentController::class, 'callbackHandler'])->name('payment.callback');

Route::get('/booking/success/{booking}', [BookingController::class, 'success'])->name('booking.success');

// ── Authenticated Routes ──────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (Unified with simple role split)
    Route::get('/dashboard', function () {
        if (auth()->user()->role === 'admin') {
            return (new \App\Http\Controllers\AdminDashboardController())->index();
        }

        // Standard User Tactical Recap
        $user = auth()->user();
        $stats = [
            'total_bookings' => \App\Models\Booking::where('user_id', $user->id)->count(),
            'active_bookings' => \App\Models\Booking::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count(),
            'recent_missions' => \App\Models\Booking::with('facility')
                ->where('user_id', $user->id)
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'facilities' => \App\Models\Facility::all()
        ]);
    })->name('dashboard');

    // Booking Process
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::get('/bookings', [BookingController::class, 'history'])->name('bookings.index');

    // ── User Loyalty (Redeem) ───────────────────────────────────
    Route::get('/reward-market', [\App\Http\Controllers\UserRewardController::class, 'index'])->name('user.rewards.index');
    Route::post('/reward-redeem', [\App\Http\Controllers\UserRewardController::class, 'redeem'])->name('user.rewards.redeem');


    // ── Admin Area ───────────────────────────────────────────
    Route::middleware('can:manage-system')->prefix('admin')->name('admin.')->group(function () {
        // Rewards Management (Admin)
        Route::get('rewards-manager', [\App\Http\Controllers\Admin\RewardController::class, 'index'])->name('rewards.index');
        Route::post('rewards-manager', [\App\Http\Controllers\Admin\RewardController::class, 'store'])->name('rewards.store');
        Route::patch('rewards-manager/{id}', [\App\Http\Controllers\Admin\RewardController::class, 'update'])->name('rewards.update');
        Route::delete('rewards-manager/{id}', [\App\Http\Controllers\Admin\RewardController::class, 'destroy'])->name('rewards.destroy');

        // Facilities CRUD
        Route::get('/facilities', [FacilityController::class, 'adminIndex'])->name('facilities.index');
        Route::get('/facilities/create', [FacilityController::class, 'create'])->name('facilities.create');
        Route::post('/facilities', [FacilityController::class, 'store'])->name('facilities.store');
        Route::get('/facilities/{facility}/edit', [FacilityController::class, 'edit'])->name('facilities.edit');
        Route::patch('/facilities/{facility}', [FacilityController::class, 'update'])->name('facilities.update');
        Route::delete('/facilities/{facility}', [FacilityController::class, 'destroy'])->name('facilities.destroy');

        // Booking Management
        Route::get('/bookings', [BookingController::class, 'adminIndex'])->name('bookings.index');
        Route::patch('/bookings/{booking}/confirm', [BookingController::class, 'adminConfirm'])->name('bookings.confirm');

        // Reports (Super Admin only check inside controller or middleware)
        Route::get('/reports', [BookingController::class, 'reports'])->name('reports.index');

        // Chatbot Management
        Route::get('/chatbot', [ChatbotController::class, 'adminIndex'])->name('chatbot.index');

        // User Management
        Route::get('/users', [ProfileController::class, 'adminIndex'])->name('users.index');
    });

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
