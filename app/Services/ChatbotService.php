<?php

namespace App\Services;

use App\Contracts\Services\ChatbotServiceInterface;
use App\Models\ChatbotDictionary;
use App\Models\Facility;
use App\Events\ChatbotMessageReceived;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class ChatbotService implements ChatbotServiceInterface
{
    /**
     * Map of intent keys to trigger words.
     */
    private array $intentMap = [
        'sapaan'      => ['halo', 'hai', 'hi', 'hey', 'pagi', 'siang', 'malam', 'assalamualaikum'],
        'booking'     => ['booking', 'pesan', 'reserve', 'main', 'lapangan', 'daftar'],
        'cancel'      => ['batal', 'cancel', 'gak jadi', 'nggak jadi', 'stop'],
        'matchmaking' => ['cari lawan', 'sparring', 'lawan', 'mabar', 'matchmaking'],
        'redirect'    => ['login', 'register', 'daftar akun', 'masuk'],
    ];

    // ─────────────────────────────────────────────────────────────
    //  Interface Methods
    // ─────────────────────────────────────────────────────────────

    public function normalize(string $message): string
    {
        $message = mb_strtolower(trim($message));
        $dict    = ChatbotDictionary::all();

        foreach ($dict as $item) {
            $slang  = mb_strtolower($item->slang);
            $formal = mb_strtolower($item->formal);
            $message = preg_replace('/\b' . preg_quote($slang, '/') . '\b/u', $formal, $message);
        }

        return $message;
    }

    public function detectIntent(string $message): string
    {
        foreach ($this->intentMap as $intent => $triggers) {
            foreach ($triggers as $trigger) {
                if (str_contains($message, $trigger)) {
                    return $intent;
                }
            }
        }

        return 'unknown';
    }

    /**
     * Main dispatcher — stateful, uses Laravel Session for conversation flow.
     */
    public function processMessage(string $rawMessage, string $state): array
    {
        if (!$rawMessage) {
            return $this->buildResponse('Ada yang bisa saya bantu?');
        }

        $cleanMessage = $this->normalize($rawMessage);

        // Always allow user to cancel the current flow
        if ($this->detectIntent($cleanMessage) === 'cancel') {
            Session::forget(['chatbot_state', 'booking_data']);
            return $this->buildResponse('Oke, batal ya. Ada lagi?', [
                ['label' => 'Booking Baru', 'msg' => 'booking'],
            ]);
        }

        // Continue an existing conversation flow
        if ($state !== 'IDLE') {
            return $this->handleFlow($cleanMessage, $state);
        }

        // Fresh dispatch from IDLE
        return match ($this->detectIntent($cleanMessage)) {
            'sapaan'      => $this->buildResponse('Hai! Mau booking lapangan apa hari ini?', $this->facilityChips()),
            'booking'     => $this->startBookingFlow($cleanMessage),
            'matchmaking' => $this->buildResponse(
                'Mau cari lawan sparring? Saya bisa carikan lawan yang setara di Mandala Arena.',
                [['label' => 'Cari Lawan Sekarang', 'msg' => 'cari lawan']],
                route('matchmaking.index')
            ),
            default => $this->buildResponse(
                'Boleh dijelasin lebih detail? Atau mau langsung booking aja biar saya bantu',
                [['label' => 'Booking Sekarang', 'msg' => 'booking']]
            ),
        };
    }

    public function facilityChips(): array
    {
        return [
            ['label' => 'Mini Soccer', 'msg' => 'Mini Soccer'],
            ['label' => 'Padel',       'msg' => 'Padel'],
            ['label' => 'Pilates',     'msg' => 'Pilates'],
        ];
    }

    // ─────────────────────────────────────────────────────────────
    //  Broadcast Helper
    // ─────────────────────────────────────────────────────────────

    public function broadcast(string $text): void
    {
        try {
            \Illuminate\Support\Facades\Event::dispatch(new ChatbotMessageReceived($text, Auth::id()));
        } catch (\Exception $e) {
            Log::warning('Reverb broadcast error: ' . $e->getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Private Flow Handlers
    // ─────────────────────────────────────────────────────────────

    private function startBookingFlow(string $message): array
    {
        if (Auth::check()) {
            Session::put('chatbot_state', 'ASK_FACILITY');
            return $this->buildResponse(
                'Siap! Kamu sudah login nih. Mau booking fasilitas apa? ⚽',
                $this->facilityChips()
            );
        }

        Session::put('chatbot_state', 'ASK_HAS_ACCOUNT');
        return $this->buildResponse(
            'Siap! Sebelumnya, apa Kakak sudah punya akun di Mandala Arena?',
            [
                ['label' => 'Login',    'msg' => 'Login'],
                ['label' => 'Register', 'msg' => 'Register'],
            ]
        );
    }

    private function handleFlow(string $message, string $state): array
    {
        return match ($state) {
            'ASK_HAS_ACCOUNT' => $this->handleAskHasAccount($message),
            'ASK_WANT_REGISTER' => $this->handleAskWantRegister($message),
            'ASK_FACILITY'   => $this->handleAskFacility($message),
            default => $this->handleUnknownState($message),
        };
    }

    private function handleAskHasAccount(string $message): array
    {
        if (str_contains($message, 'sudah') || str_contains($message, 'punya') || str_contains($message, 'login')) {
            return $this->buildResponse(
                'Oke! Saya arahkan ke halaman Login ya biar datanya tersinkron. Tunggu sebentar... ⚡',
                [],
                route('login')
            );
        }

        Session::put('chatbot_state', 'ASK_WANT_REGISTER');
        return $this->buildResponse(
            'Belum punya ya? Mau sekalian buat akun biar dapat Poin Rejeki? 💎',
            [
                ['label' => '✨ Register',  'msg' => 'Register'],
                ['label' => '👤 Guest Saja', 'msg' => 'guest saja'],
            ]
        );
    }

    private function handleAskWantRegister(string $message): array
    {
        if (str_contains($message, 'buat') || str_contains($message, 'mau')
            || str_contains($message, 'daftar') || str_contains($message, 'register')) {
            return $this->buildResponse('Siap! Ke halaman Register ya. Cuma semenit kok! 🏃‍♂️', [], route('register'));
        }

        Session::put('chatbot_state', 'ASK_FACILITY');
        return $this->buildResponse('Oke, Guest Mode Aktif! 👤 Mau booking fasilitas apa?', $this->facilityChips());
    }

    private function handleAskFacility(string $message): array
    {
        $facilities = Facility::all();
        foreach ($facilities as $facility) {
            if (str_contains($message, strtolower($facility->name))) {
                Session::put('chatbot_state', 'IDLE');
                return $this->buildResponse(
                    "Pilihan yang mantap! Berpindah ke halaman **{$facility->name}** untuk cek jadwal kosong ya... 🏟️",
                    [],
                    route('facility.show', $facility->id)
                );
            }
        }

        return $this->buildResponse(
            'Pilih satu fasilitas ya: Mini Soccer, Padel, atau Pilates 💪',
            $this->facilityChips()
        );
    }

    private function handleUnknownState(string $message): array
    {
        Session::put('chatbot_state', 'IDLE');
        return $this->processMessage($message, 'IDLE');
    }

    // ─────────────────────────────────────────────────────────────
    //  Response Builder
    // ─────────────────────────────────────────────────────────────

    private function buildResponse(string $reply, array $chips = [], ?string $redirect = null): array
    {
        return compact('reply', 'chips', 'redirect');
    }
}
