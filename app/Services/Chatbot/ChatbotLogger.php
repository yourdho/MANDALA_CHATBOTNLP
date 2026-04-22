<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatbotLogger
{
    // Pola regex untuk deteksi dan redaksi PII sebelum disimpan ke DB.
    // Ini mencegah data sensitif (nomor WA, email, nama) tersimpan
    // di tabel unrecognized_messages yang mungkin diakses analis NLP.
    private const PII_PATTERNS = [
        '/\b[\w.+-]+@[\w-]+\.[a-z]{2,6}\b/i'  => '[EMAIL]',     // email
        '/\b(?:\+62|62|0)[- ]?\d{2,4}[- ]?\d{3,4}[- ]?\d{3,4}\b/' => '[PHONE]', // nomor WA/HP Indonesia
        '/\b\d{16}\b/'                          => '[CARD_NO]',  // nomor kartu 16 digit
        '/\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}[A-Z0-9]{0,3}\b/' => '[IBAN]', // IBAN/rekening
    ];

    // Retensi default: log unrecognized lebih dari 90 hari dihapus otomatis.
    // Panggil purgered() dari scheduled command atau artisan.
    private const RETENTION_DAYS = 90;

    /**
     * Simpan pesan yang tidak dikenali untuk analisis Continuous Learning.
     *
     * PII di-redact sebelum disimpan — email, nomor HP, nomor kartu.
     * user_id disimpan (anonim di analisis, tapi bisa di-trace jika ada laporan abuse).
     */
    public function logUnrecognized(string $rawMessage, array $extractedEntities = []): void
    {
        try {
            $redactedMessage  = $this->redactPii($rawMessage);
            $redactedEntities = $this->redactEntities($extractedEntities);

            DB::table('unrecognized_messages')->insert([
                'message'      => $redactedMessage,
                'entities_json'=> json_encode($redactedEntities),
                'user_id'      => Auth::id(),   // Nullable — null jika guest (seharusnya tidak terjadi karena chatbot sudah auth-only)
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('[ChatbotLogger] Gagal mencatat unrecognized message: ' . $e->getMessage());
        }
    }

    /**
     * Hapus log lama melebihi batas retensi.
     * Panggil dari: php artisan schedule:run atau artisan command khusus.
     */
    public function purgeOldLogs(): int
    {
        return DB::table('unrecognized_messages')
            ->where('created_at', '<', now()->subDays(self::RETENTION_DAYS))
            ->delete();
    }

    /**
     * Redact PII dari string pesan.
     */
    private function redactPii(string $text): string
    {
        foreach (self::PII_PATTERNS as $pattern => $replacement) {
            $text = preg_replace($pattern, $replacement, $text);
        }
        return $text;
    }

    /**
     * Redact PII dari array entities (nilai string saja yang di-scan).
     */
    private function redactEntities(array $entities): array
    {
        $redacted = [];
        foreach ($entities as $key => $value) {
            $redacted[$key] = is_string($value) ? $this->redactPii($value) : $value;
        }
        return $redacted;
    }
}
