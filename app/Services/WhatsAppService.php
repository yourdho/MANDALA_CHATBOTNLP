<?php

namespace App\Services;

use App\Contracts\Services\WhatsAppServiceInterface;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService  implements WhatsAppServiceInterface
{
    /**
     * Mengirim pesan WhatsApp menggunakan API Fonnte (contoh).
     * Anda dapat mengganti URL dan header sesuai dengan provider WhatsApp API Anda.
     *
     * @param string $target Nomor telepon tujuan (harus menggunakan kode negara, ex: 62812...)
     * @param string $message Isi pesan yang akan dikirim
     * @return bool
     */
    public static function sendMessage(string $target, string $message): bool
    {
        // Pastikan nomor berawalan 62 atau kode negara
        if (str_starts_with($target, '08')) {
            $target = '628' . substr($target, 2);
        }

        try {
            $token = config('services.fonnte.token'); // Tambahkan FONNTE_TOKEN di .env

            if (!$token) {
                Log::warning("WhatsApp token not configured, checking logs instead. To: $target | Message: $message");
                return true; // Return true in local env for debugging
            }

            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                        'target' => $target,
                        'message' => $message,
                        'countryCode' => '62',
                    ]);

            if ($response->successful()) {
                $status = $response->json();
                if (isset($status['status']) && $status['status'] === true) {
                    return true;
                }
            }

            Log::error('WhatsApp API Error:', $response->json() ?? []);
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp Service Exception: ' . $e->getMessage());
            return false;
        }
    }
}
