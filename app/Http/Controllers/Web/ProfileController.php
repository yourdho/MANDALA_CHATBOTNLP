<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

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
        $pointHistory = \App\Models\Booking::with('facility')
            ->where('user_id', $user->id)
            ->where('payment_status', 'paid')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'facility' => $b->facility->name ?? '-',
                'points' => 0, // Placeholder for points logic if needed
                'date' => $b->created_at->format('d M Y'),
                'booking_code' => "MA-{$b->id}",
            ]);

        // Total booking user
        $totalBookings = \App\Models\Booking::where('user_id', $user->id)
            ->whereIn('status', ['confirmed', 'completed'])
            ->count();

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'pointsData' => [
                'balance' => $user->points_balance ?? 0,
                'total_bookings' => $totalBookings,
                'history' => $pointHistory,
            ],
        ]);
    }

    /**
     * Admin: User Management Index
     */
    public function adminIndex()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => \App\Models\User::latest()->get(),
        ]);
    }

    /**
     * Admin: Manual User Creation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:admin,user',
            'password' => 'required|string|min:8',
        ]);

        $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        \App\Models\User::create($validated);

        return redirect()->back()->with('success', 'User manual berhasil dibuat!');
    }

    /**
     * Admin: Get User Details with History
     */
    public function show($id)
    {
        $user = \App\Models\User::findOrFail($id);

        $bookings = \App\Models\Booking::with('facility')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'user' => $user,
            'bookings' => $bookings,
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
