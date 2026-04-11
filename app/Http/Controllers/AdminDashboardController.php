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

        // 2. Revenue Trend (Last 6 Months, sorted chronologically)
        $revenueTrend = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');
            $yearMonth = $date->format('Y-m');

            $revenue = (float) Booking::where('payment_status', 'paid')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_price');

            return [
                'label' => $monthName,
                'value' => $revenue
            ];
        });

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
        $driver = DB::connection()->getDriverName();
        $hourField = ($driver === 'sqlite')
            ? "strftime('%H:00', starts_at)"
            : "DATE_FORMAT(starts_at, '%H:00')";

        $peakHours = Booking::select(DB::raw($hourField . " as hour"), DB::raw('count(*) as count'))
            ->whereNotNull('starts_at')
            ->groupBy('hour')
            ->orderByDesc('count')
            ->limit(4)
            ->get();

        // 5. Recent Transaction Feed
        $recentBookings = Booking::with(['facility', 'user'])
            ->latest()
            ->limit(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => $totalRevenue,
                'bookings_today' => $bookingsToday,
                'total_users' => $totalUsers,
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
