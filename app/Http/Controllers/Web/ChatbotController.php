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
}