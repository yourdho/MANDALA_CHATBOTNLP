<?php

namespace App\Services\Nlp;


use Illuminate\Support\Facades\Config;

class ResponseGenerator
{
    public function generate(string $intent, array $chips = [], ?string $redirect = null, ?string $paymentUrl = null, ?string $snapToken = null, array $extraContext = []): array
    {
        $reply = "";

        if ($intent === 'low_confidence') {
            $reply = Config::get('chatbot_nlp.fallbacks.low_confidence');
            $chips = [
                ['label' => '⚽ Booking', 'msg' => 'booking'],
                ['label' => '📍 Lokasi', 'msg' => 'lokasi'],
                ['label' => '🤝 Mabar', 'msg' => 'mabar'],
            ];
        } elseif ($intent === 'ambiguous') {
            $reply = Config::get('chatbot_nlp.fallbacks.ambiguous');
            $opt1 = $extraContext[0] ?? 'Booking';
            $opt2 = $extraContext[1] ?? 'Lainnya';
            $reply = str_replace(['[OPTION_1]', '[OPTION_2]'], [strtoupper($opt1), strtoupper($opt2)], $reply);
            $chips = [
                ['label' => ucwords(str_replace('_', ' ', $opt1)), 'msg' => str_replace('_', ' ', $opt1)],
                ['label' => ucwords(str_replace('_', ' ', $opt2)), 'msg' => str_replace('_', ' ', $opt2)],
            ];
        } else {
            $reply = "Siap Kak!";
            if ($intent === 'unknown') {
                 $reply = "Maaf Kak, instruksi tidak dikenal. Ketik 'bantuan' jika bingung.";
            } else {
                 $reply = "Ok siap laksanakan! Kakak minta proses terkait " . ucwords(str_replace('_', ' ', $intent)) . ".";
                 if ($intent == 'login_help') $redirect = route('login');
                 if ($intent == 'register_help') $redirect = route('register');
            }
        }

        return [
            'reply' => $reply,
            'chips' => $chips,
            'redirect' => $redirect,
            'paymentUrl' => $paymentUrl,
            'snapToken' => $snapToken
        ];
    }
    
    public function generateRaw(string $text, array $chips = [], ?string $redirect = null, ?string $paymentUrl = null, ?string $snapToken = null): array
    {
         return [
            'reply' => $text,
            'chips' => $chips,
            'redirect' => $redirect,
            'paymentUrl' => $paymentUrl,
            'snapToken' => $snapToken
        ];
    }
}
