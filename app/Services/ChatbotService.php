<?php

namespace App\Services;

use App\Contracts\Services\ChatbotServiceInterface;
use App\Events\ChatbotMessageReceived;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use App\Services\Nlp\NlpPipeline;
use App\Services\Chatbot\BookingFlowManager;
use App\Services\Chatbot\PaymentFlowManager;

class ChatbotService implements ChatbotServiceInterface
{
    public function __construct(
        protected NlpPipeline $nlpPipeline,
        protected BookingFlowManager $bookingFlowManager,
        protected PaymentFlowManager $paymentFlowManager,
        protected \App\Services\Chatbot\ChatbotLogger $chatbotLogger // Inject logger
    ) {}

    public function normalize(string $message): string
    {
        return $this->nlpPipeline->process($message)['normalized'];
    }

    public function detectIntent(string $message): string
    {
        return $this->nlpPipeline->process($message)['intent'];
    }

    public function facilityChips(): array
    {
        return [
            ['label' => 'Mini Soccer ⚽', 'msg' => 'Mini Soccer'],
            ['label' => 'Padel Court 🎾', 'msg' => 'Padel'],
            ['label' => 'Pilates 🧘‍♀️', 'msg' => 'Pilates'],
            ['label' => 'Basket 🏀', 'msg' => 'Basket'],
        ];
    }

    public function broadcast(string $text): void
    {
        try {
            \Illuminate\Support\Facades\Event::dispatch(new ChatbotMessageReceived($text, Auth::id()));
        } catch (\Exception $e) {
            Log::warning('Reverb broadcast error: ' . $e->getMessage());
        }
    }

    /**
     * Entry point utama aliran chatbot
     */
    public function processMessage(string $message, string $state = null): array
    {
        // Debug Mode Check
        if (str_starts_with(strtolower(trim($message)), '!debug')) {
            $debugMessage = trim(substr(trim($message), 6));
            return $this->handleDebugMode($debugMessage, $state);
        }

        // LIMITASI: Cegah ReDoS & Payload besar
        if (strlen($message) > 255) {
            return [
                'reply' => "Maaf Kak, pesan terlalu panjang. Singkat saja ya agar mudah dimengerti.",
                'chips' => [],
                'redirect' => null,
                'ui' => ['type' => 'text', 'payload' => []],
                'meta' => []
            ];
        }

        $conversation = $this->loadConversation();
        
        // 1. Jalankan NLP Analysis
        $nlpResult = $this->nlpPipeline->process($message);
        
        // 2 & 3. Cancellation & Routing Berdasarkan State & Intent
        if (in_array($nlpResult['intent'], ['cancel', 'cancel_booking'])) {
             $flowResult = $this->handleCancellation($conversation);
        } else {
             $flowResult = $this->routeIntent($conversation, $nlpResult);
        }

        // 4. Persistence State
        $this->persistConversation($flowResult['conversation']);

        // 5. Mapping Untuk Kontrak Lama (Backward Compatible dgn ChatbotController saat ini)
        // Reply harus diisi string (Teks natural atau stringified JSON dari UI Payload)
        $reply = $flowResult['reply'];
        if ($flowResult['ui']['type'] !== 'text' && !empty($flowResult['ui']['payload'])) {
            $reply = json_encode($flowResult['ui']['payload']);
        }

        return [
            'reply' => $reply,
            'chips' => collect($flowResult['quick_replies'] ?? [])->map(fn($q) => ['label' => $q['label'], 'msg' => $q['msg']])->toArray(),
            'redirect' => $flowResult['meta']['redirect'] ?? null,
            'ui' => $flowResult['ui'],
            'meta' => $flowResult['meta'] ?? []
        ];
    }

    protected function loadConversation(array $context = []): array
    {
        $lastActive = Session::get('chatbot_last_active', 0);
        $now = time();
        
        // Timeout 30 Menit (1800 detik)
        if ($now - $lastActive > 1800) {
             // Sesi Menggantung (Context Timeout): Reset paksa ke default
             Session::forget(['chatbot_state', 'chatbot_booking_slots', 'chatbot_booking_id']);
        }

        return [
            'state' => Session::get('chatbot_state', 'IDLE'),
            'slots' => Session::get('chatbot_booking_slots', []),
            'booking_id' => Session::get('chatbot_booking_id', null)
        ];
    }

