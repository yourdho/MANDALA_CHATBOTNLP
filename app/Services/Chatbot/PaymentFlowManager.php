<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Auth;
use App\Models\Facility;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Str;

class PaymentFlowManager
{
    /**
     * Entry point untuk payment flow.
     */
    public function handle(array $conversation, array $nlpResult = []): array
    {
        if (isset($nlpResult['intent']) && in_array($nlpResult['intent'], ['cancel', 'cancel_booking'])) {
            return $this->handleCancellation($conversation);
        }

        $currentState = $conversation['state'] ?? 'WAITING_PAYMENT_METHOD';

        if (isset($nlpResult['intent']) && $nlpResult['intent'] === 'payment_status_check') {
            return $this->checkPaymentStatus($conversation);
        }

        switch ($currentState) {
            case 'WAITING_PAYMENT_METHOD':
                $method = $nlpResult['entities']['payment_method'] ?? null;
                $rawMsg = strtolower($nlpResult['normalized'] ?? '');
                
                // Fallback detection
                if (!$method) {
                    if (str_contains($rawMsg, 'qris') || str_contains($rawMsg, 'gopay') || str_contains($rawMsg, 'ovo') || str_contains($rawMsg, 'ewallet')) $method = 'qris';
                    if (str_contains($rawMsg, 'transfer') || str_contains($rawMsg, 'bca') || str_contains($rawMsg, 'mandiri') || str_contains($rawMsg, 'virtual')) $method = 'virtual_account';
                    if (str_contains($rawMsg, 'cash') || str_contains($rawMsg, 'lokasi')) $method = 'pay_at_venue';
                }

                if ($method) {
                    return $this->selectPaymentMethod($conversation, $method);
                }

                return $this->presentPaymentMethods($conversation);

            case 'CREATING_PAYMENT':
            case 'PAYMENT_PENDING':
                // Check if user wants to change payment method
                if (isset($nlpResult['intent']) && $nlpResult['intent'] === 'reschedule') {
                    return $this->retryPayment($conversation);
                }
                
                return $this->checkPaymentStatus($conversation);

            case 'PAYMENT_FAILED':
            case 'PAYMENT_EXPIRED':
                return $this->retryPayment($conversation);
        }

        return $this->buildResponse('IDLE', 'Ada yang bisa dibantu lagi?', [], $conversation);
    }

    protected function presentPaymentMethods(array $conversation): array
    {
        return $this->buildResponse(
            'WAITING_PAYMENT_METHOD',
            json_encode(['type' => 'payment_method_selection']),
            [],
            $conversation
        );
    }

    protected function selectPaymentMethod(array $conversation, string $method): array
    {
        $user = Auth::user();
        if (!$user) {
            return [
                'state'           => 'ACCOUNT_CHECK',
                'reply'           => 'Eits tunggu dulu, Kakak harus login dulu ya supaya e-ticket aman di akun Kakak. 🛡️',
                'quick_replies'   => [],
                'redirect'        => route('login'),
                'collected_slots' => $conversation['slots'] ?? [],
            ];
        }

        // 1. Buat Draft Booking
        $bookingData = $this->createPendingBooking($conversation);
        if (!$bookingData) {
            return $this->buildResponse('IDLE', 'Wah data bookingnya hilang. Kita ulang yuk?', [['label'=>'Ulang Booking', 'msg'=>'booking']], $conversation);
        }

        $booking = $bookingData['model'];
        $conversation['booking_id'] = $booking->id;
        $conversation['slots']['payment_method'] = $method;

        // 2. Buat Payment Instruction
        $paymentData = $this->createPayment($booking, $method);

        return $this->buildPaymentInstruction($paymentData, $conversation);
    }

    protected function createPendingBooking(array $conversation): ?array
    {
        $slots = $conversation['slots'];
        if (empty($slots['facility_id']) || empty($slots['date']) || empty($slots['time'])) {
            return null;
        }

        $facility = Facility::find($slots['facility_id']);
        if (!$facility) return null;

        $startTime = Carbon::parse($slots['date'] . ' ' . $slots['time']);
        $duration = (int) ($slots['duration'] ?? 1);
        $endTime = $startTime->copy()->addHours($duration);
        $price = $slots['price'] ?? ($facility->price_per_hour * $duration);

        // Cancel previous pending bookings for this flow if any
        if (!empty($conversation['booking_id'])) {
            Booking::where('id', $conversation['booking_id'])->where('status', 'pending')->delete();
        }

        $booking = Booking::create([
            'user_id' => Auth::id(),
            'facility_id' => $facility->id,
            'booking_date' => $slots['date'],
            'start_time' => $startTime->format('H:i:s'),
            'end_time' => $endTime->format('H:i:s'),
            'total_price' => $price,
            'status' => 'pending',
            'payment_status' => 'unpaid'
        ]);

        return [
            'model' => $booking,
            'price' => $price
        ];
    }

    protected function createPayment(Booking $booking, string $method): array
    {
        // Stub: Integrasi Midtrans / Xendit
        // Pada implementation nyata, call API Gateway & simpan external_id

        $reference = 'INV-' . time() . '-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT);
        $expires = now()->addMinutes(15);
        $amount = (float) $booking->total_price;

        $payment = [
            'booking_id' => $booking->id,
            'reference' => $reference,
            'method' => strtoupper($method),
            'amount' => $amount,
            'amount_formatted' => 'Rp ' . number_format($amount, 0, ',', '.'),
            'status' => 'pending',
            'expires_at' => $expires->format('Y-m-d H:i:s'),
            'expires_in_minutes' => 15,
        ];

        // Stub instructions
        if ($method === 'QRIS' || $method === 'EWALLET') {
            $payment['qris_url'] = 'https://api.sandbox.midtrans.com/v2/qris/dummy';
            $payment['method'] = 'QRIS';
        } elseif ($method === 'VIRTUAL_ACCOUNT' || $method === 'BANK_TRANSFER') {
            $payment['va_number'] = '8800' . rand(1000000, 9999999);
            $payment['method'] = 'TRANSFER';
        } else {
            $payment['method'] = 'CASH'; // pay_at_venue
        }

        return $payment;
    }

