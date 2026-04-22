<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\MidtransService;
use Carbon\Carbon;

/**
 * PaymentFlowManager
 *
 * Bertanggung jawab HANYA mengorkestrasi percakapan payment di chatbot.
 * Semua logic persistensi (buat booking, update status) didelegasikan ke
 * BookingService. Semua logic gateway (snap token, cek status) didelegasikan
 * ke MidtransService. Flow manager ini TIDAK menyentuh DB secara langsung.
 *
 * State Machine:
 *   WAITING_PAYMENT_METHOD → (metode dipilih) → CREATING_PAYMENT
 *   CREATING_PAYMENT       → (snap token ok)  → PAYMENT_PENDING
 *   PAYMENT_PENDING        → (user klik bayar / cek status) → BOOKING_CONFIRMED / PAYMENT_FAILED / PAYMENT_EXPIRED
 *   PAYMENT_FAILED         → (retry)          → WAITING_PAYMENT_METHOD
 *   PAYMENT_EXPIRED        → (booking ulang)  → IDLE
 */
class PaymentFlowManager
{
    public function __construct(
        protected BookingService  $bookingService,
        protected MidtransService $midtransService
    ) {}

    // ════════════════════════════════════════════════════════════════════════
    // ENTRY POINT
    // ════════════════════════════════════════════════════════════════════════

