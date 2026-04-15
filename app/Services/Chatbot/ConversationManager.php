<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Session;

/**
 * Dispatcher for all multi-turn conversation states
 */
class ConversationManager
{
    public function handleFlow(array $nlpResult, string $state): array
    {
        // 1. Ambil memori percakapan
        $conversation = [
            'state' => $state,
            'slots' => Session::get('chatbot_booking_slots', []),
            'booking_id' => Session::get('chatbot_booking_id', null)
        ];

        $responseStruct = null;

        // 2. Delegate Booking states
        if (in_array($state, ['IDLE', 'COLLECTING_FACILITY', 'COLLECTING_DATE', 'COLLECTING_TIME', 'COLLECTING_DURATION', 'BOOKING_SUMMARY', 'WAITING_CONFIRMATION'])) {
            $responseStruct = app(BookingFlowManager::class)->handle($conversation, $nlpResult);
        }

        // 3. Delegate Payment & Account states
        elseif (in_array($state, ['WAITING_PAYMENT_METHOD', 'CREATING_PAYMENT', 'PAYMENT_PENDING', 'ACCOUNT_CHECK'])) {
            $responseStruct = app(PaymentFlowManager::class)->handle($conversation, $nlpResult);
        }

        // Fallback
        if (!$responseStruct) {
            $generator = app(\App\Services\Nlp\NlpPipeline::class)->getResponseGenerator();
            $responseStruct = [
                'state' => 'IDLE',
                'reply' => 'Maaf State nya nyangkut Kak 😅. Ada yang bisa saya bantu lagi?',
                'quick_replies' => [],
                'redirect' => null
            ];
        }

        // 4. Update session
        Session::put('chatbot_state', $responseStruct['state'] ?? 'IDLE');
        if (isset($responseStruct['collected_slots'])) {
            Session::put('chatbot_booking_slots', $responseStruct['collected_slots']);
        }
        if (isset($responseStruct['booking_summary']) && is_array($responseStruct['booking_summary'])) {
            // Keep specific price in session memory for Payment Flow to use later
            Session::put('chatbot_booking_price', $responseStruct['booking_summary']['price_raw'] ?? 0);
        }

        // 5. Kembalikan array lama yang diparsing controller untuk di render MessageList frontend
        return [
            'reply' => $responseStruct['reply'],
            'chips' => collect($responseStruct['quick_replies'] ?? [])->map(fn($q) => ['label' => $q['label'], 'msg' => $q['msg']])->toArray(),
            'redirect' => $responseStruct['redirect'] ?? null,
            'state' => $responseStruct['state'],
            'struct' => $responseStruct // include full struct just in case
        ];
    }

    public function startBookingFlow(array $nlpResult): array
    {
        $conversation = [
            'state' => 'IDLE',
            'slots' => Session::get('chatbot_booking_slots', []),
        ];
        
        $responseStruct = app(BookingFlowManager::class)->handle($conversation, $nlpResult);
        
        Session::put('chatbot_state', $responseStruct['state'] ?? 'IDLE');
        if (isset($responseStruct['collected_slots'])) Session::put('chatbot_booking_slots', $responseStruct['collected_slots']);
        
        return [
            'reply' => $responseStruct['reply'],
            'chips' => collect($responseStruct['quick_replies'] ?? [])->map(fn($q) => ['label' => $q['label'], 'msg' => $q['msg']])->toArray(),
            'redirect' => $responseStruct['redirect'] ?? null,
        ];
    }
}
