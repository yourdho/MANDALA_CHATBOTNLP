<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct()
    {
        // 1. Config Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * A. createTransaction($booking_id)
     * Generate Snap Token from Midtrans
     */
    public function createTransaction($booking_id)
    {
        try {
            // 2. Ambil data booking
            $booking = Booking::findOrFail($booking_id);

            // 3. Persiapkan parameter Midtrans
            $params = [
                'transaction_details' => [
                    'order_id' => 'MA-' . $booking->id . '-' . time(), // Unique order id
                    'gross_amount' => (int) $booking->total_price,
                ],
                'customer_details' => [
                    'first_name' => $booking->guest_name ?? 'Guest',
                    'email' => $booking->guest_email,
                    'phone' => $booking->guest_phone,
                ],
                'item_details' => [
                    [
                        'id' => $booking->facility_id,
                        'price' => (int) $booking->total_price,
                        'quantity' => 1,
                        'name' => "Booking " . ($booking->facility->name ?? 'Facility'),
                    ]
                ]
            ];

            // 4. Generate Snap Token
            $snapToken = Snap::getSnapToken($params);

            // 5. Simpan snap_token ke database
            $booking->update([
                'snap_token' => $snapToken,
                'payment_token' => $snapToken // Sync with existing column
            ]);

            // 6. Return token
            return response()->json([
                'status' => 'success',
                'snap_token' => $snapToken
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans Create Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * B. callbackHandler()
     * Handle notifikasi dari Midtrans
     */
    public function callbackHandler(Request $request)
    {
        try {
            $payload = $request->all();

            // 7. Security: Validasi signature key dari Midtrans
            // sha512(order_id + status_code + gross_amount + server_key)
            $signature_key = hash("sha512", $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . config('midtrans.server_key'));

            if ($signature_key !== $payload['signature_key']) {
                return response()->json(['message' => 'Invalid Signature'], 403);
            }

            // Extract booking ID from order_id (Format: MA-{id}-{timestamp})
            $orderParts = explode('-', $payload['order_id']);
            $booking_id = $orderParts[1];
            $booking = Booking::findOrFail($booking_id);

            $transactionStatus = $payload['transaction_status'];
            $type = $payload['payment_type'];

            // 8. Update status booking sesuai spesifikasi:
            if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
                // settlement -> paid
                $booking->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);

                // 9. NOTIFIKASI OTOMATIS (Sesuai Step 2)
                $this->sendPaymentNotification($booking);

            } else if ($transactionStatus == 'pending') {
                $booking->update([
                    'payment_status' => 'pending'
                ]);
            } else if ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
                $booking->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled'
                ]);
            }

            return response()->json(['message' => 'Callback handled successfully']);

        } catch (\Exception $e) {
            Log::error('Midtrans Callback Error: ' . $e->getMessage());
            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Helper untuk handle Notifikasi (Step 2)
     */
    private function sendPaymentNotification($booking)
    {
        $message = "Halo {$booking->guest_name}, Pembayaran Booking Mandala Arena anda telah BERHASIL! 🏟️\n\nFasilitas: {$booking->facility->name}\nTanggal: {$booking->starts_at}\nStatus: PAID\n\nSampai jumpa di lapangan! 💪";

        if (!$booking->user_id) {
            // GUEST -> Kirim ke WA (Wajib ada guest_phone)
            if ($booking->guest_phone) {
                Log::info("Kirim WA Guest ke {$booking->guest_phone}: " . $message);
                // Implementation hint: Use your WA API here (e.g. Fonnte, Twilio, etc)
            }
        } else {
            // REGISTERED USER -> Kirim ke WA / Email
            $user = $booking->user;
            Log::info("Kirim WA User ke {$user->phone}: " . $message);
            Log::info("Kirim Email User ke {$user->email}: " . $message);
            // Implementation hint: Mail::to($user->email)->send(new PaymentSuccess($booking));
        }
    }
}
