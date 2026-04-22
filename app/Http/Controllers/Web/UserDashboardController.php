<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Facility;
use App\Models\Reward;
use Inertia\Inertia;

/**
 * UserDashboardController
 *
 * Menampilkan dashboard untuk user biasa (non-admin).
 * Admin diarahkan ke AdminDashboardController di route level.
 */
class UserDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $stats = [
            'total_bookings' => Booking::where('user_id', $user->id)->count(),
            'active_bookings' => Booking::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count(),
            'recent_missions' => Booking::with('facility')
                ->where('user_id', $user->id)
                ->latest()
                ->limit(5)
                ->get(),
        ];

        $promos = Reward::where('is_active', true)
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
            'stats'      => $stats,
            'facilities' => Facility::all(),
            'promos'     => $promos,
        ]);
    }
}
