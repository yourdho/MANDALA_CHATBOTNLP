<?php

namespace App\Services;

use App\Contracts\Services\BookingServiceInterface;
use App\Models\Booking;
use App\Models\Facility;
use App\Models\PriceSchedule;
use App\Models\UserReward;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService implements BookingServiceInterface
{
    public function __construct(
        protected RewardService $rewardService
    ) {}

    // ─────────────────────────────────────────────────────────────
    //  Core: Create Booking (User)
    // ─────────────────────────────────────────────────────────────

    public function createBooking(array $data): array
    {
        $facility  = Facility::find($data['facility_id']);
        $startsAt  = Carbon::parse($data['booking_date'] . ' ' . $data['start_time']);
        $endsAt    = Carbon::parse($data['booking_date'] . ' ' . $data['end_time']);
        $isPilates = strtolower($facility->category) === 'pilates';
        $duration  = max(1, $startsAt->diffInHours($endsAt));
        if ($isPilates) $duration = 1;

        return DB::transaction(function () use ($data, $facility, $startsAt, $endsAt, $isPilates, $duration) {

            // 1. Availability check (with row lock)
            if ($this->isSlotTaken($facility->id, $startsAt, $endsAt)) {
                throw new \Exception('Maaf, jadwal ini sudah terisi atau sedang dalam proses pembayaran.');
            }

            // 2. Dynamic price
            $sessionName = $data['session_name'] ?? null;
            $basePrice   = $this->calculatePrice($facility->category, $startsAt, $endsAt, $sessionName);
            if ($basePrice <= 0) $basePrice = $facility->price_per_hour * ($isPilates ? 1 : $startsAt->diffInHours($endsAt));

            // 3. Addons
            $addonData  = $this->calculateAddons($facility, $data['selected_addons'] ?? [], $data['is_with_referee'] ?? false);
            $totalPrice = $basePrice + $addonData['total'];

            // 4. Voucher/Reward discount
            $discountAmount = 0;
            $voucher        = null;
            if (!empty($data['user_reward_id'])) {
                $voucher = UserReward::where('id', $data['user_reward_id'])
                    ->where('user_id', auth()->id())
                    ->lockForUpdate()
                    ->first();

                if ($voucher && $voucher->status === 'unused') {
                    $discountAmount = $this->rewardService->calculateDiscount($totalPrice, $voucher, $facility->category);
                    $totalPrice    -= $discountAmount;
                    $voucher->update(['status' => 'used', 'used_at' => now()]);
                }
            }

            // 5. DP calculation
            $dpAmount    = null;
            $amountToBill = $totalPrice;
            if (in_array($data['payment_method'] ?? '', ['dp_online', 'dp_manual'])) {
                $dpAmount    = $totalPrice * 0.5;
                $amountToBill = $dpAmount;
            }

            // 6. Create booking
            $booking = Booking::create([
                'user_id'            => auth()->id(),
                'guest_name'         => $data['guest_name']  ?? (auth()->check() ? auth()->user()->name  : 'Guest'),
                'guest_email'        => $data['guest_email'] ?? (auth()->check() ? auth()->user()->email : null),
                'guest_phone'        => $data['guest_phone'] ?? (auth()->check() ? auth()->user()->phone : null),
                'facility_id'        => $facility->id,
                'starts_at'          => $startsAt,
                'ends_at'            => $endsAt,
                'duration_hours'     => $duration,
                'total_price'        => $totalPrice,
                'dp_amount'          => $dpAmount,
                'user_reward_id'     => $data['user_reward_id'] ?? null,
                'discount_amount'    => $discountAmount,
                'payment_method'     => $data['payment_method'] ?? null,
                'selected_addons'    => $addonData['addons'],
                'addons_total_price' => $addonData['total'],
                'status'             => Booking::STATUS_PENDING,
                'payment_status'     => 'pending',
            ]);

            return compact('booking', 'dpAmount', 'amountToBill');
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Admin: Manual / Offline Booking
    // ─────────────────────────────────────────────────────────────

    public function createManualBooking(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $facility = Facility::find($data['facility_id']);
            $startsAt = Carbon::parse($data['booking_date'] . ' ' . $data['start_time']);
            $endsAt   = Carbon::parse($data['booking_date'] . ' ' . $data['end_time']);
            $duration = max(1, $startsAt->diffInHours($endsAt));

            if ($this->isSlotTaken($facility->id, $startsAt, $endsAt, ['confirmed', 'pending'], ['paid', 'settlement', 'pending'])) {
                throw new \Exception('Timeline target sudah terisi misi lain.');
            }

            $basePrice  = $this->calculatePrice($facility->category, $startsAt, $endsAt);
            if ($basePrice <= 0) $basePrice = $facility->price_per_hour * $duration;

            return Booking::create([
                'facility_id'    => $facility->id,
                'guest_name'     => $data['guest_name'],
                'guest_phone'    => $data['guest_phone'] ?? 'Offline/Manual',
                'starts_at'      => $startsAt,
                'ends_at'        => $endsAt,
                'duration_hours' => $duration,
                'total_price'    => $basePrice,
                'payment_method' => 'bayar_ditempat',
                'payment_status' => 'paid',
                'status'         => 'confirmed',
            ]);
        });
    }

    // ─────────────────────────────────────────────────────────────
    //  Helpers: Price, Addons, Availability
    // ─────────────────────────────────────────────────────────────

    public function calculatePrice(string $sportType, Carbon $startsAt, Carbon $endsAt, ?string $sessionName = null): float
    {
        $query = PriceSchedule::where('sport_type', $sportType);

        // Pilates: price by session name only
        if (strtolower($sportType) === 'pilates') {
            if ($sessionName) {
                $schedule = (clone $query)->where('session_name', $sessionName)->first();
                return $schedule ? (float) $schedule->price : 0;
            }
            return 0;
        }

        // Other sports: accumulate per-hour price
        $total       = 0;
        $currentTime = clone $startsAt;

        while ($currentTime < $endsAt) {
            $hourStr  = $currentTime->format('H:i:s');
            $schedule = (clone $query)
                ->where('start_time', '<=', $hourStr)
                ->where('end_time',   '>=', $hourStr)
                ->first();

            if (!$schedule && $sessionName) {
                $schedule = (clone $query)->where('session_name', $sessionName)->first();
            }

            $total += $schedule ? (float) $schedule->price : 0;
            $currentTime->addHour();
        }

        return $total;
    }

    /**
     * Calculate addon costs for a booking.
     */
    public function calculateAddons(Facility $facility, array $selectedAddonNames, bool $withReferee): array
    {
        $bookedAddons  = [];
        $addonsTotal   = 0;
        $facilityAddons = collect($facility->addons ?? []);

        foreach ($selectedAddonNames as $addonName) {
            $addonInfo = $facilityAddons->firstWhere('name', $addonName);
            if ($addonInfo) {
                $bookedAddons[] = ['name' => $addonInfo['name'], 'price' => (float) $addonInfo['price']];
                $addonsTotal   += (float) $addonInfo['price'];
            }
        }

        if ($withReferee && !in_array('Wasit', $selectedAddonNames)) {
            $wasit = $facilityAddons->firstWhere('name', 'Wasit');
            if ($wasit) {
                $bookedAddons[] = ['name' => $wasit['name'], 'price' => (float) $wasit['price']];
                $addonsTotal   += (float) $wasit['price'];
            } elseif (str_contains(strtolower($facility->name), 'mini soccer')) {
                $bookedAddons[] = ['name' => 'Wasit (Legacy)', 'price' => 50000];
                $addonsTotal   += 50000;
            }
        }

        return ['addons' => $bookedAddons, 'total' => $addonsTotal];
    }

    public function isSlotTaken(
        int    $facilityId,
        Carbon $startsAt,
        Carbon $endsAt,
        array  $statuses = [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED],
        array  $paymentStatuses = ['paid', 'settlement', 'capture']
    ): bool {
        return Booking::where('facility_id', $facilityId)
            ->whereIn('status', $statuses)
            ->where(function ($q) use ($paymentStatuses) {
                $q->whereIn('payment_status', $paymentStatuses)
                    ->orWhere(function ($qq) {
                        $qq->where('payment_status', 'pending')
                            ->where('created_at', '>', now()->subMinutes(15));
                    });
            })
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->where(fn($qq) => $qq->where('starts_at', '>=', $startsAt)->where('starts_at', '<', $endsAt))
                    ->orWhere(fn($qq) => $qq->where('ends_at', '>', $startsAt)->where('ends_at', '<=', $endsAt))
                    ->orWhere(fn($qq) => $qq->where('starts_at', '<=', $startsAt)->where('ends_at', '>=', $endsAt));
            })
            ->lockForUpdate()
            ->exists();
    }

    public function getAvailableSlots(int $facilityId, string $date): array
    {
        $facility = Facility::find($facilityId);
        if (!$facility) return [];

        $openTime = Carbon::parse($date . ' ' . $facility->open_time);
        $closeTime = Carbon::parse($date . ' ' . $facility->close_time);
        
        $slots = [];
        $current = clone $openTime;
        
        while ($current < $closeTime) {
            $slotStart = clone $current;
            $slotEnd = (clone $current)->addHour();
            
            if (!$this->isSlotTaken($facilityId, $slotStart, $slotEnd)) {
                $slots[] = $slotStart->format('H:i');
            }
            $current->addHour();
        }
        
        return $slots;
    }
}