    protected function buildPaymentInstruction(array $payment, array $conversation): array
    {
        $payload = [
            'type' => 'payment_instruction',
            'method' => $payment['method'],
            'amount' => $payment['amount_formatted'],
            'booking_id' => $payment['reference'],
            'expires_in' => $payment['expires_in_minutes'] . ' Menit',
            'va_number' => $payment['va_number'] ?? null,
            'qris_url' => $payment['qris_url'] ?? null,
        ];

        return $this->buildResponse(
            'PAYMENT_PENDING',
            json_encode($payload),
            [
                ['label' => 'Saya Sudah Bayar ✅', 'msg' => 'cek pembayaran'],
                ['label' => 'Ganti Metode Bayar', 'msg' => 'ganti jadwal']
            ],
            $conversation
        );
    }

    protected function checkPaymentStatus(array $conversation): array
    {
        $bookingId = $conversation['booking_id'] ?? null;
        if (!$bookingId) {
             return $this->buildResponse('IDLE', 'Anda belum memiliki transaksi aktif.', [], $conversation);
        }

        $booking = Booking::find($bookingId);
        
        // Mock Gateway Cek Status
        // Secara aslinya: Midtrans::status($booking->payment_reference);
        $status = $booking ? $booking->payment_status : 'failed';
        
        // --- DEV ONLY MOCK ---
        // Jika kita sengaja mau mentes sukses lewat chat
        $status = 'success'; // (Rubah ke real gateway response di production!)
        
        $paymentInfo = [
            'booking_id' => $booking->id,
            'reference' => 'INV-' . str_pad($bookingId, 5, '0', STR_PAD_LEFT),
            'status' => $status
        ];

        if ($status === 'success' || $status === 'paid') {
            return $this->handlePaymentSuccess($paymentInfo, $conversation);
        } elseif ($status === 'failed') {
            return $this->handlePaymentFailure($paymentInfo, $conversation);
        } elseif ($status === 'expired') {
            return $this->handlePaymentExpired($paymentInfo, $conversation);
        }

        // Masih Pending
        return $this->buildResponse(
            'PAYMENT_PENDING',
            json_encode([
                'type' => 'payment_status',
                'status' => 'pending',
                'booking_id' => $paymentInfo['reference'],
            ]),
            [
                ['label' => 'Cek Lagi', 'msg' => 'cek pembayaran'],
                ['label' => 'Ganti Metode', 'msg' => 'ganti jadwal']
            ],
            $conversation
        );
    }

    protected function handlePaymentSuccess(array $payment, array $conversation): array
    {
        Booking::where('id', $payment['booking_id'])->update([
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $payload = json_encode([
            'type' => 'payment_status',
            'status' => 'success',
            'booking_id' => $payment['reference'],
        ]);

        return $this->buildResponse('BOOKING_CONFIRMED', $payload, [], $conversation);
    }

    protected function handlePaymentFailure(array $payment, array $conversation): array
    {
        Booking::where('id', $payment['booking_id'])->update(['status' => 'failed', 'payment_status' => 'failed']);
        
        $payload = json_encode([
            'type' => 'payment_status',
            'status' => 'failed',
            'booking_id' => $payment['reference'],
        ]);

        return $this->buildResponse('PAYMENT_FAILED', $payload, [['label' => 'Coba Metode Lain', 'msg' => 'ganti metode']], $conversation);
    }

    protected function handlePaymentExpired(array $payment, array $conversation): array
    {
        Booking::where('id', $payment['booking_id'])->update(['status' => 'canceled', 'payment_status' => 'expired']);

        $payload = json_encode([
            'type' => 'payment_status',
            'status' => 'expired',
            'booking_id' => $payment['reference'],
        ]);

        return $this->buildResponse('PAYMENT_EXPIRED', $payload, [['label' => 'Booking Ulang', 'msg' => 'booking']], $conversation);
    }

    protected function retryPayment(array $conversation, ?string $method = null): array
    {
        // Cancel old pending if exists
        if (!empty($conversation['booking_id'])) {
            Booking::where('id', $conversation['booking_id'])
                   ->whereIn('status', ['pending', 'failed'])
                   ->update(['status' => 'canceled']);
        }
        
        $conversation['booking_id'] = null; // reset flow id
        
        if ($method) {
            return $this->selectPaymentMethod($conversation, $method);
        }

        return $this->presentPaymentMethods($conversation);
    }

    protected function handleCancellation(array $conversation): array
    {
        if (!empty($conversation['booking_id'])) {
            Booking::where('id', $conversation['booking_id'])
                   ->where('status', 'pending')
                   ->update(['status' => 'canceled']);
        }
        
        $conversation['slots'] = [];
        return $this->buildResponse(
            'CANCELED',
            'Baiklah, proses pembayaran dibatalkan. Beri tahu saya jika akan merencanakan jadwal lagi! 🙏',
            [],
            $conversation
        );
    }

    protected function buildResponse(string $state, string $reply, array $chips, array $conversation): array
    {
        return [
            'state'           => $state,
            'reply'           => $reply,
            'quick_replies'   => $chips,
            'collected_slots' => $conversation['slots'] ?? [],
            'missing_slots'   => [],
            'booking_summary' => null,
            'next_action'     => null,
            'ready_for_payment'=> false,
        ];
    }
}
