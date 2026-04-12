<?php

use App\Http\Controllers\Web\ProfileController;
use App\Http\Controllers\Web\FacilityController;
use App\Http\Controllers\Web\BookingController;
use App\Http\Controllers\Web\ChatbotController;
use App\Http\Controllers\Web\MatchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Chatbot Real-Time Routes ─────────────────────────────────
Route::post('/chatbot/message', [ChatbotController::class, 'handleMessage'])->name('chatbot.message');

// ── Home & Facilities ────────────────────────────────────────
Route::get('/', [FacilityController::class, 'index'])->name('welcome');
Route::get('/facilities', [FacilityController::class, 'indexPublic'])->name('facilities.public');
Route::get('/facility/{facility}', [FacilityController::class, 'show'])->name('facility.show');

// ── Blog (Frontend) ──────────────────────────────────────────
Route::get('/blog', [\App\Http\Controllers\Web\BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [\App\Http\Controllers\Web\BlogController::class, 'show'])->name('blog.show');

// ── Payment & Callback ───────────────────────────────────────
Route::post('/payment/create/{booking_id}', [\App\Http\Controllers\Web\PaymentController::class, 'createTransaction'])->name('payment.create');
Route::post('/payment/callback', [BookingController::class, 'callback'])->name('payment.callback');

Route::get('/booking/success/{booking}', [BookingController::class, 'success'])->name('booking.success');
Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');

// ── Authenticated Routes ──────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard (Unified with simple role split)
    Route::get('/dashboard', function () {
        if (auth()->user()->role === 'admin') {
            return (new \App\Http\Controllers\Admin\AdminDashboardController())->index();
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

        $promos = \App\Models\Reward::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->where(function ($query) {
                $query->whereNull('quota')->orWhere('quota', '>', 0);
            })
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'facilities' => \App\Models\Facility::all(),
            'promos' => $promos,
        ]);
    })->name('dashboard');

    // Booking Process
    Route::get('/bookings', [BookingController::class, 'history'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

    // ── User Loyalty (Redeem) ───────────────────────────────────
    Route::get('/reward-market', [\App\Http\Controllers\Web\UserRewardController::class, 'index'])->name('user.rewards.index');
    Route::post('/reward-redeem', [\App\Http\Controllers\Web\UserRewardController::class, 'redeem'])->name('user.rewards.redeem');

    // ── Matchmaking (Cari Lawan) ─────────────────────────────────
    Route::get('/matchmaking', function () {
        $userId = auth()->id();

        // Iklan milik sendiri
        $myMatches = \App\Models\SportsMatch::where('user_id', $userId)
            ->latest()
            ->get();

        // Iklan user lain yang masih aktif (tanggal >= hari ini)
        $availableMatches = \App\Models\SportsMatch::where('user_id', '!=', $userId)
            ->where('date', '>=', now()->toDateString())
            ->with('user:id,name')
            ->latest()
            ->get();

        return Inertia::render('Matches/Index', [
            'my_matches' => $myMatches,
            'available_matches' => $availableMatches,
        ]);
    })->name('matchmaking.index');

    Route::post('/matchmaking', [MatchController::class, 'store'])->name('matchmaking.store');
    Route::get('/matchmaking/{match}/edit', [MatchController::class, 'edit'])->name('matchmaking.edit');
    Route::patch('/matchmaking/{match}', [MatchController::class, 'update'])->name('matchmaking.update');
    Route::delete('/matchmaking/{match}', [MatchController::class, 'destroy'])->name('matchmaking.destroy');


    // ── Admin Area ───────────────────────────────────────────
    Route::middleware('can:manage-system')->prefix('admin')->name('admin.')->group(function () {
        // Rewards Management (Admin)
        Route::get('rewards-manager', [\App\Http\Controllers\Admin\RewardController::class, 'index'])->name('rewards.index');
        Route::post('rewards-manager', [\App\Http\Controllers\Admin\RewardController::class, 'store'])->name('rewards.store');
        Route::post('rewards-manager/{id}', [\App\Http\Controllers\Admin\RewardController::class, 'update'])->name('rewards.update');
        Route::delete('rewards-manager/{id}', [\App\Http\Controllers\Admin\RewardController::class, 'destroy'])->name('rewards.destroy');

        // Facilities CRUD
        Route::get('/facilities', [FacilityController::class, 'adminIndex'])->name('facilities.index');
        Route::get('/facilities/create', [FacilityController::class, 'create'])->name('facilities.create');
        Route::post('/facilities', [FacilityController::class, 'store'])->name('facilities.store');
        Route::get('/facilities/{facility}/edit', [FacilityController::class, 'edit'])->name('facilities.edit');
        Route::patch('/facilities/{facility}', [FacilityController::class, 'update'])->name('facilities.update');
        Route::delete('/facilities/{facility}', [FacilityController::class, 'destroy'])->name('facilities.destroy');

        // Blog Management
        Route::get('/blog-categories', [\App\Http\Controllers\Admin\BlogCategoryController::class, 'index'])->name('blog_categories.index');
        Route::post('/blog-categories', [\App\Http\Controllers\Admin\BlogCategoryController::class, 'store'])->name('blog_categories.store');
        Route::patch('/blog-categories/{category}', [\App\Http\Controllers\Admin\BlogCategoryController::class, 'update'])->name('blog_categories.update');
        Route::delete('/blog-categories/{category}', [\App\Http\Controllers\Admin\BlogCategoryController::class, 'destroy'])->name('blog_categories.destroy');

        Route::get('/blog', [\App\Http\Controllers\Admin\BlogPostController::class, 'index'])->name('blog.index');
        Route::get('/blog/create', [\App\Http\Controllers\Admin\BlogPostController::class, 'create'])->name('blog.create');
        Route::post('/blog', [\App\Http\Controllers\Admin\BlogPostController::class, 'store'])->name('blog.store');
        Route::get('/blog/{blog}/edit', [\App\Http\Controllers\Admin\BlogPostController::class, 'edit'])->name('blog.edit');
        Route::patch('/blog/{blog}', [\App\Http\Controllers\Admin\BlogPostController::class, 'update'])->name('blog.update');
        Route::delete('/blog/{blog}', [\App\Http\Controllers\Admin\BlogPostController::class, 'destroy'])->name('blog.destroy');

        Route::get('/bookings', [BookingController::class, 'adminIndex'])->name('bookings.manage');
        Route::get('/bookings/availability', [BookingController::class, 'getAvailability'])->name('bookings.availability');
        Route::post('/bookings/manual', [BookingController::class, 'manualStore'])->name('bookings.manual_store');
        Route::patch('/bookings/{booking}/confirm', [BookingController::class, 'adminConfirm'])->name('bookings.confirm');
        Route::patch('/bookings/{booking}/reject', [BookingController::class, 'adminReject'])->name('bookings.reject');

        // Reports (Super Admin only check inside controller or middleware)
        Route::get('/reports', [BookingController::class, 'reports'])->name('reports.index');

        // Chatbot Management
        Route::get('/chatbot', [ChatbotController::class, 'adminIndex'])->name('chatbot.index');

        // Dynamic Pricing Schedule & Addons
        Route::get('/pricing', [\App\Http\Controllers\Admin\PricingController::class, 'index'])->name('pricing.index');
        Route::post('/pricing/schedules', [\App\Http\Controllers\Admin\PricingController::class, 'storeSchedule'])->name('pricing.schedules.store');
        Route::delete('/pricing/schedules/{id}', [\App\Http\Controllers\Admin\PricingController::class, 'destroySchedule'])->name('pricing.schedules.destroy');
        Route::post('/pricing/items', [\App\Http\Controllers\Admin\PricingController::class, 'storeItem'])->name('pricing.items.store');
        Route::delete('/pricing/items/{id}', [\App\Http\Controllers\Admin\PricingController::class, 'destroyItem'])->name('pricing.items.destroy');
        Route::post('/settings', [\App\Http\Controllers\Admin\PricingController::class, 'updateSettings'])->name('settings.update');

        // User Management
        Route::get('/users', [ProfileController::class, 'adminIndex'])->name('users.index');
        Route::post('/users', [ProfileController::class, 'store'])->name('users.store');
        Route::get('/users/{id}', [ProfileController::class, 'show'])->name('users.show');

        // Mitra Applications Management
        Route::get('/applications', [\App\Http\Controllers\Admin\ApplicationController::class, 'index'])->name('applications.index');
        Route::post('/applications/{application}/approve', [\App\Http\Controllers\Admin\ApplicationController::class, 'approve'])->name('applications.approve');
        Route::post('/applications/{application}/reject', [\App\Http\Controllers\Admin\ApplicationController::class, 'reject'])->name('applications.reject');
        Route::post('/applications/{application}/schedule', [\App\Http\Controllers\Admin\ApplicationController::class, 'schedule'])->name('applications.schedule');
    });

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
