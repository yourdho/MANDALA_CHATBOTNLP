<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\User;
use App\Models\Facility;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    /**
     * ROLE: Analytics Strategist Mandala Arena
     * PURPOSE: Provide high-velocity data insights for Mission Control (Admin)
     */
    public function index()
    {
        // 1. Core KPIs
        $totalRevenue = (float) Booking::where('payment_status', 'paid')->sum('total_price');
        $bookingsToday = Booking::whereDate('created_at', today())->count();
        $totalUsers = User::where('role', 'user')->count();
        $activeFacilities = Facility::where('is_active', true)->count();

        // 2. Revenue Trend (Last 6 Months)
        $revenueTrend = Booking::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->get()
            ->groupBy(fn($b) => $b->created_at->format('M'))
            ->map(function ($group, $month) {
                return [
                    'label' => $month,
                    'value' => (float) $group->sum('total_price')
                ];
            })
            ->values();

        // 3. Most Popular Sports (Categorized)
        $popularSports = Booking::select('facility_id', DB::raw('count(*) as count'))
            ->with('facility:id,name,category')
            ->groupBy('facility_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->facility->name ?? 'Facility',
                    'count' => $item->count,
                    'category' => $item->facility->category ?? 'General'
                ];
            });

        // 4. Peak Booking Hours (Busiest slots)
        $peakHours = Booking::select(DB::raw("strftime('%H:00', starts_at) as hour"), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(3)
            ->get();

        // 5. Recent Transaction Feed
        $recentBookings = Booking::with(['facility', 'user'])
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'revenue' => number_format($totalRevenue, 0, ',', '.'),
                'today_bookings' => $bookingsToday,
                'total_pilots' => $totalUsers,
                'active_venues' => $activeFacilities
            ],
            'charts' => [
                'revenue_trend' => $revenueTrend,
                'popular_sports' => $popularSports,
                'peak_hours' => $peakHours
            ],
            'recent_bookings' => $recentBookings
        ]);
    }
}
