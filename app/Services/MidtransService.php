<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Get SNAP Token from Midtrans.
     *
     * @param \App\Models\Booking $booking
     * @return string|null
     */
    /**
     * Get SNAP Token from Midtrans.
     *
     * @param \App\Models\Booking $booking
     * @param float|null $override_amount
     * @return string|null
     */
    public function getSnapToken($booking, $override_amount = null)
    {
        $amount = $override_amount ?? $booking->total_price;

        $params = [
            'transaction_details' => [
                'order_id' => 'BOOK-' . $booking->id . '-' . time(),
                'gross_amount' => (int) $amount,
            ],
            'customer_details' => [
                'first_name' => $booking->user->name,
                'email' => $booking->user->email,
                'phone' => $booking->user->phone,
            ],
            // Memaksa opsi Transfer Bank & QRIS keluar di antarmuka Midtrans
            'enabled_payments' => [
                'qris',
                'gopay',
                'shopeepay',
                'bank_transfer',
                'bca_va',
                'bni_va',
                'bri_va',
                'echannel', // Mandiri Bill
                'permata_va',
                'other_va'
            ],
            'item_details' => [
                [
                    'id' => 'FAC-' . $booking->facility_id,
                    'price' => (int) $amount, // Simplify item_details so it aligns with DP
                    'quantity' => 1,
                    'name' => 'Pembayaran Sewa ' . $booking->facility->name,
                ],
            ],
        ];

        try {
            return Snap::getSnapToken($params);
        } catch (\Exception $e) {
            \Log::error('Midtrans Error: ' . $e->getMessage());
            return null;
        }
    }
}
