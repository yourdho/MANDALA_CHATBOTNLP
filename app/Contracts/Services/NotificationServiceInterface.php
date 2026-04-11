<?php

namespace App\Contracts\Services;

interface NotificationServiceInterface
{
    /**
     * Notify a customer that their booking was confirmed successfully.
     *
     * @param \App\Models\Booking $booking
     */
    public function notifyBookingSuccess(\App\Models\Booking $booking): void;

    /**
     * Notify a customer that their booking was cancelled due to a slot conflict.
     *
     * @param \App\Models\Booking $booking
     */
    public function notifyBookingConflict(\App\Models\Booking $booking): void;

    /**
     * Generate a WhatsApp admin contact link for a given booking.
     *
     * @param \App\Models\Booking $booking
     * @return string
     */
    public function generateAdminWhatsAppLink(\App\Models\Booking $booking): string;
}
