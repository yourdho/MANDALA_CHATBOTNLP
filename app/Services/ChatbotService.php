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
        protected PaymentFlowManager $paymentFlowManager
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
        $conversation = $this->loadConversation();
        
        // 1. Jalankan NLP Analysis
        $nlpResult = $this->nlpPipeline->process($message);
        
        // 2. Cancellation Check
        if (in_array($nlpResult['intent'], ['cancel', 'cancel_booking'])) {
             return $this->handleCancellation($conversation);
        }

        // 3. Routing Berdasarkan State & Intent
        $flowResult = $this->routeIntent($conversation, $nlpResult);

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
            'ui' => $flowResult['ui']
        ];
    }

    protected function loadConversation(array $context = []): array
    {
        return [
            'state' => Session::get('chatbot_state', 'IDLE'),
            'slots' => Session::get('chatbot_booking_slots', []),
            'booking_id' => Session::get('chatbot_booking_id', null)
        ];
    }

    protected function persistConversation(array $conversation): void
    {
        Session::put('chatbot_state', $conversation['state'] ?? 'IDLE');
        if (isset($conversation['slots'])) Session::put('chatbot_booking_slots', $conversation['slots']);
        if (isset($conversation['booking_id'])) Session::put('chatbot_booking_id', $conversation['booking_id']);
    }

    protected function routeIntent(array $conversation, array $nlpResult): array
    {
        $currentState = $conversation['state'];
        $intent = $nlpResult['intent'];

        // Jika confidence rendah, klarifikasi
        if (isset($nlpResult['confidence']) && $nlpResult['confidence'] < 0.4 && $currentState === 'IDLE') {
            return $this->buildClarificationResponse($nlpResult, $conversation);
        }

        // Routing Berdasarkan Blok Kategori State Manager
        $isBookingState = in_array($currentState, ['COLLECTING_FACILITY', 'COLLECTING_DATE', 'COLLECTING_TIME', 'COLLECTING_DURATION', 'BOOKING_SUMMARY', 'WAITING_CONFIRMATION', 'CHECKING_AVAILABILITY']);
        $isPaymentState = in_array($currentState, ['WAITING_PAYMENT_METHOD', 'CREATING_PAYMENT', 'PAYMENT_PENDING', 'ACCOUNT_CHECK']);

        // Explicit Intent Overrides (Memaksa flow berubah)
        if ($intent === 'payment_status_check') {
            $conversation['state'] = 'PAYMENT_PENDING';
            return $this->handlePaymentIntent($conversation, $nlpResult);
        }
        
        if ($currentState === 'IDLE' && in_array($intent, ['booking', 'availability_check'])) {
            $conversation['state'] = 'COLLECTING_FACILITY';
            return $this->handleBookingIntent($conversation, $nlpResult);
        }

        // Stick to active flow
        if ($isBookingState) {
            return $this->handleBookingIntent($conversation, $nlpResult);
        }

        if ($isPaymentState) {
            return $this->handlePaymentIntent($conversation, $nlpResult);
        }

        // Fallback: Informational / General
        return $this->handleGeneralIntent($conversation, $nlpResult);
    }

    protected function handleBookingIntent(array $conversation, array $nlpResult): array
    {
        $result = $this->bookingFlowManager->handle($conversation, $nlpResult);
        
        // Pindah otomatis ke payment jika booking konfirmasi beres
        if (!empty($result['ready_for_payment'])) {
            $conversation['state'] = 'WAITING_PAYMENT_METHOD';
            return $this->handlePaymentIntent($conversation, $nlpResult);
        }

        return $this->mergeResponse($this->baseResponseStruct($conversation, $nlpResult), $result);
    }

    protected function handlePaymentIntent(array $conversation, array $nlpResult): array
    {
        $result = $this->paymentFlowManager->handle($conversation, $nlpResult);
        return $this->mergeResponse($this->baseResponseStruct($conversation, $nlpResult), $result);
    }

    protected function handleGeneralIntent(array $conversation, array $nlpResult): array
    {
        $intent = $nlpResult['intent'];
        $generator = $this->nlpPipeline->getResponseGenerator();
        
        $chips = [];
        if ($intent === 'greeting')    $chips = $this->facilityChips();
        if ($intent === 'facilities')  $chips = [['label' => 'Cek Harga', 'msg' => 'harga'], ['label' => 'Booking Sekarang', 'msg' => 'booking']];
        if ($intent === 'location')    $chips = [['label' => 'Buka Maps', 'msg' => 'rute']];
        
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
        
        // Pass specifically requested UI types down if present
        if ($flowResult['next_action'] === 'payment_method_selection') {
            $base['ui']['type'] = 'payment_method_selection';
            $base['ui']['payload'] = ['type' => 'payment_method_selection'];
        }

        return $base;
    }
}
