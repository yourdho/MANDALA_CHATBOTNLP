<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('venue')
            ->where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('booking_date', '>=', now()->startOfWeek())
            ->where('booking_date', '<=', now()->endOfWeek())
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($booking) {
                $dayMap = ['Mon' => 'Sen', 'Tue' => 'Sel', 'Wed' => 'Rab', 'Thu' => 'Kam', 'Fri' => 'Jum', 'Sat' => 'Sab', 'Sun' => 'Min'];
                $dayEn = $booking->booking_date->format('D');
                return [
                    'id' => $booking->id,
                    'venue' => $booking->venue->name,
                    'category' => $booking->venue->category ?? '',
                    'date' => $booking->booking_date->format('Y-m-d'),
                    'day' => $dayMap[$dayEn] ?? $dayEn,
                    'day_num' => $booking->booking_date->format('d'),
                    'start_time' => substr($booking->start_time, 0, 5),
                    'end_time' => substr($booking->end_time, 0, 5),
                    'status' => $booking->status,
                    'location' => $booking->venue->address,
                ];
            });

        $upcoming = Booking::with('venue')
            ->where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('booking_date', '>=', today())
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->limit(5)
            ->get()
            ->map(function ($booking) {
                $dayMap = ['Mon' => 'SEN', 'Tue' => 'SEL', 'Wed' => 'RAB', 'Thu' => 'KAM', 'Fri' => 'JUM', 'Sat' => 'SAB', 'Sun' => 'MIN'];
                $dayEn = $booking->booking_date->format('D');
                return [
                    'id' => $booking->id,
                    'venue' => $booking->venue->name,
                    'day_label' => $dayMap[$dayEn] ?? $dayEn,
                    'day_num' => $booking->booking_date->format('d'),
                    'time' => substr($booking->start_time, 0, 5) . ' - ' . substr($booking->end_time, 0, 5),
                    'location' => $booking->venue->address,
                    'status' => $booking->status,
                ];
            });

        $weekStart = now()->startOfWeek()->format('d M');
        $weekEnd = now()->endOfWeek()->format('d M Y');

        return Inertia::render('Schedule/Index', [
            'bookings' => $bookings,
            'upcoming' => $upcoming,
            'weekLabel' => $weekStart . ' - ' . $weekEnd,
        ]);
    }
}