    public function handle(array $conversation, array $nlpResult = []): array
    {
        $intent       = $nlpResult['intent'] ?? null;
        $currentState = $conversation['state'] ?? 'WAITING_PAYMENT_METHOD';

        // ── Pembatalan kapan saja ────────────────────────────────────────────
        if (in_array($intent, ['cancel', 'cancel_booking'])) {
            return $this->handleCancellation($conversation);
        }

        // ── Cek status pembayaran kapan saja diminta ─────────────────────────
        if ($intent === 'payment_status_check') {
            return $this->checkPaymentStatus($conversation);
        }

        return match ($currentState) {
            'WAITING_PAYMENT_METHOD' => $this->handleMethodSelection($conversation, $nlpResult),
            'CREATING_PAYMENT'       => $this->handleCreatingPayment($conversation, $nlpResult),
            'PAYMENT_PENDING'        => $this->handlePaymentPending($conversation, $nlpResult),
            'PAYMENT_FAILED'         => $this->handleRetryFromFailed($conversation, $nlpResult),
            'PAYMENT_EXPIRED'        => $this->handleExpiredBooking($conversation),
            default                  => $this->presentPaymentMethods($conversation),
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // STATE HANDLERS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * WAITING_PAYMENT_METHOD: Tampilkan pilihan atau proses metode yang sudah dipilih.
     */
    protected function handleMethodSelection(array $conversation, array $nlpResult): array
    {
        $method = $this->resolvePaymentMethod($nlpResult);

        if (!$method) {
            return $this->presentPaymentMethods($conversation);
        }

        return $this->initiatePayment($conversation, $method);
    }

    /**
     * CREATING_PAYMENT: Booking sudah ada, snap token sedang/gagal di-generate.
     * Di state ini user mungkin:
     * - Minta ganti metode pembayaran (reschedule intent / "ganti metode")
     * - Minta cek status (sudah ditangani di entry point)
     * - Konfirmasi ulang (trigger regenerate token)
     */
    protected function handleCreatingPayment(array $conversation, array $nlpResult): array
    {
        $intent     = $nlpResult['intent'] ?? null;
        $normalized = strtolower($nlpResult['normalized'] ?? '');

        // User minta ganti metode pembayaran
        $wantChangeMethod = $intent === 'reschedule'
            || str_contains($normalized, 'ganti metode')
            || str_contains($normalized, 'ganti cara bayar')
            || str_contains($normalized, 'ubah pembayaran');

        if ($wantChangeMethod) {
            // Batalkan booking pending lama dan kembali ke pemilihan metode
            $this->cancelPendingBooking($conversation);
            $conversation['booking_id'] = null;
            $conversation['state']      = 'WAITING_PAYMENT_METHOD';
            return $this->presentPaymentMethods($conversation);
        }

        // Coba lagi generate snap token (misal setelah error sebelumnya)
        $bookingId = $conversation['booking_id'] ?? null;
        if ($bookingId) {
            $booking = Booking::find($bookingId);
            if ($booking) {
                return $this->generateAndServeSnapToken($booking, $conversation);
            }
        }

        // Booking sudah tidak ada, mulai ulang
        return $this->buildResponse(
            'IDLE',
            'Hmm, data transaksi tidak ditemukan. Yuk mulai booking baru Kak! 🔄',
            [['label' => '🏟️ Booking Baru', 'msg' => 'booking']],
            $conversation
        );
    }

    /**
     * PAYMENT_PENDING: Booking & snap token sudah ada, menunggu pembayaran user.
     * User bisa:
     * - Bilang "sudah bayar" / cek status
     * - Minta ganti metode pembayaran
     */
    protected function handlePaymentPending(array $conversation, array $nlpResult): array
    {
        $intent     = $nlpResult['intent'] ?? null;
        $normalized = strtolower($nlpResult['normalized'] ?? '');

        // User minta ganti metode
        $wantChangeMethod = str_contains($normalized, 'ganti metode')
            || str_contains($normalized, 'ganti cara bayar')
            || str_contains($normalized, 'ubah pembayaran');

        if ($wantChangeMethod) {
            $this->cancelPendingBooking($conversation);
            $conversation['booking_id'] = null;
            $conversation['state']      = 'WAITING_PAYMENT_METHOD';
            return $this->presentPaymentMethods($conversation);
        }

        // Default: cek status pembayaran di gateway
        return $this->checkPaymentStatus($conversation);
    }

    /**
     * PAYMENT_FAILED: Tawari user untuk coba metode lain atau booking ulang.
     */
    protected function handleRetryFromFailed(array $conversation, array $nlpResult): array
    {
        $method = $this->resolvePaymentMethod($nlpResult);

        if ($method) {
            // Bersihkan booking lama yang gagal, mulai dengan metode baru
            $this->cancelPendingBooking($conversation);
            $conversation['booking_id'] = null;
            return $this->initiatePayment($conversation, $method);
        }

        // Tawari metode ulang
        return $this->presentPaymentMethods($conversation);
    }

    /**
     * PAYMENT_EXPIRED: Booking sudah hangus, sarankan mulai ulang.
     */
    protected function handleExpiredBooking(array $conversation): array
    {
        $conversation['slots']      = [];
        $conversation['booking_id'] = null;

        return $this->buildResponse(
            'IDLE',
            'Waktu pembayaran sudah habis Kak 😔 Tapi tenang, bisa langsung booking lagi kok! Slot mungkin masih ada. 🙌',
            [['label' => '🔄 Booking Ulang', 'msg' => 'booking']],
            $conversation
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // CORE PAYMENT LOGIC
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Buat booking pending via BookingService, lalu generate Snap Token via MidtransService.
     * Ini adalah single-responsibility: PaymentFlowManager tidak menyentuh DB langsung.
     */
    protected function initiatePayment(array $conversation, string $method): array
    {
        // 1. Guard: harus login
        $user = Auth::user();
        if (!$user) {
            return $this->buildResponse(
                'ACCOUNT_CHECK',
                'Eits, Kakak harus login dulu ya supaya e-ticket tersimpan aman di akun. 🛡️',
                [],
                $conversation,
                redirect: route('login')
            );
        }

        $slots = $conversation['slots'] ?? [];

        // 2. Validasi slot minimal ada
        if (empty($slots['facility_id']) || empty($slots['date']) || empty($slots['time'])) {
            return $this->buildResponse(
                'IDLE',
                'Wah, data bookingnya hilang Kak. Yuk mulai lagi dari awal!',
                [['label' => '🔄 Ulang Booking', 'msg' => 'booking']],
                $conversation
            );
        }

        // 3. Batalkan booking pending lama (jika ada dari percobaan sebelumnya)
        $this->cancelPendingBooking($conversation);

        // 4. Buat booking pending baru via BookingService
        try {
            $startTime = Carbon::parse($slots['date'] . ' ' . $slots['time']);
            $duration  = (int) ($slots['duration'] ?? 1);
            $endTime   = $startTime->copy()->addHours($duration);

            $bookingResult = $this->bookingService->createBooking([
                'facility_id'    => $slots['facility_id'],
                'booking_date'   => $slots['date'],
                'start_time'     => $startTime->format('H:i:s'),
                'end_time'       => $endTime->format('H:i:s'),
                'payment_method' => $method,
                'guest_name'     => $user->name,
                'guest_email'    => $user->email,
                'guest_phone'    => $user->phone ?? '',
                // Add-ons dari slots chatbot → peta ke struktur BookingService
                'selected_addons' => $this->mapChatbotAddons($slots),
                'is_with_referee' => $slots['addon_wasit'] ?? false,
            ]);
        } catch (\Exception $e) {
            // Double booking atau error lain dari BookingService
            if (str_contains($e->getMessage(), 'terisi') || str_contains($e->getMessage(), 'pending')) {
                return $this->buildResponse(
                    'IDLE',
                    'Waduh Kak 😱 Barusan banget slot ini dibooking orang lain. Coba geser jamnya ya!',
                    [['label' => '🔄 Ganti Jadwal', 'msg' => 'ganti jadwal']],
                    $conversation
                );
            }

            Log::error('[PaymentFlowManager] createBooking error: ' . $e->getMessage());
            return $this->buildResponse(
                'IDLE',
                'Ada kendala teknis saat membuat booking Kak. Coba lagi atau hubungi admin ya. 🙏',
                [['label' => '📞 Hubungi Admin', 'msg' => 'hubungi admin']],
                $conversation
            );
        }

        $booking = $bookingResult['booking'];
        $conversation['booking_id']              = $booking->id;
        $conversation['slots']['payment_method'] = $method;
        $conversation['state']                   = 'CREATING_PAYMENT';

        // 5. Generate Midtrans Snap Token
        return $this->generateAndServeSnapToken($booking, $conversation);
    }

    /**
     * Generate Snap Token via MidtransService dan sajikan payment_instruction card.
     */
    protected function generateAndServeSnapToken(Booking $booking, array $conversation): array
    {
        $amountToBill = $booking->dp_amount ?? $booking->total_price;

        $snapToken = $this->midtransService->getSnapToken($booking, $amountToBill);

        if (!$snapToken) {
            // Token gagal didapat — tetap di CREATING_PAYMENT agar user bisa retry
            Log::warning('[PaymentFlowManager] Snap token null untuk booking #' . $booking->id);

            return $this->buildResponse(
                'CREATING_PAYMENT',
                'Gagal menghubungi gateway pembayaran Kak. Coba tunggu sebentar lalu ketik "cek pembayaran" ya. 🔄',
                [
                    ['label' => '🔄 Coba Lagi',   'msg' => 'cek pembayaran'],
                    ['label' => '🔀 Ganti Metode', 'msg' => 'ganti metode'],
                ],
                $conversation
            );
        }

        // Simpan snap_token di booking supaya bisa dipakai di checkout page
        $booking->update(['snap_token' => $snapToken]);

        $payload = [
            'type'       => 'payment_instruction',
            'method'     => strtoupper($conversation['slots']['payment_method'] ?? 'MIDTRANS'),
            'amount'     => 'Rp ' . number_format((float) $amountToBill, 0, ',', '.'),
            'booking_id' => $booking->booking_code,
            'snap_token' => $snapToken,
            'expires_in' => '15 Menit',
        ];

        return $this->buildResponse(
            'PAYMENT_PENDING',
            json_encode($payload),
            [
                ['label' => '✅ Saya Sudah Bayar',  'msg' => 'cek pembayaran'],
                ['label' => '🔀 Ganti Metode Bayar', 'msg' => 'ganti metode'],
            ],
            $conversation
        );
    }

    /**
     * Cek status pembayaran dari DB (field payment_status yang di-update via Midtrans webhook).
     * TIDAK melakukan poll langsung ke Midtrans API — webhook yang update statusnya.
     */
    protected function checkPaymentStatus(array $conversation): array
    {
        $bookingId = $conversation['booking_id'] ?? null;

        if (!$bookingId) {
            return $this->buildResponse(
                'IDLE',
                'Kakak belum punya transaksi aktif. Mau mulai booking baru?',
                [['label' => '🏟️ Booking Sekarang', 'msg' => 'booking']],
                $conversation
            );
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            return $this->buildResponse(
                'IDLE',
                'Data transaksi tidak ditemukan. Yuk mulai booking baru Kak!',
                [['label' => '🔄 Booking Baru', 'msg' => 'booking']],
                $conversation
            );
        }

        $paymentStatus = $booking->payment_status;

        // Normalisasi status dari Midtrans webhook → internal status
        return match (true) {
            in_array($paymentStatus, ['paid', 'settlement', 'capture']) => $this->handlePaymentSuccess($booking, $conversation),
            in_array($paymentStatus, ['deny', 'cancel', 'failure'])     => $this->handlePaymentFailure($booking, $conversation),
            $paymentStatus === 'expire'                                  => $this->handlePaymentExpiry($booking, $conversation),
            default                                                       => $this->buildPendingStatusResponse($booking, $conversation),
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // PAYMENT STATUS HANDLERS (Delegasi ke BookingService untuk persistensi)
    // ════════════════════════════════════════════════════════════════════════

    protected function handlePaymentSuccess(Booking $booking, array $conversation): array
    {
        // Status update sudah dilakukan oleh webhook Midtrans di BookingController@callback
        // Flow manager hanya menampilkan hasil ke user

        $templates = [
            "Hore! 🎉 Pembayaran **{$booking->booking_code}** sudah **LUNAS**! E-ticket bisa dilihat di menu Riwayat Booking. Sampai ketemu di lapangan Kak! 🏟️",
            "Mantap! ✅ Pembayaran untuk **{$booking->booking_code}** berhasil dikonfirmasi. Selamat main Kak! Cek e-ticket di Riwayat Booking ya.",
            "Yeay, pembayaran sukses! 🙌 Booking **{$booking->booking_code}** sudah aktif. Silakan cek detail di halaman Riwayat Booking.",
        ];

        $payload = json_encode([
            'type'       => 'payment_status',
            'status'     => 'success',
            'booking_id' => $booking->booking_code,
        ]);

        // Reset session setelah sukses
        $conversation['slots']      = [];
        $conversation['booking_id'] = null;

        return $this->buildResponse(
            'BOOKING_CONFIRMED',
            $payload,
            [['label' => '📋 Lihat E-Ticket', 'msg' => 'riwayat booking']],
            $conversation,
            redirect: route('bookings.show', $booking->id)
        );
    }

    protected function handlePaymentFailure(Booking $booking, array $conversation): array
    {
        $templates = [
            "Waduh, pembayaran **{$booking->booking_code}** gagal Kak. 😔 Tapi tenang, coba dengan metode lain yuk!",
            "Pembayaran tidak berhasil nih Kak. 💳 Mungkin coba metode bayar lain? Mandalabot siap bantu!",
            "Hmm, transaksi ditolak untuk **{$booking->booking_code}**. Mau coba QRIS atau Transfer Bank? 🔄",
        ];

        $payload = json_encode([
            'type'       => 'payment_status',
            'status'     => 'failed',
            'booking_id' => $booking->booking_code,
        ]);

        return $this->buildResponse(
            'PAYMENT_FAILED',
            $payload,
            [
                ['label' => '🔄 Coba Metode Lain', 'msg' => 'ganti metode'],
                ['label' => '❌ Batalkan',          'msg' => 'batal'],
            ],
            $conversation
        );
    }

    protected function handlePaymentExpiry(Booking $booking, array $conversation): array
    {
        $payload = json_encode([
            'type'       => 'payment_status',
            'status'     => 'expired',
            'booking_id' => $booking->booking_code,
        ]);

        $conversation['slots']      = [];
        $conversation['booking_id'] = null;

        return $this->buildResponse(
            'PAYMENT_EXPIRED',
            $payload,
            [['label' => '🔄 Booking Ulang', 'msg' => 'booking']],
            $conversation
        );
    }

    protected function buildPendingStatusResponse(Booking $booking, array $conversation): array
    {
        $templates = [
            "Pembayaran **{$booking->booking_code}** masih menunggu konfirmasi Kak. ⏳ Kalau sudah bayar, biasanya 1–3 menit langsung terkonfirmasi otomatis.",
            "Masih pending nih Kak 🕐 Setelah pembayaran selesai, status akan berubah otomatis. Mau cek lagi?",
            "Mandalabot cek tadi — pembayaran belum masuk. ⏳ Tunggu sebentar lalu ketik \"cek pembayaran\" lagi ya Kak.",
        ];

        $payload = json_encode([
            'type'       => 'payment_status',
            'status'     => 'pending',
            'booking_id' => $booking->booking_code,
        ]);

        return $this->buildResponse(
            'PAYMENT_PENDING',
            $payload,
            [
                ['label' => '🔄 Cek Lagi',         'msg' => 'cek pembayaran'],
                ['label' => '🔀 Ganti Metode',      'msg' => 'ganti metode'],
                ['label' => '❌ Batalkan',           'msg' => 'batal'],
            ],
            $conversation
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // CANCELLATION
    // ════════════════════════════════════════════════════════════════════════

    protected function handleCancellation(array $conversation): array
    {
        $this->cancelPendingBooking($conversation);

        $conversation['slots']      = [];
        $conversation['booking_id'] = null;

        $templates = [
            'Baiklah, proses pembayaran dibatalkan. Kapanpun Kakak mau booking lagi, Mandalabot siap! 🙏',
            'Oke, dibatalkan. Semoga lain kali bisa main di Mandala Arena ya Kak! 🏟️',
            'Proses pembayaran sudah di-stop. Kalau mau coba lagi, tinggal bilang "booking" aja Kak! 😊',
        ];

        return $this->buildResponse(
            'CANCELED',
            $templates[array_rand($templates)],
            [['label' => '🏟️ Booking Baru', 'msg' => 'booking']],
            $conversation
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Tampilkan UI card pilihan metode pembayaran.
     */
    protected function presentPaymentMethods(array $conversation): array
    {
        return $this->buildResponse(
            'WAITING_PAYMENT_METHOD',
            json_encode(['type' => 'payment_method_selection']),
            [],
            $conversation
        );
    }

    /**
     * Resolve metode pembayaran dari entities NLP atau teks bebas.
     * Mengembalikan string metode (QRIS/TRANSFER/CASH) atau null jika tidak terdeteksi.
     */
    protected function resolvePaymentMethod(array $nlpResult): ?string
    {
        // 1. Prioritas: entity yang sudah diekstrak EntityExtractor
        $method = $nlpResult['entities']['payment_method'] ?? null;
        if ($method) return strtoupper($method);

        // 2. Fallback: substring match pada teks normalisasi
        $raw = strtolower($nlpResult['normalized'] ?? '');

        $methodMap = [
            'QRIS'     => ['qris', 'gopay', 'ovo', 'dana', 'shopeepay', 'ewallet', 'scan'],
            'TRANSFER' => ['transfer', 'virtual account', 'va', 'bca', 'mandiri', 'bni', 'bri', 'bank'],
            'CASH'     => ['cash', 'tunai', 'bayar di tempat', 'bayar lokasi', 'ditempat'],
        ];

        foreach ($methodMap as $key => $keywords) {
            foreach ($keywords as $kw) {
                if (str_contains($raw, $kw)) return $key;
            }
        }

        return null;
    }

    /**
     * Batalkan booking pending lama yang ada di conversation (hindari booking orphan).
     * Tidak lempar exception jika booking tidak ditemukan — silent cancel.
     */
    protected function cancelPendingBooking(array $conversation): void
    {
        $bookingId = $conversation['booking_id'] ?? null;
        if (!$bookingId) return;

        try {
            Booking::where('id', $bookingId)
                   ->whereIn('status', [Booking::STATUS_PENDING])
                   ->whereIn('payment_status', ['pending'])
                   ->update([
                       'status'         => Booking::STATUS_CANCELLED,
                       'payment_status' => 'cancel',
                   ]);
        } catch (\Exception $e) {
            Log::warning('[PaymentFlowManager] cancelPendingBooking error: ' . $e->getMessage());
        }
    }

    /**
     * Petakan add-ons dari slot chatbot ke format array BookingService::createBooking().
     * BookingService menerima 'selected_addons' (array string nama addon).
     */
    protected function mapChatbotAddons(array $slots): array
    {
        $addons = [];
        if (!empty($slots['addon_fotografer'])) $addons[] = 'Fotografer';
        // Wasit di-handle via is_with_referee flag agar sesuai BookingService@calculateAddons
        return $addons;
    }

    /**
     * Standardized response array — compatible dengan ChatbotService::mergeResponse().
     */
    protected function buildResponse(
        string  $state,
        string  $reply,
        array   $chips,
        array   $conversation,
        ?string $redirect = null
    ): array {
        return [
            'state'            => $state,
            'reply'            => $reply,
            'quick_replies'    => $chips,
            'collected_slots'  => $conversation['slots'] ?? [],
            'missing_slots'    => [],
            'booking_summary'  => null,
            'next_action'      => null,
            'ready_for_payment'=> false,
            'addons_prompt'    => null,
            'addons_chips'     => [],
            'redirect'         => $redirect,
        ];
    }
}
