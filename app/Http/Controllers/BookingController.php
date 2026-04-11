<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Facility;
use App\Services\MidtransService;
use App\Events\BookingUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Collection;

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
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'payment_method' => 'string',
            'guest_name' => auth()->check() ? 'nullable|string|max:255' : 'required|string|max:255',
            'guest_email' => auth()->check() ? 'nullable|email|max:255' : 'required|email|max:255',
            'guest_phone' => 'required|string|max:20',
            'user_reward_id' => 'nullable|exists:user_rewards,id',
            'selected_addons' => 'nullable|array',
        ]);

        $facility = Facility::find($request->facility_id);
        $starts_at = Carbon::parse($request->booking_date . ' ' . $request->start_time);
        $ends_at = Carbon::parse($request->booking_date . ' ' . $request->end_time);

        $isPilates = strtolower($facility->category) === 'pilates';

        // Calculate duration (Pilates default 1)
        $duration = $starts_at->diffInHours($ends_at);
        if ($duration < 1 || $isPilates) {
            $duration = 1;
        }

        // Update User Phone if provided and logged in
        if ($request->guest_phone && auth()->check()) {
            auth()->user()->update(['phone' => $request->guest_phone]);
        }

        try {
            $result = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $facility, $starts_at, $ends_at, $isPilates, $duration) {
                $isTaken = Booking::where('facility_id', $request->facility_id)
                    ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
                    ->where(function ($q) {
                        $q->whereIn('payment_status', ['paid', 'settlement', 'capture'])
                            ->orWhere(function ($qq) {
                                $qq->where('payment_status', 'pending')
                                    ->where('created_at', '>', now()->subMinutes(15));
                            });
                    })
                    ->where(function ($q) use ($starts_at, $ends_at) {
                        $q->where(function ($qq) use ($starts_at, $ends_at) {
                            $qq->where('starts_at', '>=', $starts_at)
                                ->where('starts_at', '<', $ends_at);
                        })->orWhere(function ($qq) use ($starts_at, $ends_at) {
                            $qq->where('ends_at', '>', $starts_at)
                                ->where('ends_at', '<=', $ends_at);
                        })->orWhere(function ($qq) use ($starts_at, $ends_at) {
                            $qq->where('starts_at', '<=', $starts_at)
                                ->where('ends_at', '>=', $ends_at);
                        });
                    })->lockForUpdate()->exists();

                if ($isTaken) {
                    throw new \Exception('Maaf, jadwal ini sudah terisi atau sedang dalam proses pembayaran.');
                }

                // Base calculation - PER HOUR for better accuracy with dynamic pricing
                $total_base_price = 0;
                $sport_type = $facility->category;

                if ($isPilates) {
                    $session_name = $request->input('session_name', null);
                    $dynamic_price = $this->getPrice($sport_type, null, $session_name);
                    $total_base_price = $dynamic_price > 0 ? $dynamic_price : $facility->price_per_hour;
                } else {
                    // For non-pilates, calculate each hour's price
                    $current_time = clone $starts_at;
                    while ($current_time < $ends_at) {
                        $hour_str = $current_time->format('H:i:s');
                        $hour_price = $this->getPrice($sport_type, $hour_str);
                        $total_base_price += ($hour_price > 0 ? $hour_price : $facility->price_per_hour);
                        $current_time->addHour();
                    }
                }
                $base_price = $total_base_price;

                $selectedAddonNames = $request->input('selected_addons', []);
                $addonData = $this->calculateAddons($facility, $selectedAddonNames, $request->boolean('is_with_referee', false));
                $total_price = $base_price + $addonData['total'];
                $discount_amount = 0;
                $voucher = null;

                if ($request->user_reward_id) {
                    $voucher = \App\Models\UserReward::where('id', $request->user_reward_id)
                        ->where('user_id', auth()->id())
                        ->lockForUpdate()
                        ->first();

                    if ($voucher && $voucher->status === 'unused') {
                        $discount_amount = $this->rewardService->calculateDiscount($total_price, $voucher);
                        $total_price -= $discount_amount;
                        $voucher->update(['status' => 'used', 'used_at' => now()]);
                    }
                }

                $dp_amount = null;
                $amount_to_bill = $total_price;
                if (in_array($request->payment_method, ['dp_online', 'dp_manual'])) {
                    $dp_amount = $total_price * 0.5;
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
                    'total_price' => $total_price,
                    'dp_amount' => $dp_amount,
                    'user_reward_id' => $request->user_reward_id,
                    'discount_amount' => $discount_amount,
                    'payment_method' => $request->payment_method,
                    'selected_addons' => $addonData['addons'],
                    'addons_total_price' => $addonData['total'],
                    'status' => Booking::STATUS_PENDING,
                    'payment_status' => 'pending',
                ]);

                return compact('booking', 'dp_amount', 'amount_to_bill');
            });
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        $booking = $result['booking'];
        $dp_amount = $result['dp_amount'];
        $amount_to_bill = $result['amount_to_bill'];

        // METODE MANUAL (TRANSFER / QRIS / COD)
        if (in_array($request->payment_method, ['transfer', 'qris', 'cod'])) {
            $wa_link = $this->generateWaAdminLink($booking);

            if (!auth()->check()) {
                return redirect()->route('booking.success', $booking->id)->with([
                    'success' => 'Pesanan Berhasil! Hubungi Admin via WA untuk konfirmasi pembayaran.',
                    'wa_link' => $wa_link
                ]);
            }

            return redirect()->route('bookings.show', $booking->id)->with([
                'success' => $request->payment_method === 'cod' ? 'Booking On-Site terdaftar!' : 'Booking dibuat! Segera selesaikan pembayaran.',
                'wa_link' => $wa_link
            ]);
        }

        // METODE OTOMATIS (ONLINE - JIKA MASIH DIGUNAKAN)
        try {
            $snapToken = $this->midtrans->getSnapToken($booking, $amount_to_bill);
            $booking->update(['payment_token' => $snapToken]);

            if (auth()->check()) {
                return redirect()->route('bookings.show', $booking->id)->with([
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

    public function show(Booking $booking)
    {
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
        $wa_number = '6287892312759';
        $date = $booking->starts_at->format('d/m/Y');
        $code = 'MA-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT);
        $message = urlencode("Halo Admin Mandala Arena, saya ingin bertanya tentang pesanan Booking saya.\n\nKode Booking: {$code}\nFasilitas: {$booking->facility->name}\nTanggal: {$date}\nStatus: " . strtoupper($booking->status));
        return "https://wa.me/{$wa_number}?text={$message}";
    }

    public function cancel(Booking $booking)
    {
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

    public function adminIndex()
    {
        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => Booking::with(['facility', 'user'])->latest()->get(),
            'facilities' => Facility::where('is_active', true)->get(['id', 'name', 'price_per_hour', 'open_time', 'close_time']),
        ]);
    }

    /**
     * Admin: Manual Offline Booking
     */
    public function manualStore(Request $request)
    {
        $validated = $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'nullable|string|max:20',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|string',
            'end_time' => 'required|string',
        ]);

        $facility = Facility::find($request->facility_id);
        $starts_at = Carbon::parse($request->booking_date . ' ' . $request->start_time);
        $ends_at = Carbon::parse($request->booking_date . ' ' . $request->end_time);
        $duration = $starts_at->diffInHours($ends_at);

        if ($duration < 1)
            $duration = 1;

        // Check availability
        $isTaken = Booking::where('facility_id', $request->facility_id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereIn('payment_status', ['paid', 'settlement', 'pending'])
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
            return back()->withErrors(['time' => 'Timeline target sudah terisi misi lain.']);
        }

        // Base calculation (Harga Dinamis Manual Store) - PER HOUR
        $total_base_price = 0;
        $sport_type = $facility->category;

        $current_time = clone $starts_at;
        while ($current_time < $ends_at) {
            $hour_str = $current_time->format('H:i:s');
            $hour_price = $this->getPrice($sport_type, $hour_str);
            $total_base_price += ($hour_price > 0 ? $hour_price : $facility->price_per_hour);
            $current_time->addHour();
        }
        $total_price = $total_base_price;

        Booking::create([
            'facility_id' => $facility->id,
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone ?? 'Offline/Manual',
            'starts_at' => $starts_at,
            'ends_at' => $ends_at,
            'duration_hours' => $duration,
            'total_price' => $total_price,
            'payment_method' => 'bayar_ditempat',
            'payment_status' => 'paid',
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Booking Offline Berhasil Diinput. Jam telah diblokir.');
    }

    public function adminConfirm(Booking $booking)
    {
        $booking->update([
            'payment_status' => 'paid',
            'status' => 'confirmed'
        ]);

        if ($booking->user) {
            $booking->user->addPoints(10);
        }

        broadcast(new BookingUpdated($booking));

        return back()->with('success', 'Pesanan berhasil dikonfirmasi secara manual. 10 Poin telah ditambahkan ke saldo User!');
    }

    public function adminReject(Booking $booking)
    {
        $booking->update([
            'payment_status' => 'failed',
            'status' => 'cancelled'
        ]);

        broadcast(new BookingUpdated($booking));

        return back()->with('success', 'Pesanan telah didelete/dibatalkan sesuai perintah.');
    }

    public function callback(Request $request)
    {
        $payload = $request->all();

        // ── 🛡️ SECURITY: VALIDATE SIGNATURE KEY ──────────────────────────
        // From Midtrans docs: sha512(order_id + status_code + gross_amount + server_key)
        $serverKey = config('midtrans.server_key');
        $signature = hash("sha512", $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . $serverKey);

        if ($signature !== ($payload['signature_key'] ?? '')) {
            \Log::warning("Invalid Midtrans Signature for Order: " . ($payload['order_id'] ?? 'unknown'));
            return response()->json(['message' => 'Invalid Signature'], 403);
        }

        $order_id = $payload['order_id'];
        $status = $payload['transaction_status'];

        $idBase = str_replace('MA-', '', $order_id);
        $idParts = explode('-', $idBase);
        $bookingId = $idParts[0];

        $booking = Booking::find($bookingId);

        if ($booking) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($bookingId, $status, $order_id, $payload) {
                // Lock the booking row and re-fetch to ensure fresh data
                $booking = Booking::lockForUpdate()->find($bookingId);

                if (!$booking)
                    return;

                if ($status == 'settlement' || $status == 'capture') {
                    // ── 🚨 DOUBLE BOOKING PROTECTION (FINAL LATE CHECK) ──────────────────────────
                    // Check if another PAID/CONFIRMED booking exists for the same slot
                    $isConflict = Booking::where('facility_id', $booking->facility_id)
                        ->where('id', '!=', $booking->id)
                        ->where('status', Booking::STATUS_CONFIRMED)
                        ->whereIn('payment_status', ['paid', 'settlement', 'capture'])
                        ->where(function ($q) use ($booking) {
                            $q->where(function ($qq) use ($booking) {
                                $qq->where('starts_at', '>=', $booking->starts_at)
                                    ->where('starts_at', '<', $booking->ends_at);
                            })->orWhere(function ($qq) use ($booking) {
                                $qq->where('ends_at', '>', $booking->starts_at)
                                    ->where('ends_at', '<=', $booking->ends_at);
                            })->orWhere(function ($qq) use ($booking) {
                                $qq->where('starts_at', '<=', $booking->starts_at)
                                    ->where('ends_at', '>=', $booking->ends_at);
                            });
                        })->exists();

                    if ($isConflict) {
                        // ── 💸 AUTO REFUND TRIGGER ───────────────────────────────
                        $refundAmount = $payload['gross_amount'] ?? $booking->total_price;
                        $refundResponse = $this->midtrans->refund($order_id, $refundAmount, 'Bentrok Jadwal (Sistem)');

                        $booking->update([
                            'status' => Booking::STATUS_CANCELLED,
                            'payment_status' => 'failed',
                            'conflict_note' => 'Maaf, transaksi Anda dibatalkan karena bentrok jadwal dengan pembayaran lain yang masuk lebih awal.',
                            'refund_status' => $refundResponse ? 'processed' : 'failed',
                            'refund_id' => $refundResponse->refund_id ?? null,
                            'paid_at' => now(),
                        ]);

                        $this->notifyConflict($booking);
                        \Log::warning("Double Booking Detected for MA-{$booking->id}. Refund triggered.");
                    } else {
                        // ── ✅ SUCCESSFUL BOOKING (AUTOMATIC) ─────────────────────
                        // Capture real payment type from Midtrans (e.g. gopay, bank_transfer)
                        $paymentType = $payload['payment_type'] ?? $booking->payment_method;

                        $booking->update([
                            'payment_status' => 'paid',
                            'status' => Booking::STATUS_CONFIRMED,
                            'payment_method' => $paymentType, // Update with actual method used
                            'paid_at' => now(),
                        ]);

                        if ($booking->user) {
                            $booking->user->addPoints(10);
                        }

                        $this->notifySuccess($booking);
                        \Log::info("Booking MA-{$booking->id} AUTOMATICALLY Confirmed via Midtrans Callback.");
                    }

                    broadcast(new BookingUpdated($booking));

                } else if ($status == 'expire' || $status == 'cancel' || $status == 'deny') {
                    $booking->update([
                        'payment_status' => 'failed',
                        'status' => Booking::STATUS_CANCELLED
                    ]);
                    broadcast(new BookingUpdated($booking));
                }
            });
        }

        return response()->json(['status' => 'ok']);
    }

    private function notifySuccess(Booking $booking)
    {
        $phone = $booking->guest_phone ?? ($booking->user->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user->name ?? 'User');
        $date = $booking->starts_at->format('d/m/Y');
        $time = $booking->starts_at->format('H:i');

        if ($phone) {
            $message = "✅ *BOOKING BERHASIL DIKONFIRMASI*\n\nHalo {$name}, pembayaran Anda telah kami terima.\n\n*Detail Jadwal:*\nFasilitas: {$booking->facility->name}\nTanggal: {$date}\nJam: {$time} WIB\nKode Booking: #MA-{$booking->id}\n\nTerima kasih telah memilih Mandala Arena! Sampai jumpa di lapangan.";
            \App\Services\WhatsAppService::sendMessage($phone, $message);
        }

        if ($booking->guest_email || ($booking->user && $booking->user->email)) {
            $email = $booking->guest_email ?? $booking->user->email;
            \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\BookingInvoiceMail($booking));
        }
    }

    private function notifyConflict(Booking $booking)
    {
        $phone = $booking->guest_phone ?? ($booking->user->phone ?? null);
        $name = $booking->guest_name ?? ($booking->user->name ?? 'User');

        if ($phone) {
            $message = "⚠️ *MAAF, TERJADI BENTROK JADWAL*\n\nHalo {$name}, kami mendeteksi adanya bentrok jadwal pada pesanan Anda (#MA-{$booking->id}).\n\nSesuai sistem kami, pembayaran pertama yang masuk adalah yang sah. Dana Anda sedang kami kembalikan (Auto-Refund) melalui metode pembayaran yang Anda gunakan.\n\nEstimasi refund: 1-3 hari kerja (tergantung bank/e-wallet).\nMohon maaf atas ketidaknyamanan ini.";
            \App\Services\WhatsAppService::sendMessage($phone, $message);
        }

        // Email Conflict could be added here
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
     * Admin: Reports Data - Comprehensive Financial Analytics
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function reports(Request $request): \Inertia\Response
    {
        try {
            $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->subDays(30)->startOfDay();
            $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();
        } catch (\Exception $e) {
            $startDate = now()->subDays(30)->startOfDay();
            $endDate = now()->endOfDay();
        }

        /** @var \Illuminate\Database\Eloquent\Builder $baseQuery */
        $baseQuery = Booking::query()->with(['facility', 'user'])
            ->whereBetween('starts_at', [$startDate, $endDate]);

        if ($request->facility_id) {
            $baseQuery->where('facility_id', $request->facility_id);
        }

        if ($request->category) {
            $baseQuery->whereHas('facility', function ($f) use ($request) {
                $f->where('category', $request->category);
            });
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Booking> $paidBookings */
        $paidBookings = (clone $baseQuery)->where('payment_status', 'paid')->get();
        $allBookingsCount = (clone $baseQuery)->count();

        $transactions = (clone $baseQuery)->latest()->take(50)->get()->map(function (Booking $b) {
            return [
                'id' => $b->id,
                'code' => $b->booking_code,
                'user' => $b->user ? $b->user->name : ($b->guest_name ?: 'Guest'),
                'facility' => $b->facility->name ?? 'Deleted',
                'datetime' => $b->starts_at->format('d M Y H:i'),
                'duration' => $b->duration_hours . " Jam",
                'total' => (float) $b->total_price,
                'method' => $b->payment_method ?: 'N/A',
                'status' => $b->status,
                'payment_status' => $b->payment_status
            ];
        })->toArray();

        $occupancyData = $this->getOccupancyData($startDate, $endDate, $request);
        $atvData = $this->getATVData($paidBookings);

        $payload = [
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'facility_id' => $request->facility_id,
                'category' => $request->category,
                'range' => $request->range,
            ],
            'revenue' => $this->getRevenueData($paidBookings),
            'averages' => $this->getAveragesData($paidBookings),
            'trending' => $this->getTrendingData($paidBookings),
            'transactions' => $transactions,
            'stats' => [
                'total_count' => $allBookingsCount,
                'paid_count' => $paidBookings->count(),
                'refunds_count' => (clone $baseQuery)->where('status', 'cancelled')->where('payment_status', 'paid')->count(),
                'success_rate' => (float) number_format($allBookingsCount > 0 ? ($paidBookings->count() / $allBookingsCount) * 100 : 0, 1),
                'global_atv' => $atvData['overall'],
                'total_hours' => (float) $paidBookings->sum('duration_hours'),
                'avg_occupancy' => $occupancyData['overall_avg']
            ],
            'meta' => [
                'facilities' => Facility::select('id', 'name', 'category')->orderBy('name')->get()->toArray(),
                'categories' => Facility::distinct()->pluck('category')->filter()->values()->toArray()
            ],
            'daily_trend' => $this->getDailyTrend($request, $endDate),
            'weekly_trend' => $this->getWeeklyTrend($request, $endDate),
            'monthly_trend' => $this->getMonthlyTrend($request, $endDate),
            'category_breakdown' => $this->getCategoryBreakdown($startDate, $endDate)->toArray(),
            'atv_data' => $atvData,
            'occupancy_data' => $occupancyData,
            'hourly_analysis' => $this->getHourlyAnalysis($startDate, $endDate, $request),
        ];

        return Inertia::render('Admin/Reports/Index', $payload);
    }

    /**
     * Mendapatkan harga dinamis berdasarkan tipe olahraga dan jam.
     * Jika sport_type == "pilates", abaikan jam dan ambil berdasarkan session_name.
     *
     * @param string $sport_type
     * @param string|null $jam
     * @param string|null $session_name
     * @return float
     */
    private function getPrice($sport_type, $jam = null, $session_name = null): float
    {
        $query = \App\Models\PriceSchedule::where('sport_type', $sport_type);

        // Logic Khusus Pilates (Acuan HANYA pada session_name)
        if (strtolower($sport_type) === 'pilates') {
            if ($session_name) {
                $schedule = (clone $query)->where('session_name', $session_name)->first();
                return $schedule ? (float) $schedule->price : 0;
            }
            return 0; // Fallback jika tidak ada session name untuk pilates
        }

        // Logic default (Acuan utamanya JAM)
        if ($jam) {
            $schedule = (clone $query)
                ->where('start_time', '<=', $jam)
                ->where('end_time', '>=', $jam)
                ->first();

            if ($schedule) {
                return (float) $schedule->price;
            }
        }

        // Jika tidak ketemu berdasarkan rentang waktu, coba pakai session_name (jika ada)
        if ($session_name) {
            $schedule = (clone $query)->where('session_name', $session_name)->first();
            if ($schedule) {
                return (float) $schedule->price;
            }
        }

        return 0;
    }

    private function checkAvailabilityStore($facilityId, Carbon $starts_at, Carbon $ends_at): bool
    {
        return Booking::where('facility_id', $facilityId)
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
    }

    private function calculateAddons($facility, array $selectedAddonNames, bool $is_with_referee): array
    {
        $bookedAddons = [];
        $addonsTotal = 0;

        $facilityAddons = collect($facility->addons ?? []);
        foreach ($selectedAddonNames as $addonName) {
            $addonInfo = $facilityAddons->firstWhere('name', $addonName);
            if ($addonInfo) {
                $bookedAddons[] = [
                    'name' => $addonInfo['name'],
                    'price' => (float) $addonInfo['price']
                ];
                $addonsTotal += (float) $addonInfo['price'];
            }
        }

        if ($is_with_referee && !in_array('Wasit', $selectedAddonNames)) {
            $wasit = $facilityAddons->firstWhere('name', 'Wasit');
            if ($wasit) {
                $bookedAddons[] = ['name' => $wasit['name'], 'price' => (float) $wasit['price']];
                $addonsTotal += (float) $wasit['price'];
            } else if (str_contains(strtolower($facility->name), 'mini soccer')) {
                $bookedAddons[] = ['name' => 'Wasit (Legacy)', 'price' => 50000];
                $addonsTotal += 50000;
            }
        }

        return ['addons' => $bookedAddons, 'total' => $addonsTotal];
    }

    private function getRevenueData(Collection $paidBookings): array
    {
        $thisMonthKey = now()->format('Y-m');
        $lastMonthKey = now()->subMonth()->format('Y-m');

        // Use starts_at for consistent financial reporting with the schedules
        $thisMonthTotal = $paidBookings->filter(fn($b) => $b->starts_at->format('Y-m') === $thisMonthKey)->sum('total_price');
        $lastMonthTotal = $paidBookings->filter(fn($b) => $b->starts_at->format('Y-m') === $lastMonthKey)->sum('total_price');

        $grossRevenue = $paidBookings->sum('total_price');
        $estimatedPgFees = $grossRevenue * 0.03; // Simple 3% estimate

        return [
            'total_gross' => (float) $grossRevenue,
            'net_income' => (float) ($grossRevenue - $estimatedPgFees),
            'monthly' => $paidBookings->groupBy(fn($b) => $b->starts_at->format('Y-m'))->map(fn($g) => $g->sum('total_price')),
            'comparison' => [
                'this_month' => (float) $thisMonthTotal,
                'last_month' => (float) $lastMonthTotal,
                'growth' => $lastMonthTotal > 0 ? (($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100 : ($thisMonthTotal > 0 ? 100 : 0)
            ]
        ];
    }

    private function getAveragesData(Collection $paidBookings): array
    {
        return [
            'by_facility' => Facility::get()->map(function ($f) use ($paidBookings) {
                $fBookings = $paidBookings->where('facility_id', $f->id);
                return [
                    'id' => $f->id,
                    'name' => $f->name,
                    'category' => $f->category,
                    'avg_price' => (float) ($fBookings->avg('total_price') ?: 0),
                    'count' => $fBookings->count()
                ];
            }),
            'peak_avg' => (float) ($paidBookings->filter(fn($b) => $b->starts_at->hour >= 16 && $b->starts_at->hour < 22)->avg('total_price') ?: 0),
            'non_peak_avg' => (float) ($paidBookings->filter(fn($b) => $b->starts_at->hour < 16 || $b->starts_at->hour >= 22)->avg('total_price') ?: 0)
        ];
    }

    private function getTrendingData(Collection $paidBookings): array
    {
        return [
            'top_players' => $paidBookings->groupBy(fn($b) => $b->user ? $b->user->name : ($b->guest_name ?: 'Guest'))
                ->map(fn($g, $n) => ['name' => $n, 'count' => $g->count(), 'spent' => (float) $g->sum('total_price')])
                ->sortByDesc('count')->take(5)->values(),
            'per_category' => Facility::distinct()->pluck('category')->filter()->map(function ($cat) use ($paidBookings) {
                $topInCat = $paidBookings->filter(fn($b) => $b->facility && $b->facility->category === $cat)
                    ->groupBy(fn($b) => $b->user ? $b->user->name : ($b->guest_name ?: 'Guest'))
                    ->map(fn($g, $n) => ['name' => $n, 'count' => $g->count()])->sortByDesc('count')->first();
                return ['category' => $cat, 'top_user' => $topInCat ? $topInCat['name'] : 'N/A', 'sessions' => $topInCat ? $topInCat['count'] : 0];
            }),
            'per_facility' => Facility::get()->map(function ($f) use ($paidBookings) {
                $topInFac = $paidBookings->where('facility_id', $f->id)
                    ->groupBy(fn($b) => $b->user ? $b->user->name : ($b->guest_name ?: 'Guest'))
                    ->map(fn($g, $n) => ['name' => $n, 'count' => $g->count()])->sortByDesc('count')->first();
                return ['name' => $f->name, 'top_user' => $topInFac ? $topInFac['name'] : 'N/A', 'sessions' => $topInFac ? $topInFac['count'] : 0];
            })
        ];
    }

    private function getDailyTrend(Request $request, Carbon $endDate): array
    {
        // Try to respect the selected start date, otherwise default to 30 days
        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : (clone $endDate)->subDays(29)->startOfDay();
        $daysCount = $startDate->diffInDays($endDate) + 1;

        // Cap to 60 days for chart readability and performance
        if ($daysCount > 60)
            $daysCount = 60;
        if ($daysCount < 1)
            $daysCount = 1;

        $dailyTrend = [];
        for ($i = $daysCount - 1; $i >= 0; $i--) {
            $day = (clone $endDate)->subDays($i)->toDateString();
            $paid = Booking::where('payment_status', 'paid')
                ->whereDate('starts_at', $day)
                ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
                ->when($request->category, fn($q) => $q->whereHas('facility', fn($f) => $f->where('category', $request->category)));

            $dailyTrend[] = [
                'label' => (clone $endDate)->subDays($i)->format('d/m'),
                'count' => (clone $paid)->count(),
                'revenue' => (float) (clone $paid)->sum('total_price'),
            ];
        }
        return $dailyTrend;
    }

    private function getWeeklyTrend(Request $request, Carbon $endDate): array
    {
        $weeklyTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $weekStart = (clone $endDate)->subWeeks($i)->startOfWeek();
            $weekEnd = (clone $endDate)->subWeeks($i)->endOfWeek();
            $paid = Booking::where('payment_status', 'paid')
                ->whereBetween('starts_at', [$weekStart, $weekEnd])
                ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
                ->when($request->category, fn($q) => $q->whereHas('facility', fn($f) => $f->where('category', $request->category)));
            $weeklyTrend[] = [
                'label' => 'W' . $weekStart->isoWeek() . ' ' . $weekStart->format('M'),
                'count' => (clone $paid)->count(),
                'revenue' => (float) (clone $paid)->sum('total_price'),
            ];
        }
        return $weeklyTrend;
    }

    private function getMonthlyTrend(Request $request, Carbon $endDate): array
    {
        $monthlyTrend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = (clone $endDate)->subMonths($i);
            $paid = Booking::where('payment_status', 'paid')
                ->whereYear('starts_at', $month->year)
                ->whereMonth('starts_at', $month->month)
                ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
                ->when($request->category, fn($q) => $q->whereHas('facility', fn($f) => $f->where('category', $request->category)));
            $monthlyTrend[] = [
                'label' => $month->format('M Y'),
                'count' => (clone $paid)->count(),
                'revenue' => (float) (clone $paid)->sum('total_price'),
            ];
        }
        return $monthlyTrend;
    }

    private function getCategoryBreakdown(Carbon $startDate, Carbon $endDate): Collection
    {
        return Booking::with('facility')
            ->where('payment_status', 'paid')
            ->whereBetween('starts_at', [$startDate, $endDate])
            ->get()
            ->groupBy(fn(Booking $b) => $b->facility->category ?? 'Lainnya')
            ->map(function (Collection $group, string $cat) {
                return [
                    'category' => $cat,
                    'count' => collect($group)->count(),
                    'revenue' => (float) collect($group)->sum('total_price'),
                ];
            })
            ->values();
    }

    private function getATVData(Collection $paidBookings): array
    {
        $overall = $paidBookings->count() > 0 ? $paidBookings->avg('total_price') : 0;

        $byCategory = $paidBookings->groupBy(fn($b) => $b->facility->category ?? 'Other')
            ->map(fn($group) => [
                'count' => $group->count(),
                'avg' => (float) $group->avg('total_price')
            ]);

        return [
            'overall' => (float) $overall,
            'by_category' => $byCategory
        ];
    }

    private function getOccupancyData(Carbon $start, Carbon $end, Request $request): array
    {
        $daysCount = $start->diffInDays($end) + 1;
        $facilities = Facility::when($request->facility_id, fn($q, $id) => $q->where('id', $id))
            ->when($request->category, fn($q, $cat) => $q->where('category', $cat))
            ->orderBy('name')
            ->get();

        $facilityStats = [];
        $totalOccupancyPct = 0;

        foreach ($facilities as $f) {
            $open = Carbon::parse($f->open_time ?: '06:00');
            $close = Carbon::parse($f->close_time ?: '24:00'); // Assuming closing at midnight if not set

            if ($close->lte($open)) {
                $close->addDay();
            }

            $dailyOperationalHours = $open->diffInHours($close);
            if ($dailyOperationalHours <= 0) {
                $dailyOperationalHours = 18; // Fallback to 18 hours (06:00 - 24:00)
            }

            $totalPotentialHours = $dailyOperationalHours * $daysCount;

            $bookedHours = Booking::where('facility_id', $f->id)
                ->whereIn('payment_status', ['paid', 'settlement']) // ensure we count only truly paid ones
                ->whereBetween('starts_at', [$start, $end])
                ->sum('duration_hours');

            $occupancyPct = $totalPotentialHours > 0 ? ($bookedHours / $totalPotentialHours) * 100 : 0;
            $totalOccupancyPct += $occupancyPct;

            $facilityStats[] = [
                'name' => $f->name,
                'category' => $f->category,
                'booked_hours' => (float) $bookedHours,
                'potential_hours' => (float) $totalPotentialHours,
                'occupancy_pct' => (float) $occupancyPct
            ];
        }

        return [
            'by_facility' => $facilityStats,
            'overall_avg' => count($facilities) > 0 ? ($totalOccupancyPct / count($facilities)) : 0
        ];
    }

    private function getHourlyAnalysis(Carbon $start, Carbon $end, Request $request): array
    {
        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourStr = str_pad($h, 2, '0', STR_PAD_LEFT);
            $hourlyData[$hourStr] = 0;
        }

        $bookings = Booking::where('payment_status', 'paid')
            ->whereBetween('starts_at', [$start, $end])
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->category, fn($q, $cat) => $q->whereHas('facility', fn($f) => $f->where('category', $cat)))
            ->get();

        foreach ($bookings as $b) {
            $h = $b->starts_at->format('H');
            $hourlyData[$h] += 1;
        }

        return collect($hourlyData)->map(fn($count, $hour) => [
            'hour' => $hour . ':00',
            'count' => $count
        ])->values()->toArray();
    }

    public function getAvailability(Request $request)
    {
        $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'date' => 'required|date',
        ]);

        $facility = Facility::find($request->facility_id);
        return response()->json($this->internalGenerateSlots($facility, $request->date));
    }

    private function internalGenerateSlots($facility, $date)
    {
        $facility->load([
            'bookings' => function ($q) use ($date) {
                $q->whereDate('starts_at', $date)
                    ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED]);
            }
        ]);

        $bookedSlots = $facility->bookings->filter(function ($booking) {
            // Only count as "booked" if it's confirmed OR it's pending but WITHIN the 15-min payment window
            if ($booking->status === Booking::STATUS_CONFIRMED)
                return true;
            if ($booking->status === Booking::STATUS_PENDING && $booking->created_at > now()->subMinutes(15))
                return true;
            return false;
        })->flatMap(function ($booking) use ($date) {
            $slots = [];
            $start = (int) $booking->starts_at->format('H');
            $end = (int) $booking->ends_at->format('H');
            if ($booking->ends_at->format('Y-m-d') > $date)
                $end = 24;

            for ($h = $start; $h < $end; $h++) {
                $slots[] = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            }
            return $slots;
        })->toArray();

        $openHour = $facility->open_time ? (int) substr($facility->open_time, 0, 2) : 8;
        $closeHour = $facility->close_time ? (int) substr($facility->close_time, 0, 2) : 22;

        $timeSlots = [];
        foreach (range($openHour, $closeHour - 1) as $h) {
            $time = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            $jamString = $time . ':00';
            $slotPrice = $this->getPrice($facility->category, $jamString);

            $timeSlots[] = [
                'time' => $time,
                'available' => !in_array($time, $bookedSlots),
                'price' => $slotPrice > 0 ? (float) $slotPrice : (float) $facility->price_per_hour
            ];
        }
        return $timeSlots;
    }
}
