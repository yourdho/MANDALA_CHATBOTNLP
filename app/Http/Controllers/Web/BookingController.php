<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Facility;
use App\Services\BookingService;
use App\Services\MidtransService;
use App\Services\NotificationService;
use App\Contracts\Services\RewardServiceInterface;
use App\Events\BookingUpdated;
use App\Events\BookingCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function __construct(
        protected BookingService      $bookingService,
        protected MidtransService     $midtrans,
        protected NotificationService $notifier,
        protected RewardServiceInterface $rewardService
    ) {}

    // ─────────────────────────────────────────────────────────────
    //  User: Store Booking
    // ─────────────────────────────────────────────────────────────

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'facility_id'   => 'required|exists:facilities,id',
            'booking_date'  => 'required|date|after_or_equal:today',
            'start_time'    => 'required|string',
            'end_time'      => 'required|string',
            'payment_method'=> 'string',
            'guest_name'    => auth()->check() ? 'nullable|string|max:255' : 'required|string|max:255',
            'guest_email'   => auth()->check() ? 'nullable|email|max:255'  : 'required|email|max:255',
            'guest_phone'   => 'required|string|max:20',
            'user_reward_id'=> 'nullable|exists:user_rewards,id',
            'selected_addons'=> 'nullable|array',
        ]);

        // Update user phone on the fly
        if ($request->guest_phone && auth()->check()) {
            auth()->user()->update(['phone' => $request->guest_phone]);
        }

        try {
            $result = $this->bookingService->createBooking($request->all());
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        $booking      = $result['booking'];
        broadcast(new BookingCreated($booking));
        $amountToBill = $result['amountToBill'];


        // ── Manual payment methods ───────────────────────────────
        if (in_array($request->payment_method, ['transfer', 'qris', 'cod'])) {
            $waLink = $this->notifier->generateAdminWhatsAppLink($booking);

            if (!auth()->check()) {
                return redirect()->route('booking.success', $booking->booking_token)->with([
                    'success' => 'Pesanan Berhasil! Hubungi Admin via WA untuk konfirmasi pembayaran.',
                    'wa_link' => $waLink,
                ]);
            }

            return redirect()->route('bookings.show', $booking->id)->with([
                'success' => $request->payment_method === 'cod'
                    ? 'Booking On-Site terdaftar!'
                    : 'Booking dibuat! Segera selesaikan pembayaran.',
                'wa_link' => $waLink,
            ]);
        }

        // ── Online payment via Midtrans ──────────────────────────
        try {
            $snapToken = $this->midtrans->getSnapToken($booking, $amountToBill);
            $booking->update(['payment_token' => $snapToken]);

            $with = ['snap_token' => $snapToken, 'booking_id' => $booking->id, 'success' => 'Berhasil dibuat. Silakan selesaikan pembayaran Instan.'];

            return auth()->check()
                ? redirect()->route('bookings.show',   $booking->id)
                            ->with($with)
                : redirect()->route('booking.success', $booking->booking_token)
                            ->with($with);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Gagal menghubungkan Payment Gateway: ' . $e->getMessage()]);
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  User: Read
    // ─────────────────────────────────────────────────────────────

    public function history()
    {
        return Inertia::render('Bookings/Index', [
            'bookings' => Booking::with('facility')->where('user_id', auth()->id())->latest()->get(),
        ]);
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);

        return Inertia::render('Bookings/Show', [
            'booking' => $booking->load('facility'),
            'wa_link' => $this->notifier->generateAdminWhatsAppLink($booking),
        ]);
    }

    public function invoice(Booking $booking)
    {
        $this->authorize('viewInvoice', $booking);

        return view('invoice.print', [
            'booking' => $booking->load(['facility', 'user']),
        ]);
    }

    /**
     * Halaman sukses booking — bisa diakses publik (guest).
     *
     * Menggunakan booking_token (UUID) sebagai parameter URL, BUKAN id integer.
     * UUID tidak bisa dienumerasi sehingga IDOR via ID guessing tidak mungkin.
     */
    public function success(string $token)
    {
        $booking = Booking::where('booking_token', $token)->first();

        if (!$booking) {
            abort(404, 'Booking tidak ditemukan.');
        }

        // Ownership check untuk user yang sudah login:
        // jika booking punya user_id, dan user login bukan pemiliknya → 403.
        if ($booking->user_id !== null && auth()->check() && auth()->id() !== $booking->user_id) {
            abort(403, 'Anda tidak memiliki izin untuk melihat booking ini.');
        }

        $payload = ['booking' => $booking->load('facility')];

        return $booking->user_id
            ? Inertia::render('Bookings/Show',         $payload)
            : Inertia::render('Bookings/GuestSuccess',  $payload);
    }

    public function cancel(Booking $booking)
    {
        $this->authorize('cancel', $booking);

        // Status sudah dicek di Policy (cancel hanya boleh jika pending),
        // tapi tetap ada guard di sini untuk pesan yang user-friendly.
        if ($booking->status !== 'pending') {
            return back()->withErrors(['error' => 'Booking yang sudah dikonfirmasi tidak bisa dibatalkan sendiri.']);
        }

        $booking->update(['status' => 'cancelled', 'payment_status' => 'failed']);

        return back()->with('success', 'Booking berhasil dibatalkan.');
    }

    // ─────────────────────────────────────────────────────────────
    //  Admin
    // ─────────────────────────────────────────────────────────────

    public function adminIndex()
    {
        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => Booking::with(['facility', 'user'])->latest()->get(),
            'facilities' => Facility::where('is_active', true)->get(['id', 'name', 'price_per_hour', 'open_time', 'close_time']),
        ]);
    }

    public function manualStore(Request $request)
    {
        $request->validate([
            'facility_id'  => 'required|exists:facilities,id',
            'guest_name'   => 'required|string|max:255',
            'guest_phone'  => 'nullable|string|max:20',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time'   => 'required|string',
            'end_time'     => 'required|string',
        ]);

        try {
            $booking = $this->bookingService->createManualBooking($request->all());
            broadcast(new BookingCreated($booking));
        } catch (\Exception $e) {

            return back()->withErrors(['time' => $e->getMessage()]);
        }

        return back()->with('success', 'Booking Offline Berhasil Diinput. Jam telah diblokir.');
    }

    public function adminConfirm(Booking $booking)
    {
        // Only grant points if not already paid
        $alreadyPaid = $booking->payment_status === 'paid';
        
        $booking->update(['payment_status' => 'paid', 'status' => 'confirmed']);

        if ($booking->user && !$alreadyPaid) {
            $booking->user->addPoints(10);
        }

        broadcast(new BookingUpdated($booking));

        return back()->with('success', $alreadyPaid 
            ? 'Status diperbarui (Sudah pernah dibayar sebelumnya).'
            : 'Pesanan berhasil dikonfirmasi secara manual. 10 Poin telah ditambahkan ke saldo User!');
    }

    public function adminReject(Booking $booking)
    {
        $booking->update(['payment_status' => 'failed', 'status' => 'cancelled']);
        
        // Refund voucher if any
        if ($booking->user_reward_id && $booking->load('userReward')) {
            $this->rewardService->restoreVoucher($booking->userReward);
        }

        broadcast(new BookingUpdated($booking));

        return back()->with('success', 'Pesanan telah dibatalkan. Voucher (jika ada) telah dikembalikan ke User.');

    }

    // ─────────────────────────────────────────────────────────────
    //  Payment Callback (Midtrans Webhook)
    // ─────────────────────────────────────────────────────────────

    public function callback(Request $request)
    {
        // 1. Validasi field wajib dari Midtrans
        $request->validate([
            'order_id'           => 'required|string|max:100',
            'status_code'        => 'required|string',
            'gross_amount'       => 'required|string',
            'signature_key'      => 'required|string',
            'transaction_status' => 'required|string',
        ]);

        $payload   = $request->all();
        $serverKey = config('midtrans.server_key');
        $signature = hash('sha512',
            $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . $serverKey
        );

        if (!hash_equals($signature, $payload['signature_key'])) {
            \Log::warning('[Callback] Invalid Midtrans Signature', ['order_id' => $payload['order_id']]);
            return response()->json(['message' => 'Invalid Signature'], 403);
        }

        // 2. Parse order_id — format ketat: MA-{numeric_id}
        // Tolak format tidak dikenal untuk mencegah injection melalui order_id.
        if (!preg_match('/^MA-(?P<id>\d+)$/', $payload['order_id'], $matches)) {
            \Log::warning('[Callback] Unrecognized order_id format', ['order_id' => $payload['order_id']]);
            return response()->json(['status' => 'ok']); // Return 200 agar Midtrans tidak retry
        }

        $bookingId = (int) $matches['id'];
        $status    = $payload['transaction_status'];
        $booking   = Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['status' => 'ok']);
        }

        DB::transaction(function () use ($booking, $bookingId, $status, $payload) {
            $booking = Booking::lockForUpdate()->find($bookingId);
            if (!$booking) return;

            if (in_array($status, ['settlement', 'capture'])) {

                // 3. Idempotency guard — jika sudah confirmed & paid, skip tanpa aksi.
                // Midtrans kadang mengirim notifikasi berulang untuk transaksi yang sama.
                if ($booking->status === Booking::STATUS_CONFIRMED && $booking->payment_status === 'paid') {
                    \Log::info('[Callback] Duplicate webhook ignored (already confirmed)', ['booking_id' => $bookingId]);
                    return;
                }

                // Check for double booking conflict
                $isConflict = Booking::where('facility_id', $booking->facility_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', Booking::STATUS_CONFIRMED)
                    ->whereIn('payment_status', ['paid', 'settlement', 'capture'])
                    ->where(function ($q) use ($booking) {
                        $q->where(fn($qq) => $qq->where('starts_at', '>=', $booking->starts_at)->where('starts_at', '<',  $booking->ends_at))
                          ->orWhere(fn($qq) => $qq->where('ends_at',   '>',  $booking->starts_at)->where('ends_at',   '<=', $booking->ends_at))
                          ->orWhere(fn($qq) => $qq->where('starts_at', '<=', $booking->starts_at)->where('ends_at',   '>=', $booking->ends_at));
                    })->exists();

                if ($isConflict) {
                    $refundAmount   = $payload['gross_amount'] ?? $booking->total_price;
                    $refundResponse = $this->midtrans->refund($payload['order_id'], $refundAmount, 'Bentrok Jadwal (Sistem)');

                    $booking->update([
                        'status'         => Booking::STATUS_CANCELLED,
                        'payment_status' => 'failed',
                        'conflict_note'  => 'Maaf, transaksi Anda dibatalkan karena bentrok jadwal dengan pembayaran lain yang masuk lebih awal.',
                        'refund_status'  => $refundResponse ? 'processed' : 'failed',
                        'refund_id'      => $refundResponse->refund_id ?? null,
                        'paid_at'        => now(),
                    ]);

                    if ($this->notifier) $this->notifier->notifyBookingConflict($booking);
                    \Log::warning('[Callback] Double Booking Detected, refund triggered.', ['booking_id' => $bookingId]);

                    if ($booking->user_reward_id && $booking->load('userReward')) {
                        $this->rewardService->restoreVoucher($booking->userReward);
                    }
                } else {
                    $booking->update([
                        'payment_status' => 'paid',
                        'status'         => Booking::STATUS_CONFIRMED,
                        'payment_method' => $payload['payment_type'] ?? $booking->payment_method,
                        'paid_at'        => now(),
                    ]);

                    if ($booking->user) {
                        $booking->user->addPoints(10);
                    }

                    $this->notifier->notifyBookingSuccess($booking);
                    \Log::info('[Callback] Booking confirmed via Midtrans.', ['booking_id' => $bookingId]);
                }

                broadcast(new BookingUpdated($booking));

            } elseif (in_array($status, ['expire', 'cancel', 'deny'])) {

                $booking->update(['payment_status' => 'failed', 'status' => Booking::STATUS_CANCELLED]);

                if ($booking->user_reward_id && $booking->load('userReward')) {
                    $this->rewardService->restoreVoucher($booking->userReward);
                }

                broadcast(new BookingUpdated($booking));
            }
        });

        return response()->json(['status' => 'ok']);
    }

    // ─────────────────────────────────────────────────────────────
    //  Availability (used by admin calendar)
    // ─────────────────────────────────────────────────────────────

    public function getAvailability(Request $request)
    {
        $request->validate([
            'facility_id' => 'required|exists:facilities,id',
            'date'        => 'required|date',
        ]);

        $facility = Facility::find($request->facility_id);
        return response()->json($this->generateSlots($facility, $request->date));
    }

    private function generateSlots(Facility $facility, string $date): array
    {
        $facility->load(['bookings' => function ($q) use ($date) {
            $q->whereDate('starts_at', $date)
                ->whereIn('status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED]);
        }]);

        $bookedSlots = $facility->bookings->filter(function ($booking) {
            return $booking->status === Booking::STATUS_CONFIRMED
                || ($booking->status === Booking::STATUS_PENDING && $booking->created_at > now()->subMinutes(15));
        })->flatMap(function ($booking) use ($date) {
            $slots = [];
            $start = (int) $booking->starts_at->format('H');
            $end   = (int) $booking->ends_at->format('H');
            if ($booking->ends_at->format('Y-m-d') > $date) $end = 24;
            for ($h = $start; $h < $end; $h++) {
                $slots[] = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            }
            return $slots;
        })->toArray();

        $openHour  = $facility->open_time  ? (int) substr($facility->open_time,  0, 2) : 8;
        $closeHour = $facility->close_time ? (int) substr($facility->close_time, 0, 2) : 22;

        return array_map(function ($h) use ($bookedSlots, $facility) {
            $time     = str_pad($h, 2, '0', STR_PAD_LEFT) . ':00';
            $slotPrice = $this->bookingService->calculatePrice(
                $facility->category,
                Carbon::parse($time),
                Carbon::parse($time)->addHour()
            );
            return [
                'time'      => $time,
                'available' => !in_array($time, $bookedSlots),
                'price'     => $slotPrice > 0 ? (float) $slotPrice : (float) $facility->price_per_hour,
            ];
        }, range($openHour, $closeHour - 1));
    }

    // ─────────────────────────────────────────────────────────────
    //  Reports (Analytics — stays in controller for now)
    // ─────────────────────────────────────────────────────────────

    public function reports(Request $request): \Inertia\Response
    {
        try {
            $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->subDays(30)->startOfDay();
            $endDate   = $request->end_date   ? Carbon::parse($request->end_date)->endOfDay()     : now()->endOfDay();
        } catch (\Exception $e) {
            $startDate = now()->subDays(30)->startOfDay();
            $endDate   = now()->endOfDay();
        }

        $baseQuery = Booking::query()->with(['facility', 'user'])->whereBetween('starts_at', [$startDate, $endDate]);

        if ($request->facility_id) $baseQuery->where('facility_id', $request->facility_id);
        if ($request->category)    $baseQuery->whereHas('facility', fn($f) => $f->where('category', $request->category));

        $paidBookings    = (clone $baseQuery)->where('payment_status', 'paid')->get();
        $allBookingsCount = (clone $baseQuery)->count();

        return Inertia::render('Admin/Reports/Index', [
            'filters'            => ['start_date' => $startDate->toDateString(), 'end_date' => $endDate->toDateString(), 'facility_id' => $request->facility_id, 'category' => $request->category, 'range' => $request->range],
            'revenue'            => $this->getRevenueData($paidBookings),
            'averages'           => $this->getAveragesData($paidBookings),
            'trending'           => $this->getTrendingData($paidBookings),
            'transactions'       => $this->buildTransactionList($baseQuery),
            'stats'              => $this->buildStats($baseQuery, $paidBookings, $allBookingsCount),
            'meta'               => ['facilities' => Facility::select('id', 'name', 'category')->orderBy('name')->get()->toArray(), 'categories' => Facility::distinct()->pluck('category')->filter()->values()->toArray()],
            'daily_trend'        => $this->getDailyTrend($request, $endDate),
            'weekly_trend'       => $this->getWeeklyTrend($request, $endDate),
            'monthly_trend'      => $this->getMonthlyTrend($request, $endDate),
            'category_breakdown' => $this->getCategoryBreakdown($startDate, $endDate)->toArray(),
            'atv_data'           => $this->getATVData($paidBookings),
            'occupancy_data'     => $this->getOccupancyData($startDate, $endDate, $request),
            'hourly_analysis'    => $this->getHourlyAnalysis($startDate, $endDate, $request),
        ]);
    }

    // ── Report Helpers ────────────────────────────────────────────

    private function buildTransactionList($baseQuery): array
    {
        return (clone $baseQuery)->latest()->take(50)->get()->map(fn(Booking $b) => [
            'id'             => $b->id,
            'code'           => $b->booking_code,
            'user'           => $b->user ? $b->user->name : ($b->guest_name ?: 'Guest'),
            'facility'       => $b->facility->name ?? 'Deleted',
            'datetime'       => $b->starts_at->format('d M Y H:i'),
            'duration'       => $b->duration_hours . ' Jam',
            'total'          => (float) $b->total_price,
            'method'         => $b->payment_method ?: 'N/A',
            'status'         => $b->status,
            'payment_status' => $b->payment_status,
        ])->toArray();
    }

    private function buildStats($baseQuery, Collection $paidBookings, int $allCount): array
    {
        $atvData      = $this->getATVData($paidBookings);
        $occupancyData = $this->getOccupancyData(now()->subDays(30), now(), request());
        return [
            'total_count'   => $allCount,
            'paid_count'    => $paidBookings->count(),
            'refunds_count' => (clone $baseQuery)->where('status', 'cancelled')->where('payment_status', 'paid')->count(),
            'success_rate'  => (float) number_format($allCount > 0 ? ($paidBookings->count() / $allCount) * 100 : 0, 1),
            'global_atv'    => $atvData['overall'],
            'total_hours'   => (float) $paidBookings->sum('duration_hours'),
            'avg_occupancy' => $occupancyData['overall_avg'],
        ];
    }

    private function getRevenueData(Collection $paid): array
    {
        $thisMonth = now()->format('Y-m');
        $lastMonth = now()->subMonth()->format('Y-m');
        $gross     = $paid->sum('total_price');
        return [
            'total_gross' => (float) $gross,
            'net_income'  => (float) ($gross * 0.97),
            'monthly'     => $paid->groupBy(fn($b) => $b->starts_at->format('Y-m'))->map(fn($g) => $g->sum('total_price')),
            'comparison'  => [
                'this_month' => (float) $paid->filter(fn($b) => $b->starts_at->format('Y-m') === $thisMonth)->sum('total_price'),
                'last_month' => (float) $paid->filter(fn($b) => $b->starts_at->format('Y-m') === $lastMonth)->sum('total_price'),
                'growth'     => 0,
            ],
        ];
    }

    private function getAveragesData(Collection $paid): array
    {
        return [
            'by_facility' => Facility::get()->map(fn($f) => [
                'id' => $f->id, 'name' => $f->name, 'category' => $f->category,
                'avg_price' => (float) ($paid->where('facility_id', $f->id)->avg('total_price') ?: 0),
                'count'     => $paid->where('facility_id', $f->id)->count(),
            ]),
            'peak_avg'     => (float) ($paid->filter(fn($b) => $b->starts_at->hour >= 16 && $b->starts_at->hour < 22)->avg('total_price') ?: 0),
            'non_peak_avg' => (float) ($paid->filter(fn($b) => $b->starts_at->hour < 16 || $b->starts_at->hour >= 22)->avg('total_price') ?: 0),
        ];
    }

    private function getTrendingData(Collection $paid): array
    {
        return [
            'top_players'  => $paid->groupBy(fn($b) => $b->user ? $b->user->name : ($b->guest_name ?: 'Guest'))
                ->map(fn($g, $n) => ['name' => $n, 'count' => $g->count(), 'spent' => (float) $g->sum('total_price')])
                ->sortByDesc('count')->take(5)->values(),
            'per_category' => Facility::distinct()->pluck('category')->filter()->map(fn($cat) => [
                'category' => $cat,
                'top_user' => ($top = $paid->filter(fn($b) => $b->facility && $b->facility->category === $cat)
                    ->groupBy(fn($b) => $b->user ? $b->user->name : 'Guest')
                    ->map(fn($g, $n) => ['name' => $n, 'count' => $g->count()])->sortByDesc('count')->first())
                    ? $top['name'] : 'N/A',
                'sessions' => $top['count'] ?? 0,
            ]),
            'per_facility' => Facility::get()->map(fn($f) => [
                'name'     => $f->name,
                'top_user' => ($top = $paid->where('facility_id', $f->id)
                    ->groupBy(fn($b) => $b->user ? $b->user->name : 'Guest')
                    ->map(fn($g, $n) => ['name' => $n, 'count' => $g->count()])->sortByDesc('count')->first())
                    ? $top['name'] : 'N/A',
                'sessions' => $top['count'] ?? 0,
            ]),
        ];
    }

    private function getDailyTrend(Request $request, Carbon $end): array
    {
        $start     = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : (clone $end)->subDays(29)->startOfDay();
        $days      = min(60, max(1, $start->diffInDays($end) + 1));
        $trend     = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $day  = (clone $end)->subDays($i)->toDateString();
            $paid = Booking::where('payment_status', 'paid')->whereDate('starts_at', $day)
                ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
                ->when($request->category, fn($q) => $q->whereHas('facility', fn($f) => $f->where('category', $request->category)));
            $trend[] = ['label' => (clone $end)->subDays($i)->format('d/m'), 'count' => (clone $paid)->count(), 'revenue' => (float) (clone $paid)->sum('total_price')];
        }
        return $trend;
    }

    private function getWeeklyTrend(Request $request, Carbon $end): array
    {
        $trend = [];
        for ($i = 11; $i >= 0; $i--) {
            $wStart = (clone $end)->subWeeks($i)->startOfWeek();
            $wEnd   = (clone $end)->subWeeks($i)->endOfWeek();
            $paid   = Booking::where('payment_status', 'paid')->whereBetween('starts_at', [$wStart, $wEnd])
                ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
                ->when($request->category, fn($q) => $q->whereHas('facility', fn($f) => $f->where('category', $request->category)));
            $trend[] = ['label' => 'W' . $wStart->isoWeek() . ' ' . $wStart->format('M'), 'count' => (clone $paid)->count(), 'revenue' => (float) (clone $paid)->sum('total_price')];
        }
        return $trend;
    }

    private function getMonthlyTrend(Request $request, Carbon $end): array
    {
        $trend = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = (clone $end)->subMonths($i);
            $paid  = Booking::where('payment_status', 'paid')->whereYear('starts_at', $month->year)->whereMonth('starts_at', $month->month)
                ->when($request->facility_id, fn($q) => $q->where('facility_id', $request->facility_id))
                ->when($request->category, fn($q) => $q->whereHas('facility', fn($f) => $f->where('category', $request->category)));
            $trend[] = ['label' => $month->format('M Y'), 'count' => (clone $paid)->count(), 'revenue' => (float) (clone $paid)->sum('total_price')];
        }
        return $trend;
    }

    private function getCategoryBreakdown(Carbon $start, Carbon $end): Collection
    {
        return Booking::with('facility')->where('payment_status', 'paid')->whereBetween('starts_at', [$start, $end])->get()
            ->groupBy(fn(Booking $b) => $b->facility->category ?? 'Lainnya')
            ->map(fn($g, $cat) => ['category' => $cat, 'count' => $g->count(), 'revenue' => (float) $g->sum('total_price')])
            ->values();
    }

    private function getATVData(Collection $paid): array
    {
        return [
            'overall'     => (float) ($paid->count() > 0 ? $paid->avg('total_price') : 0),
            'by_category' => $paid->groupBy(fn($b) => $b->facility->category ?? 'Other')
                ->map(fn($g) => ['count' => $g->count(), 'avg' => (float) $g->avg('total_price')]),
        ];
    }

    private function getOccupancyData(Carbon $start, Carbon $end, Request $request): array
    {
        $days       = $start->diffInDays($end) + 1;
        $facilities = Facility::when($request->facility_id, fn($q, $id) => $q->where('id', $id))
            ->when($request->category, fn($q, $cat) => $q->where('category', $cat))
            ->orderBy('name')->get();

        $stats     = [];
        $totalPct  = 0;

        foreach ($facilities as $f) {
            $open  = Carbon::parse($f->open_time  ?: '06:00');
            $close = Carbon::parse($f->close_time ?: '24:00');
            if ($close->lte($open)) $close->addDay();
            $dailyHours  = max(18, $open->diffInHours($close));
            $potential   = $dailyHours * $days;
            $bookedHours = Booking::where('facility_id', $f->id)->whereIn('payment_status', ['paid', 'settlement'])->whereBetween('starts_at', [$start, $end])->sum('duration_hours');
            $pct         = $potential > 0 ? ($bookedHours / $potential) * 100 : 0;
            $totalPct   += $pct;
            $stats[]     = ['name' => $f->name, 'category' => $f->category, 'booked_hours' => (float) $bookedHours, 'potential_hours' => (float) $potential, 'occupancy_pct' => (float) $pct];
        }

        return ['by_facility' => $stats, 'overall_avg' => count($facilities) > 0 ? $totalPct / count($facilities) : 0];
    }

    private function getHourlyAnalysis(Carbon $start, Carbon $end, Request $request): array
    {
        $counts   = array_fill_keys(array_map(fn($h) => str_pad($h, 2, '0', STR_PAD_LEFT), range(0, 23)), 0);
        $bookings = Booking::where('payment_status', 'paid')->whereBetween('starts_at', [$start, $end])
            ->when($request->facility_id, fn($q, $id) => $q->where('facility_id', $id))
            ->when($request->category, fn($q, $cat) => $q->whereHas('facility', fn($f) => $f->where('category', $cat)))->get();
        foreach ($bookings as $b) {
            $h = $b->starts_at->format('H');
            $counts[$h]++;
        }
        return collect($counts)->map(fn($c, $h) => ['hour' => $h . ':00', 'count' => $c])->values()->toArray();
    }
}
