<?php

/**
 * MANDALA ARENA CHATBOT CONTROLLER
 * Thin HTTP adapter — all NLP logic lives in ChatbotService & the NLP pipeline.
 */

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class ChatbotController extends Controller
{
    public function __construct(protected ChatbotService $chatbotService) {}

    /**
     * Handle an incoming chatbot message from the frontend.
     */
    public function handleMessage(Request $request)
    {
        $rawMessage = trim($request->input('message', ''));
        $state      = Session::get('chatbot_state', 'IDLE');

        $result = $this->chatbotService->processMessage($rawMessage, $state);

        // Broadcast to real-time channel (non-blocking)
        $this->chatbotService->broadcast($result['reply']);

        return response()->json([
            'reply'       => $result['reply'],
            'chips'       => $result['chips'] ?? [],
            'redirect'    => $result['redirect'] ?? null,
            'ui'          => $result['ui'] ?? null,
            'meta'        => $result['meta'] ?? null,
        ]);
    }

    /**
     * Reset chatbot session — called by frontend on page load / chatbot open.
     * Ensures conversation always starts fresh after a page refresh.
     */
    public function resetSession(Request $request)
    {
        Session::forget([
            'chatbot_state',
            'chatbot_booking_slots',
            'chatbot_booking_id',
        ]);

        return response()->json(['status' => 'reset']);
    }
}