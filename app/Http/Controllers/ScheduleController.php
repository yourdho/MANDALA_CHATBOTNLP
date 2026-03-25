<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get deployments for the current week
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();

        $bookings = Booking::with('facility')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('starts_at', [$startOfWeek, $endOfWeek])
            ->orderBy('starts_at')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'facility_name' => $booking->facility->name,
                    'date' => $booking->starts_at->format('Y-m-d'),
                    'day' => $booking->starts_at->format('D'),
                    'day_num' => $booking->starts_at->format('d'),
                    'start_time' => $booking->starts_at->format('H:i'),
                    'end_time' => $booking->ends_at->format('H:i'),
                    'status' => $booking->status,
                ];
            });

        // Get upcoming deployment
        $upcoming = Booking::with('facility')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->first();

        $upcomingData = null;
        if ($upcoming) {
            $upcomingData = [
                'id' => $upcoming->id,
                'facility_name' => $upcoming->facility->name,
                'day_label' => strtoupper($upcoming->starts_at->format('D')),
                'day_num' => $upcoming->starts_at->format('d'),
                'time' => $upcoming->starts_at->format('H:i') . ' - ' . $upcoming->ends_at->format('H:i'),
                'status' => $upcoming->status,
            ];
        }

        return Inertia::render('Schedule/Index', [
            'bookings' => $bookings,
            'upcoming' => $upcomingData,
            'weekLabel' => $startOfWeek->format('d M') . ' - ' . $endOfWeek->format('d M Y'),
        ]);
    }
}