    protected function persistConversation(array $conversation): void
    {
        Session::put('chatbot_state', $conversation['state'] ?? 'IDLE');
        Session::put('chatbot_last_active', time());
        
        if (isset($conversation['slots'])) Session::put('chatbot_booking_slots', $conversation['slots']);
        if (isset($conversation['booking_id'])) Session::put('chatbot_booking_id', $conversation['booking_id']);
    }

    protected function routeIntent(array $conversation, array $nlpResult): array
    {
        $currentState = $conversation['state'] ?? 'IDLE';
        $intent = $nlpResult['intent'];
        $score = $nlpResult['confidence'] ?? 0;
        $thresholds = config('chatbot_nlp.thresholds');

        $isBookingState = in_array($currentState, [
            'COLLECTING_FACILITY', 'COLLECTING_DATE', 'COLLECTING_TIME', 'COLLECTING_DURATION',
            'BOOKING_SUMMARY', 'WAITING_CONFIRMATION', 'CHECKING_AVAILABILITY',
            'SLOT_OFFERED', 'WAITING_ADDONS_CONFIRMATION',
        ]);
        $isPaymentState = in_array($currentState, ['WAITING_PAYMENT_METHOD', 'CREATING_PAYMENT', 'PAYMENT_PENDING', 'ACCOUNT_CHECK']);

        // Explicit Intent Overrides yang harus menangkap konteks mutlak
        if ($intent === 'payment_status_check') {
            $conversation['state'] = 'PAYMENT_PENDING';
            return $this->handlePaymentIntent($conversation, $nlpResult);
        }

        if ($currentState === 'IDLE' && in_array($intent, ['booking', 'availability_check'])) {
            $conversation['state'] = 'COLLECTING_FACILITY';
            return $this->handleBookingIntent($conversation, $nlpResult);
        }

        // --- STATE-FIRST ROUTING (Context Priority) ---
        if ($isBookingState) {
            // ── CONTEXT-SWITCHING: Interupsi General Info di tengah Booking ──────
            // Jika user sedang booking tapi tiba-tiba tanya harga/fasilitas/lokasi,
            // jawab pertanyaannya dulu LALU ingatkan kembali ke booking yang berjalan.
            // State & slots TIDAK direset.
            $contextSwitchIntents = ['price_check', 'facility_info', 'location_info', 'operating_hours', 'promo_info', 'payment_help', 'contact'];
            if (in_array($intent, $contextSwitchIntents)) {
                return $this->handleContextSwitch($conversation, $nlpResult);
            }

            if (in_array($intent, ['unknown', 'low_confidence'])) {
                $this->chatbotLogger->logUnrecognized($nlpResult['normalized'] ?? '', $nlpResult['entities'] ?? []);
            }
            return $this->handleBookingIntent($conversation, $nlpResult);
        }

        if ($isPaymentState) {
            if (in_array($intent, ['unknown', 'low_confidence'])) {
                $this->chatbotLogger->logUnrecognized($nlpResult['normalized'] ?? '', $nlpResult['entities'] ?? []);
            }
            return $this->handlePaymentIntent($conversation, $nlpResult);
        }

        // --- IDLE / GENERAL ROUTING ---
        // Log unrecognized input untuk continuous learning jika di luar flow
        if (in_array($intent, ['unknown', 'low_confidence'])) {
            $this->chatbotLogger->logUnrecognized($nlpResult['normalized'] ?? '', $nlpResult['entities'] ?? []);
        }

        // Pengecekan low confidence / klarifikasi hanya boleh dijalankan jika status bukan Booking/Payment
        if ($score < ($thresholds['low_confidence'] ?? 4)) {
            return $this->buildClarificationResponse($nlpResult, $conversation);
        }

        // Fallback: Informational / General Intent
        return $this->handleGeneralIntent($conversation, $nlpResult);
    }

    protected function handleBookingIntent(array $conversation, array $nlpResult): array
    {
        $result = $this->bookingFlowManager->handle($conversation, $nlpResult);
        
        // Pindah otomatis ke payment jika booking konfirmasi beres
        if (!empty($result['ready_for_payment'])) {
            $conversation['state'] = 'WAITING_PAYMENT_METHOD';
            // We pass a 'null' nlp result or specifically empty to trigger the selection card
            return $this->handlePaymentIntent($conversation, []); 
        }

        return $this->mergeResponse($this->baseResponseStruct($conversation, $nlpResult), $result);
    }

