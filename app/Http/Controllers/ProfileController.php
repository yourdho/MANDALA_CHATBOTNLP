<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Ambil 5 booking terakhir yang menghasilkan poin
        $pointHistory = \App\Models\Booking::with('venue')
            ->where('user_id', $user->id)
            ->where('points_earned', '>', 0)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'venue' => $b->venue->name ?? '-',
                'points' => $b->points_earned,
                'date' => $b->created_at->format('d M Y'),
                'booking_code' => $b->booking_code,
            ]);

        // Total booking user
        $totalBookings = \App\Models\Booking::where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'pointsData' => [
                'balance' => $user->points_balance,
                'value_rupiah' => $user->points_balance, // 1 poin = Rp 1
                'total_bookings' => $totalBookings,
                'history' => $pointHistory,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
