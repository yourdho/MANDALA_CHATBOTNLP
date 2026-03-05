<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Venue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Notification;
use App\Notifications\BookingCreatedNotification;
use App\Notifications\BookingConfirmedNotification;
use App\Mail\BookingInvoiceMail;
use Illuminate\Support\Facades\Mail;

class BookingController extends Controller
{
    // ────────────────────────────────────────────────────────────
    //  index — riwayat booking (hanya untuk user login)
    // ────────────────────────────────────────────────────────────
    public function index()
    {
        /** @var \Illuminate\Database\Eloquent\Collection<int, Booking> $rows */
        $rows = Booking::with('venue')
            ->where('user_id', Auth::id())
            ->orderByDesc('booking_date')
            ->get();

        $bookings = $rows->map(fn(Booking $b) => $this->formatBooking($b));

        $stats = [
            'total' => $bookings->count(),
            'active' => $bookings->where('status', 'confirmed')->count(),
            'pending' => $bookings->where('status', 'pending')->count(),
        ];

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings->values(),
            'stats' => $stats,
        ]);
    }

    // ────────────────────────────────────────────────────────────
    //  create — form booking (bisa diakses guest maupun user)
    // ────────────────────────────────────────────────────────────
    public function create(Request $request)
    {
        $venue = Venue::findOrFail($request->venue_id);
        $user = Auth::user();

        return Inertia::render('Bookings/Create', [
            'venue' => [
                'id' => $venue->id,
                'name' => $venue->name,
                'category' => $venue->category,
                'price_per_hour' => $venue->price_per_hour,
                'address' => $venue->address,
                'images' => collect($venue->images ?? [])->map(fn($p) => '/storage/' . $p)->values(),
            ],
            'date' => $request->date ?? today()->format('Y-m-d'),
            'auth_user' => $user ? [
                'name' => $user->name,
                'phone' => $user->phone ?? '',
                'points_balance' => $user->points_balance,
                'points_value' => $user->pointsValueInRupiah(),
            ] : null,
            // Diskon khusus untuk guest yang ingin daftar
            'register_incentive' => '5%',
        ]);
    }

    // ────────────────────────────────────────────────────────────
    //  store — simpan booking (guest atau user login)
    // ────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user = Auth::user();

        // ── Validasi dinamis berdasarkan jenis pengguna ──────────
        $rules = [
            'venue_id' => 'required|exists:venues,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'payment_method' => 'required|in:transfer_bank,qris,bayar_ditempat',
            'use_points' => 'boolean',
        ];

        if (!$user) {
            // Guest wajib isi nama & nomor telepon
            $rules['guest_name'] = 'required|string|max:100';
            $rules['guest_phone'] = 'required|string|max:20|regex:/^[0-9+\-\s]{8,20}$/';
        }

        $validated = $request->validate($rules, [
            'guest_name.required' => 'Nama wajib diisi.',
            'guest_phone.required' => 'Nomor telepon wajib diisi.',
            'guest_phone.regex' => 'Format nomor telepon tidak valid.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
        ]);

        $venue = Venue::findOrFail($validated['venue_id']);

        // ── Cek konflik jadwal ───────────────────────────────────
        $conflicts = Booking::where('venue_id', $validated['venue_id'])
            ->where('booking_date', $validated['booking_date'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($validated) {
                $q->where('start_time', '<', $validated['end_time'] . ':00')
                    ->where('end_time', '>', $validated['start_time'] . ':00');
            })->exists();

        if ($conflicts) {
            return back()->withErrors(['start_time' => 'Jadwal bentrok dengan booking lain pada tanggal tersebut.']);
        }

        // ── Hitung harga ─────────────────────────────────────────
        $startHour = (int) substr($validated['start_time'], 0, 2);
        $endHour = (int) substr($validated['end_time'], 0, 2);
        $hours = $endHour - $startHour;
        $totalPrice = $hours * $venue->price_per_hour;

        // ── Pakai poin (hanya user login) ────────────────────────
        $pointsUsed = 0;
        $pointsEarned = 0;
        $discount = 0;

        if ($user && $request->boolean('use_points') && $user->points_balance > 0) {
            // Maksimum diskon = 10% dari total harga
            $maxDiscount = (int) round($totalPrice * 0.10);
            $discount = min($user->points_balance, $maxDiscount);
            $pointsUsed = $discount; // 1 poin = Rp 1
            $totalPrice = max(0, $totalPrice - $discount);
        }

        // ── Hitung poin yang diperoleh (hanya untuk user login) ──
        if ($user) {
            $pointsEarned = Booking::calculatePoints($totalPrice);
        }

        // ── Generate kode booking ────────────────────────────────
        $bookingCode = 'JNJ-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        // ── Simpan booking ───────────────────────────────────────
        $booking = Booking::create([
            'booking_code' => $bookingCode,
            'user_id' => $user?->id,         // null jika guest
            'guest_name' => $user ? null : $validated['guest_name'],
            'guest_phone' => $user ? null : $validated['guest_phone'],
            'venue_id' => $validated['venue_id'],
            'booking_date' => $validated['booking_date'],
            'start_time' => $validated['start_time'] . ':00',
            'end_time' => $validated['end_time'] . ':00',
            'status' => 'pending',
            'total_price' => $totalPrice,
            'points_earned' => $pointsEarned,
            'payment_status' => 'unpaid',
            'payment_method' => $validated['payment_method'],
        ]);

        // ── Notify Mitra (Owner Venue) via email & WA ────────────
        if ($venue->owner) {
            $venue->owner->notify(new BookingCreatedNotification($booking));
        }

        // ── Award / deduct poin untuk user login ─────────────────
        if ($user) {
            if ($pointsUsed > 0) {
                $user->usePoints($pointsUsed);
            }
            if ($pointsEarned > 0) {
                $user->addPoints($pointsEarned);
            }
        }

        // ── Redirect sesuai tipe pengguna ────────────────────────
        if ($user) {
            return redirect()
                ->route('bookings.index')
                ->with('success', sprintf(
                    'Booking berhasil! Kode: %s. Anda mendapatkan +%d poin.%s',
                    $bookingCode,
                    $pointsEarned,
                    $discount > 0 ? ' Diskon poin Rp ' . number_format($discount, 0, ',', '.') . ' berhasil digunakan.' : ''
                ));
        }

        // Guest → redirect ke halaman konfirmasi publik
        return redirect()
            ->route('bookings.guest-success', ['code' => $bookingCode])
            ->with('success', 'Booking berhasil! Kode booking Anda: ' . $bookingCode);
    }

    // ────────────────────────────────────────────────────────────
    //  guestSuccess — halaman konfirmasi untuk guest
    // ────────────────────────────────────────────────────────────
    public function guestSuccess(Request $request)
    {
        $code = $request->query('code');
        $booking = null;

        if ($code) {
            /** @var Booking|null $booking */
            $booking = Booking::with('venue')
                ->where('booking_code', $code)
                ->whereNull('user_id')   // pastikan ini booking guest
                ->first();
        }

        if (!$booking) {
            return redirect()->route('venues.index')
                ->with('error', 'Kode booking tidak ditemukan.');
        }

        /** @var \Carbon\Carbon $bookingDate */
        $bookingDate = $booking->booking_date;

        return Inertia::render('Bookings/GuestSuccess', [
            'booking' => [
                'booking_code' => $booking->booking_code,
                'venue' => $booking->venue->name,
                'address' => $booking->venue->address,
                'date' => $bookingDate->format('Y-m-d'),
                'start_time' => substr((string) $booking->start_time, 0, 5),
                'end_time' => substr((string) $booking->end_time, 0, 5),
                'total_price' => (float) $booking->total_price,
                'payment_method' => $booking->payment_method,
                'guest_name' => $booking->guest_name,
                'guest_phone' => $booking->guest_phone,
                'status' => $booking->status,
                'created_at' => $booking->created_at->format('d M Y, H:i'),
            ],
        ]);
    }

    // ────────────────────────────────────────────────────────────
    //  cancel — hanya user login yang bisa cancel lewat dashboard
    // ────────────────────────────────────────────────────────────
    public function cancel(Booking $booking)
    {
        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return back()->withErrors(['status' => 'Booking tidak bisa dibatalkan.']);
        }

        // Kembalikan poin yang earned jika dibatalkan
        if ($booking->points_earned > 0 && Auth::user()) {
            Auth::user()->decrement('points_balance', $booking->points_earned);
        }

        $booking->update(['status' => 'cancelled']);

        return redirect()->route('bookings.index')
            ->with('success', 'Booking berhasil dibatalkan.');
    }

    // ────────────────────────────────────────────────────────────
    //  confirm — konfirmasi oleh mitra/admin
    // ────────────────────────────────────────────────────────────
    public function confirm(Booking $booking)
    {
        $user = Auth::user();

        if ($user->role !== 'admin' && $booking->venue->owner_id !== $user->id) {
            abort(403);
        }

        $booking->update(['status' => 'confirmed', 'payment_status' => 'paid']);

        // ── Send Notification to User/Guest ──────────────────────
        // Notification channel ini akan mengirim ke email dan/atau WA
        if ($booking->user_id) {
            $booking->user->notify(new BookingConfirmedNotification($booking));

            // Kirim Invoice via Email
            if ($booking->user->email) {
                Mail::to($booking->user->email)->queue(new BookingInvoiceMail($booking));
            }
        } elseif ($booking->guest_phone) {
            // Untuk guest, route notifikasi secara dinamis (hanya WA karena tidak ada data email)
            Notification::route('WhatsApp', $booking->guest_phone)
                ->notify(new BookingConfirmedNotification($booking));
        }

        return back()->with('success', 'Booking dikonfirmasi.');
    }

    // ────────────────────────────────────────────────────────────
    //  Private helpers
    // ────────────────────────────────────────────────────────────
    private function formatBooking(Booking $booking): array
    {
        /** @var \Carbon\Carbon $bookingDate */
        $bookingDate = $booking->booking_date;

        return [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'venue' => $booking->venue->name,
            'venue_id' => $booking->venue_id,
            'category' => $booking->venue->category ?? '',
            'address' => $booking->venue->address ?? '',
            'date' => $bookingDate->format('Y-m-d'),
            'time' => substr((string) $booking->start_time, 0, 5) . ' - ' . substr((string) $booking->end_time, 0, 5),
            'start_time' => substr((string) $booking->start_time, 0, 5),
            'end_time' => substr((string) $booking->end_time, 0, 5),
            'status' => $booking->status,
            'price' => 'Rp ' . number_format((float) $booking->total_price, 0, ',', '.'),
            'price_raw' => (float) $booking->total_price,
            'payment_status' => $booking->payment_status,
            'payment_method' => $booking->payment_method,
            'user_name' => $booking->booker_name,
            'points_earned' => $booking->points_earned,
            'created_at' => $booking->created_at->format('d M Y, H:i'),
        ];
    }
}