    protected function handlePaymentIntent(array $conversation, array $nlpResult): array
    {
        $result = $this->paymentFlowManager->handle($conversation, $nlpResult);
        return $this->mergeResponse($this->baseResponseStruct($conversation, $nlpResult), $result);
    }

    /**
     * Handle Context-Switching: user bertanya hal general DI TENGAH booking.
     * Jawab pertanyaannya, lalu tambahkan reminder booking yang sedang berjalan.
     * State & slots TIDAK diubah — preservasi ingatan penuh.
     */
    protected function handleContextSwitch(array $conversation, array $nlpResult): array
    {
        $intent    = $nlpResult['intent'];
        $generator = $this->nlpPipeline->getResponseGenerator();
        $slots     = $conversation['slots'] ?? [];

        // 1. Dapatkan jawaban general intent
        $rawReply  = $generator->generate($intent, [], null, null, null, $nlpResult['ambiguous_intents'] ?? []);
        $baseReply = is_array($rawReply) ? ($rawReply['reply'] ?? '') : $rawReply;

        // 2. Append reminder kontekstual berdasarkan slot yang sudah terkumpul
        $reminder  = $generator->appendContextReminder($baseReply, $slots, $conversation['state'] ?? 'IDLE');

        // 3. Build response — state TIDAK berubah, chips diarahkan ke lanjut booking
        $base = $this->baseResponseStruct($conversation, $nlpResult);
        $base['reply'] = $reminder;
        $base['quick_replies'] = [
            ['label' => '✅ Lanjut Booking',  'msg' => 'lanjut'],
            ['label' => '❌ Batal Sekarang',  'msg' => 'batal'],
        ];
        // Pertahankan state agar booking flow tidak terputus
        $base['state'] = $conversation['state'];
        $base['conversation']['state'] = $conversation['state'];

        return $base;
    }

    protected function handleGeneralIntent(array $conversation, array $nlpResult): array
    {
        $intent = $nlpResult['intent'];
        $generator = $this->nlpPipeline->getResponseGenerator();

        $chips = [];
        if ($intent === 'greeting')      $chips = $this->facilityChips();
        if ($intent === 'facility_info') $chips = [['label' => 'Cek Harga', 'msg' => 'harga'], ['label' => 'Booking Sekarang', 'msg' => 'booking']];
        if ($intent === 'location_info') $chips = [['label' => 'Buka Maps', 'msg' => 'rute']];
        if ($intent === 'price_check')   $chips = [['label' => 'Booking Sekarang', 'msg' => 'booking'], ['label' => 'Info Fasilitas', 'msg' => 'fasilitas']];

        $rawReply = $generator->generate($intent, $chips, null, null, null, $nlpResult['ambiguous_intents'] ?? []);

        $base = $this->baseResponseStruct($conversation, $nlpResult);
        $base['reply'] = is_array($rawReply) ? $rawReply['reply'] : $rawReply;
        $base['quick_replies'] = $chips;

        return $base;
    }

    protected function handleCancellation(array $conversation): array
    {
        $conversation['state'] = 'IDLE';
        $conversation['slots'] = [];
        $conversation['booking_id'] = null;
        $this->persistConversation($conversation);

        $base = $this->baseResponseStruct($conversation, ['intent' => 'cancel']);
        $base['reply'] = 'Dibatalkan dengan sukses! Beritahu saya jika merencanakan jadwal lagi.';
        $base['quick_replies'] = [['label' => 'Booking Jadwal', 'msg' => 'booking']];
        
        return $base;
    }

    protected function buildClarificationResponse(array $nlpResult, array $conversation): array
    {
        $base = $this->baseResponseStruct($conversation, $nlpResult);
        $base['reply'] = "Maaf, saya agak bingung. Apakah maksud Anda ingin Booking atau Cek Jadwal?";
        $base['quick_replies'] = [
            ['label' => 'Booking Lapangan', 'msg' => 'booking'],
            ['label' => 'Cek Harga', 'msg' => 'harga'],
            ['label' => 'Bantuan Lain', 'msg' => 'bantuan']
        ];
        return $base;
    }

