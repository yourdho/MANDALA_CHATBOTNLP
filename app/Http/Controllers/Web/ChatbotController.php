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

    public function storeDictionary(Request $request)
    {
        $validated = $request->validate([
            'slang'  => 'required|string|unique:chatbot_dictionaries,slang',
            'formal' => 'required|string',
        ]);

        ChatbotDictionary::create($validated);

        return back()->with('flash', [
            'message' => "Signal '{$validated['slang']}' registered successfully.",
            'type'    => 'success'
        ]);
    }

    public function updateDictionary(Request $request, $id)
    {
        $validated = $request->validate([
            'slang'  => 'required|string|unique:chatbot_dictionaries,slang,' . $id,
            'formal' => 'required|string',
        ]);

        ChatbotDictionary::findOrFail($id)->update($validated);

        return back()->with('flash', [
            'message' => "Signal '{$validated['slang']}' recalibrated.",
            'type'    => 'success'
        ]);
    }

    public function destroyDictionary($id)
    {
        $entry = ChatbotDictionary::findOrFail($id);
        $slang = $entry->slang;
        $entry->delete();

        return back()->with('flash', [
            'message' => "Signal '{$slang}' purged from lexicon.",
            'type'    => 'success'
        ]);
    }

    public function updateGreeting(Request $request)
    {
        $validated = $request->validate([
            'greeting' => 'required|string',
        ]);

        ChatbotSetting::updateOrCreate(
            ['key' => 'greeting'],
            ['value' => $validated['greeting']]
        );

        return back()->with('flash', [
            'message' => "Mission Protocol Greeting updated.",
            'type'    => 'success'
        ]);
    }
}