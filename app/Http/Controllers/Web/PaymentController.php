<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * PaymentController
 *
 * Digunakan hanya untuk generate Snap Token on-demand
 * (dipanggil dari halaman Bookings/Show via AJAX ketika user ingin bayar).
 *
 * Webhook callback Midtrans dihandle secara eksklusif oleh BookingController::callback()
 * yang memiliki: signature verification + transaction lock + conflict handling + refund.
 */
class PaymentController extends Controller
{
    public function __construct(protected MidtransService $midtransService) {}

    /**
     * Generate Snap Token untuk booking milik user yang sedang login.
     *
     * Diperkuat dengan:
     * - Auth middleware (route sudah dilindungi)
     * - Ownership check (hanya pemilik booking yang bisa trigger)
     * - Exception message tidak bocor ke response
     */
    public function createTransaction(Booking $booking): \Illuminate\Http\JsonResponse
    {
        // Policy BookingPolicy::pay() memverifikasi:
        //   1. $booking->user_id === auth()->id()  (ownership)
        //   2. status masih pending dan belum paid  (state check)
        // Jika gagal → 403 AuthorizationException (ditangani oleh Laravel → JSON 403)
        $this->authorize('pay', $booking);

        try {
            $amountToBill = $booking->dp_amount ?? $booking->total_price;
            $snapToken    = $this->midtransService->getSnapToken($booking, $amountToBill);

            if (!$snapToken) {
                throw new \RuntimeException('Gateway tidak mengembalikan token.');
            }

            $booking->update(['snap_token' => $snapToken, 'payment_token' => $snapToken]);

            return response()->json([
                'status'     => 'success',
                'snap_token' => $snapToken,
            ]);
        } catch (\Exception $e) {
            Log::error('[PaymentController::createTransaction] ' . $e->getMessage(), [
                'booking_id' => $booking->id,
                'user_id'    => auth()->id(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Gagal menghubungi payment gateway. Silakan coba beberapa saat lagi.',
            ], 500);
        }
    }
}
