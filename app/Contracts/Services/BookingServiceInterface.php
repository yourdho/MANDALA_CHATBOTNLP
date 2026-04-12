<?php

namespace App\Contracts\Services;

use App\Models\Booking;
use App\Models\Facility;
use Carbon\Carbon;

interface BookingServiceInterface
{
    /**
     * Create a new booking from validated HTTP request data.
     * Handles conflict checking, price calculation, addon calculation,
     * discount application, and Booking model creation — all in one transaction.
     *
     * @param array $data Validated request data
     * @return array{booking: Booking, dp_amount: float|null, amount_to_bill: float}
     * @throws \Exception if slot is already taken
     */
    public function createBooking(array $data): array;

    /**
     * Create an offline/manual booking (admin only).
     *
     * @param array $data Validated request data
     * @return Booking
     * @throws \Exception if slot is already taken
     */
    public function createManualBooking(array $data): Booking;

    /**
     * Calculate the dynamic price for a given sport type and time range.
     *
     * @param string $sportType
     * @param Carbon $startsAt
     * @param Carbon $endsAt
     * @param string|null $sessionName For Pilates sessions
     * @return float
     */
    public function calculatePrice(string $sportType, Carbon $startsAt, Carbon $endsAt, ?string $sessionName = null): float;

    /**
     * Calculate addon costs for a booking.
     *
     * @param Facility $facility
     * @param array $selectedAddonNames
     * @param bool $withReferee
     * @return array{addons: array, total: float}
     */
    public function calculateAddons(Facility $facility, array $selectedAddonNames, bool $withReferee): array;

    /**
     * Check if a slot is already taken for a given facility and time range.
     *
     * @param int $facilityId
     * @param Carbon $startsAt
     * @param Carbon $endsAt
     * @return bool
     */
    public function isSlotTaken(
        int    $facilityId,
        Carbon $startsAt,
        Carbon $endsAt,
        array  $statuses = [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED],
        array  $paymentStatuses = ['paid', 'settlement', 'capture']
    ): bool;
}
