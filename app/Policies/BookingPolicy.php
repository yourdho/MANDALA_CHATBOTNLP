<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

/**
 * BookingPolicy
 *
 * Sentralisasi aturan otorisasi untuk resource Booking.
 * Menggantikan manual `if ($booking->user_id !== auth()->id()) abort(403)` yang
 * tersebar di beberapa method controller.
 *
 * Registrasi otomatis oleh Laravel melalui model discovery (App\Models\Booking → App\Policies\BookingPolicy).
 */
class BookingPolicy
{
    /**
     * Admin melewati semua policy (before() hook).
     * return true  → izinkan
     * return null  → lanjut ke method policy spesifik
     */
    public function before(User $user): ?bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        return null;
    }

    /**
     * User boleh lihat detail booking miliknya sendiri.
     */
    public function view(User $user, Booking $booking): bool
    {
        return $booking->user_id === $user->id;
    }

    /**
     * User boleh lihat/cetak invoice booking miliknya.
     * Admin sudah di-allow via before().
     */
    public function viewInvoice(User $user, Booking $booking): bool
    {
        return $booking->user_id === $user->id;
    }

    /**
     * User boleh membatalkan booking miliknya yang masih pending.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        return $booking->user_id === $user->id
            && $booking->status === Booking::STATUS_PENDING;
    }

    /**
     * User boleh trigger payment untuk booking miliknya yang masih pending+unpaid.
     */
    public function pay(User $user, Booking $booking): bool
    {
        return $booking->user_id === $user->id
            && $booking->status === Booking::STATUS_PENDING
            && $booking->payment_status !== 'paid';
    }
}
