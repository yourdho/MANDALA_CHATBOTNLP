<?php

/**
 * MANDALA ARENA CHATBOT CONTROLLER
 * Thin HTTP adapter — all NLP logic lives in ChatbotService.
 */

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use App\Models\ChatbotDictionary;
use App\Models\ChatbotSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

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

        // Broadcast to real-time channel
        $this->chatbotService->broadcast($result['reply']);

        return response()->json([
            'reply'    => $result['reply'],
            'chips'    => $result['chips'],
            'redirect' => $result['redirect'],
        ]);
    }

    /**
     * Admin: manage chatbot dictionary and settings.
     */
    public function adminIndex()
    {
        return Inertia::render('Admin/Chatbot/Index', [
            'dictionary' => ChatbotDictionary::orderBy('slang')->get(),
            'greeting'   => ChatbotSetting::where('key', 'greeting')->value('value')
                ?? 'Halo! Mau booking lapangan apa hari ini?',
        ]);
    }
}