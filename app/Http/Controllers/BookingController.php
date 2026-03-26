<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Facility;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BookingController extends Controller
{
    private $midtrans;
    private $rewardService;

    public function __construct(MidtransService $midtrans, \App\Services\RewardService $rewardService)
    {
        $this->midtrans = $midtrans;
        $this->rewardService = $rewardService;
    }

    /**
     * Store a new booking and get Midtrans token.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'payment_method' => 'string',
            'guest_name' => 'nullable|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'user_reward_id' => 'nullable|exists:user_rewards,id',
        ]);

        $facility = Facility::find($request->facility_id);
        $starts_at = Carbon::parse($request->booking_date . ' ' . $request->start_time);
        $ends_at = Carbon::parse($request->booking_date . ' ' . $request->end_time);

        // Calculate duration
        $duration = $starts_at->diffInHours($ends_at);
        if ($duration < 1)
            $duration = 1;

        // Update User Phone if provided and logged in
        if ($request->guest_phone && auth()->check()) {
            auth()->user()->update(['phone' => $request->guest_phone]);
        }

        // Check availability (simplification: simple collision check)
        $isTaken = Booking::where('facility_id', $request->facility_id)
            ->whereIn('payment_status', ['paid', 'settlement', 'confirmed'])
            ->where(function ($q) use ($starts_at, $ends_at) {
                $q->where(function ($qq) use ($starts_at, $ends_at) {
                    $qq->where('starts_at', '>=', $starts_at)
                        ->where('starts_at', '<', $ends_at);
                })->orWhere(function ($qq) use ($starts_at, $ends_at) {
                    $qq->where('ends_at', '>', $starts_at)
                        ->where('ends_at', '<=', $ends_at);
                });
            })->exists();

        if ($isTaken) {
            return back()->withErrors(['error' => 'Mission slot already occupied. Please select another timeline!']);
        }

        // Base calculation
        $price_per_hour = $facility->price_per_hour;
        $base_price = ($price_per_hour * $duration);
        $referee_price = 0;

        // Referee Add-on specifically for Mini Soccer
        $is_with_referee = $request->boolean('is_with_referee', false);
        if (str_contains(strtolower($facility->name), 'mini soccer') && $is_with_referee) {
            $referee_price = 50000;
        }

        $total_price = $base_price + $referee_price;
        $discount_amount = 0;
        $voucher = null;

        // Apply Voucher Discount if provided
        if ($request->user_reward_id) {
            $voucher = \App\Models\UserReward::where('id', $request->user_reward_id)
                ->where('user_id', auth()->id())
                ->first();

            if ($voucher) {
                try {
                    $discount_amount = $this->rewardService->calculateDiscount($total_price, $voucher);
                    $total_price -= $discount_amount;
                } catch (\Exception $e) {
                    return back()->withErrors(['error' => 'Voucher tidak valid: ' . $e->getMessage()]);
                }
            }
        }

        $dp_amount = null;
        $amount_to_bill = $total_price;

        if ($request->payment_method === 'dp_online' || $request->payment_method === 'dp_manual') {
            $dp_amount = $total_price * 0.5; // 50% DP
            $amount_to_bill = $dp_amount;
        }

        $booking = Booking::create([
            'user_id' => auth()->id(),
            'guest_name' => $request->guest_name ?? (auth()->check() ? auth()->user()->name : 'Guest'),
            'guest_email' => $request->guest_email ?? (auth()->check() ? auth()->user()->email : null),
            'guest_phone' => $request->guest_phone ?? (auth()->check() ? auth()->user()->phone : null),
            'facility_id' => $facility->id,
            'starts_at' => $starts_at,
            'ends_at' => $ends_at,
            'duration_hours' => $duration,
            'is_with_referee' => $is_with_referee,
            'referee_price' => $referee_price,
            'total_price' => $total_price,
            'dp_amount' => $dp_amount,
            'user_reward_id' => $request->user_reward_id,
            'discount_amount' => $discount_amount,
            'payment_method' => $request->payment_method,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        // Consume voucher
        if ($voucher) {
            $voucher->update([
                'status' => 'used',
                'used_at' => now()
            ]);
        }

        if ($request->payment_method === 'dp_manual') {
            // WA Admin Redirect logic
            $wa_number = '6282123456789'; // Contoh nomor WA Admin
            $message = urlencode("Halo Admin Mandala Arena, saya ingin konfirmasi DP manual (50%) untuk pesanan Booking saya.\n\nKode Booking: MA-{$booking->id}\nFasilitas: {$facility->name}\nTanggal: {$booking->booking_date}\nTotal DP: Rp " . number_format($dp_amount, 0, ',', '.'));
            $wa_link = "https://wa.me/{$wa_number}?text={$message}";

            if (!auth()->check()) {
                return redirect()->route('booking.success', $booking->id)->with([
                    'success' => 'Pesanan Berhasil! Hubungi Admin via WA untuk konfirmasi DP manual.',
                    'wa_link' => $wa_link
                ]);
            }

            return redirect()->route('bookings.index')->with([
                'success' => 'Pesanan berhasil dibuat! Silakan hubungi Admin via WhatsApp untuk melakukan transfer DP manual.',
                'wa_link' => $wa_link
            ]);
        }

        // Get SNAP Token for Midtrans
        try {
            // We pass the amount_to_bill dynamically via an override mechanism in Midtrans Service
            // Wait, Midtrans Service reads $booking->total_price. Let's explicitly pass $amount_to_bill
            $snapToken = $this->midtrans->getSnapToken($booking, $amount_to_bill);
            $booking->update(['payment_token' => $snapToken]);

            if (auth()->check()) {
                return redirect()->route('bookings.index')->with([
                    'snap_token' => $snapToken,
                    'booking_id' => $booking->id,
                    'success' => 'Berhasil dibuat. Silakan selesaikan pembayaran Instan.'
                ]);
            }

            return redirect()->route('booking.success', $booking->id)->with([
                'snap_token' => $snapToken,
                'booking_id' => $booking->id,
                'success' => 'Berhasil dibuat. Silakan selesaikan pembayaran Instan.'
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghubungkan Payment Gateway: ' . $e->getMessage()]);
        }
    }

    public function history()
    {
        return Inertia::render('Bookings/Index', [
            'bookings' => Booking::with('facility')->where('user_id', auth()->id())->latest()->get(),
        ]);
    }

    /**
     * Display the specified booking mission details.
     */
    public function show(Booking $booking)
    {
        // Guard: Only owner can see their mission
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'Unauthorized Tactical Scan');
        }

        return Inertia::render('Bookings/Show', [
            'booking' => $booking->load('facility'),
            'wa_link' => $this->generateWaAdminLink($booking)
        ]);
    }

    private function generateWaAdminLink($booking)
    {
        $wa_number = '6282123456789'; // Consumed from standard admin terminal
        $date = $booking->starts_at->format('d/m/Y');
        $code = 'MA-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT);
        $message = urlencode("Halo Admin Mandala Arena, saya ingin bertanya tentang pesanan Booking saya.\n\nKode Booking: {$code}\nFasilitas: {$booking->facility->name}\nTanggal: {$date}\nStatus: " . strtoupper($booking->status));
        return "https://wa.me/{$wa_number}?text={$message}";
    }

    /**
     * Cancel a pending booking.
     */
    public function cancel(Booking $booking)
    {
        // Guard: Only owner can cancel and only if status is pending
        if ($booking->user_id !== auth()->id()) {
            abort(403, 'Unauthorized Tactical Denial');
        }

        if ($booking->status !== 'pending') {
            return back()->withErrors(['error' => 'Confirmed missions cannot be aborted without HQ approval.']);
        }

        $booking->update([
            'status' => 'cancelled',
            'payment_status' => 'failed'
        ]);

        return back()->with('success', 'Misi booking telah diputus sesuai perintah.');
    }

    /**
     * Managed by Admin and Super Admin
     */
    public function adminIndex()
    {
        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => Booking::with(['facility', 'user'])->latest()->get(),
        ]);
    }

    public function adminConfirm(Booking $booking)
    {
        $booking->update([
            'payment_status' => 'paid',
            'status' => 'confirmed'
        ]);

        // Award 10 Points for the transaction
        if ($booking->user) {
            $booking->user->addPoints(10);
        }

        // Broadcast event for realtime update
        event(new \App\Events\BookingStatusUpdated($booking));

        return back()->with('success', 'Pesanan berhasil dikonfirmasi secara manual. 10 Poin telah ditambahkan ke saldo User!');
    }

    /**
     * Midtrans Notification Handlers
     */
    public function callback(Request $request)
    {
        $payload = $request->all();
        $order_id = $payload['order_id'];
        $status = $payload['transaction_status'];

        // Parse order_id safely (Format: MA-ID-TIMESTAMP)
        $idParts = explode('-', $order_id);
        $bookingId = $idParts[1] ?? null; // Get the ID part, if not present, it's null
        if (!$bookingId && str_starts_with($order_id, 'MA-')) {
            $bookingId = substr($order_id, 3); // Fallback for older format without timestamp
        }

        // Reliable ID extraction (MA-ID-TIMESTAMP atau MA-ID)
        $idBase = str_replace('MA-', '', $order_id);
        $idParts = explode('-', $idBase);
        $bookingId = $idParts[0];

        $booking = Booking::where('id', $bookingId)->first();

        if ($booking) {
            if ($status == 'settlement' || $status == 'capture') {
                $booking->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);

                // Award 10 Points
                if ($booking->user) {
                    $booking->user->addPoints(10);
                }

                event(new \App\Events\BookingStatusUpdated($booking));
            } else if ($status == 'expire' || $status == 'cancel' || $status == 'deny') {
                $booking->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled'
                ]);
                event(new \App\Events\BookingStatusUpdated($booking));
            }
        }

        return response()->json(['status' => 'ok']);
    }

    public function success(Booking $booking)
    {
        $payload = ['booking' => $booking->load('facility')];

        if (auth()->check()) {
            return Inertia::render('Bookings/Success', $payload);
        }

        return Inertia::render('Bookings/GuestSuccess', $payload);
    }

    /**
     * Admin: Reports Data
     */
    public function reports()
    {
        $bookings = Booking::where('payment_status', 'paid')
            ->whereYear('created_at', now()->year)
            ->get();

        $monthlyData = collect(range(1, 12))->map(function ($month) use ($bookings) {
            $total = $bookings->filter(fn($b) => $b->created_at->month === $month)->sum('total_price');
            return [
                'month' => Carbon::create()->month($month)->format('M'),
                'total' => (float) $total
            ];
        });

        return Inertia::render('Admin/Reports/Index', [
            'revenue_total' => (float) $bookings->sum('total_price'),
            'platform_fee' => $bookings->count() * 2500,
            'bookings_count' => Booking::count(),
            'popular_facility' => Facility::withCount('bookings')->orderBy('bookings_count', 'desc')->first(),
            'monthly_data' => $monthlyData->values()
        ]);
    }
}
