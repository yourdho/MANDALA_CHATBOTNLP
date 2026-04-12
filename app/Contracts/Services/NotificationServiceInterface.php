<?php

namespace App\Contracts\Services;

use App\Models\Booking;

interface NotificationServiceInterface
{
    /**
     * Notify a customer that their booking was confirmed successfully.
     *
     * @param Booking $booking
     */
    public function notifyBookingSuccess(Booking $booking): void;

    /**
     * Notify a customer that their booking was cancelled due to a slot conflict.
     *
     * @param Booking $booking
     */
    public function notifyBookingConflict(Booking $booking): void;

    /**
     * Generate a WhatsApp admin contact link for a given booking.
     *
     * @param Booking $booking
     * @return string
     */
    public function generateAdminWhatsAppLink(Booking $booking): string;
}
