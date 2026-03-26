<?php
/**
 * MANDALA ARENA BOT SYSTEM
 * CLEAN DEPLOYMENT
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatbotDictionary;
use App\Models\ChatbotSetting;
use App\Models\Facility;
use App\Events\ChatbotMessageReceived;
use Inertia\Inertia;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    private function normalize(string $msgText): string
    {
        $msgText = mb_strtolower(trim($msgText));
        $dict = ChatbotDictionary::all();
        foreach ($dict as $dbItem) {
            $slang = mb_strtolower($dbItem->slang);
            $formal = mb_strtolower($dbItem->formal);
            // Gunakan regex \b agar hanya mengganti kata yang utuh, bukan bagian dari kata (contoh: 'ga' tidak mengganti 'gaul')
            $msgText = preg_replace('/\b' . preg_quote($slang, '/') . '\b/u', $formal, $msgText);
        }
        return $msgText;
    }

    private function getDetectedIntent(string $msgStr): string
    {
        $patternMap = [
            'sapaan' => ['halo', 'hai', 'hi', 'hey', 'pagi', 'siang', 'malam', 'assalamualaikum'],
            'booking' => ['booking', 'pesan', 'reserve', 'main', 'lapangan', 'daftar'],
            'cancel' => ['batal', 'cancel', 'gak jadi', 'nggak jadi', 'stop'],
            'matchmaking' => ['cari lawan', 'sparring', 'lawan', 'mabar', 'matchmaking'],
            'redirect' => ['login', 'register', 'daftar akun', 'masuk'],
        ];

        foreach ($patternMap as $intentKey => $words) {
            foreach ($words as $wordItem) {
                if (str_contains($msgStr, $wordItem))
                    return $intentKey;
            }
        }
        return 'unknown';
    }

    private function respond(string $textOut, array $chipsOut = [], ?string $urlRedirect = null)
    {
        try {
            broadcast(new ChatbotMessageReceived($textOut, Auth::id()));
        } catch (\Exception $exErr) {
            \Log::warning('Reverb: ' . $exErr->getMessage());
        }

        return response()->json([
            'reply' => $textOut,
            'chips' => $chipsOut,
            'redirect' => $urlRedirect,
        ]);
    }

    private function facilityChips(): array
    {
        return [
            ['label' => 'Mini Soccer', 'msg' => 'Mini Soccer'],
            ['label' => 'Padel', 'msg' => 'Padel'],
            ['label' => 'Badminton', 'msg' => 'Badminton'],
            ['label' => 'Pilates', 'msg' => 'Pilates'],
        ];
    }

    public function handleMessage(Request $reqData)
    {
        $userMsgRaw = trim($reqData->input('message', ''));
        if (!$userMsgRaw)
            return $this->respond('Ada yang bisa saya bantu?');

        $cleanMsg = $this->normalize($userMsgRaw);
        $currState = Session::get('chatbot_state', 'IDLE');

        if ($this->getDetectedIntent($cleanMsg) === 'cancel') {
            Session::forget(['chatbot_state', 'booking_data']);
            return $this->respond('Oke, batal ya. Ada lagi? ', [['label' => 'Booking Baru', 'msg' => 'booking']]);
        }

        if ($currState !== 'IDLE') {
            return $this->handleFlow($cleanMsg, $currState);
        }

        $msgIntent = $this->getDetectedIntent($cleanMsg);

        switch ($msgIntent) {
            case 'sapaan':
                return $this->respond("Hai! Mau booking lapangan apa hari ini?", $this->facilityChips());
            case 'booking':
                return $this->startBookingFlow($cleanMsg);
            case 'matchmaking':
                return $this->respond("Mau cari lawan sparring? Saya bisa carikan lawan yang setara di Mandala Arena.", [
                    ['label' => 'Cari Lawan Sekarang', 'msg' => 'cari lawan'],
                ], route('matchmaking.index'));
            default:
                return $this->respond("Boleh dijelasin lebih detail? Atau mau langsung booking aja biar saya bantu", [
                    ['label' => 'Booking Sekarang', 'msg' => 'booking'],
                ]);
        }
    }

    private function startBookingFlow(string $msgStr)
    {
        if (Auth::check()) {
            Session::put('chatbot_state', 'ASK_FACILITY');
            return $this->respond("Siap! Kamu sudah login nih. Mau booking fasilitas apa? ⚽", $this->facilityChips());
        }

        Session::put('chatbot_state', 'ASK_HAS_ACCOUNT');
        return $this->respond("Siap! Sebelumnya, apa Kakak sudah punya akun di Mandala Arena?", [
            ['label' => 'Login', 'msg' => 'Login'],
            ['label' => 'Register', 'msg' => 'Register'],
        ]);
    }

    private function handleFlow(string $msgStr, string $stateKey)
    {
        switch ($stateKey) {
            case 'ASK_HAS_ACCOUNT':
                if (str_contains($msgStr, 'sudah') || str_contains($msgStr, 'punya') || str_contains($msgStr, 'login')) {
                    return $this->respond("Oke! Saya arahkan ke halaman Login ya biar datanya tersinkron. Tunggu sebentar... ⚡", [], route('login'));
                }
                Session::put('chatbot_state', 'ASK_WANT_REGISTER');
                return $this->respond("Belum punya ya? Mau sekalian buat akun biar dapat Poin Rejeki? 💎", [
                    ['label' => '✨ Register', 'msg' => 'Register'],
                    ['label' => '👤 Guest Saja', 'msg' => 'guest saja'],
                ]);

            case 'ASK_WANT_REGISTER':
                if (str_contains($msgStr, 'buat') || str_contains($msgStr, 'mau') || str_contains($msgStr, 'daftar') || str_contains($msgStr, 'register')) {
                    return $this->respond("Siap! Ke halaman Register ya. Cuma semenit kok! 🏃‍♂️", [], route('register'));
                }
                Session::put('chatbot_state', 'ASK_FACILITY');
                return $this->respond("Oke, Guest Mode Aktif! 👤 Mau booking fasilitas apa?", $this->facilityChips());

            case 'ASK_FACILITY':
                $allFacilities = Facility::all();
                foreach ($allFacilities as $facObj) {
                    $facNameLower = strtolower($facObj->name);
                    if (str_contains($msgStr, $facNameLower)) {
                        Session::put('chatbot_state', 'IDLE');
                        return $this->respond(
                            "Pilihan yang mantap! Berpindah ke halaman **{$facObj->name}** untuk cek jadwal kosong ya... 🏟️",
                            [],
                            route('facility.show', $facObj->id)
                        );
                    }
                }
                return $this->respond("Pilih satu fasilitas ya: Mini Soccer, Padel, Badminton, atau Pilates 💪", $this->facilityChips());

            default:
                Session::put('chatbot_state', 'IDLE');
                return $this->handleMessage(new Request(['message' => $msgStr]));
        }
    }

    public function adminIndex()
    {
        return Inertia::render('Admin/Chatbot/Index', [
            'dictionary' => ChatbotDictionary::orderBy('slang')->get(),
            'greeting' => ChatbotSetting::where('key', 'greeting')->value('value') ?? 'Halo! Mau booking lapangan apa hari ini?',
        ]);
    }
}