    protected function baseResponseStruct(array $conversation, array $nlpResult): array
    {
        return [
            'reply' => '',
            'state' => $conversation['state'] ?? 'IDLE',
            'intent' => $nlpResult['intent'] ?? 'unknown',
            'confidence' => $nlpResult['confidence'] ?? 1.0,
            'conversation' => $conversation,
            'ui' => [
                'type' => 'text',
                'payload' => []
            ],
            'quick_replies' => [],
            'meta' => [
                'ready_for_payment' => false,
                'payment_required' => false,
                'booking_reference' => $conversation['booking_id'] ?? null,
            ]
        ];
    }

    protected function mergeResponse(array $base, array $flowResult): array
    {
        // Decode JSON payload from Flow Managers to match struct UI rules
        $uiType = 'text';
        $uiPayload = [];
        
        if (str_starts_with($flowResult['reply'] ?? '', '{')) {
            $parsed = json_decode($flowResult['reply'], true);
            if (json_last_error() === JSON_ERROR_NONE && isset($parsed['type'])) {
                $uiType = $parsed['type'];
                $uiPayload = $parsed;
            }
        }

        $base['reply']         = $flowResult['reply'] ?? $base['reply'];
        $base['state']         = $flowResult['state'] ?? $base['state'];
        $base['conversation']['state'] = $flowResult['state'] ?? $base['state'];
        $base['conversation']['slots'] = $flowResult['collected_slots'] ?? $base['conversation']['slots'];
        $base['quick_replies'] = $flowResult['quick_replies'] ?? $base['quick_replies'];
        $base['ui']['type']    = $uiType;
        $base['ui']['payload'] = $uiPayload;
        $base['meta']['redirect'] = $flowResult['redirect'] ?? null;
        $base['meta']['ready_for_payment'] = $flowResult['ready_for_payment'] ?? false;
        $base['meta']['payment_required'] = in_array($base['state'], ['WAITING_PAYMENT_METHOD', 'PAYMENT_PENDING']);
        $base['meta']['booking_reference'] = $base['conversation']['booking_id'] ?? null;

        // Add-ons prompt diteruskan ke meta agar ChatbotController / Frontend bisa render pesan lanjutan
        if (!empty($flowResult['addons_prompt'])) {
            $base['meta']['addons_prompt'] = $flowResult['addons_prompt'];
            $base['meta']['addons_chips']  = $flowResult['addons_chips'] ?? [];
        }
        
        // Pass specifically requested UI types down if present
        if ($flowResult['next_action'] === 'payment_method_selection') {
            $base['ui']['type'] = 'payment_method_selection';
            $base['ui']['payload'] = ['type' => 'payment_method_selection'];
        }

        return $base;
    }

    protected function handleDebugMode(string $message, ?string $state): array
    {
        if (empty($message)) {
            $message = "booking padel besok jam 7 malam"; // mock default
        }
        
        $nlpResult = $this->nlpPipeline->process($message);
        
        $scores = $nlpResult['scores'] ?? [];
        $top3 = array_slice($scores, 0, 3, true);
        $top3Str = "";
        $rank = 1;
        foreach ($top3 as $intent => $score) {
            $top3Str .= "$rank. $intent : $score\n";
            $rank++;
        }

        $reply = "🛠️ **DEBUG MODE** 🛠️\n\n";
        $reply .= "**Teks Asli:** " . $nlpResult['raw'] . "\n";
        $reply .= "**Normalisasi:** " . $nlpResult['normalized'] . "\n";
        $reply .= "**Tokens (Stems):** " . json_encode($nlpResult['stems']) . "\n\n";
        
        $reply .= "**Entitas Diekstrak:**\n```json\n" . json_encode($nlpResult['entities'], JSON_PRETTY_PRINT) . "\n```\n\n";
        
        $reply .= "**Top 3 Intent Scoring:**\n" . (!empty($top3Str) ? $top3Str : "Tidak ada kecocokan") . "\n\n";
        
        $reply .= "*💡 Tips Kalibrasi: Ubah threshold `low_confidence` di `config/chatbot_nlp.php` " .
                  "jika bot sering menjawab ngaco, atau persempit `ambiguity_gap` jika perbedaan skor antar intent sering sangat tipis.*";

        return [
            'reply' => $reply,
            'chips' => [],
            'state' => $state ?? 'IDLE',
            'intent' => 'debug',
            'confidence' => 100,
            'conversation' => $this->loadConversation(),
            'ui' => ['type' => 'text', 'payload' => []],
            'quick_replies' => [],
            'meta' => []
        ];
    }
}
