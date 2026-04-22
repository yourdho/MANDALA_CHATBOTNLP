<?php

use App\Services\Chatbot\ChatbotLogger;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

/**
 * Jadwal: Hapus log chatbot yang tidak dikenali lebih dari 90 hari.
 * Dijalankan setiap malam pukul 01:00 agar tidak mengganggu traffic peak.
 * Untuk menjalankan manual: php artisan chatbot:purge-logs
 */
Artisan::command('chatbot:purge-logs', function () {
    try {
        $count = app(ChatbotLogger::class)->purgeOldLogs();
        $this->info("Berhasil menghapus {$count} entri log chatbot yang kadaluarsa.");
        Log::info("[ChatbotLogger] Scheduled purge: {$count} entri dihapus.");
    } catch (\Exception $e) {
        $this->error("Gagal purge: " . $e->getMessage());
        Log::error("[ChatbotLogger] Scheduled purge gagal: " . $e->getMessage());
    }
})->purpose('Hapus log chatbot unrecognized yang lebih dari 90 hari');

Schedule::command('chatbot:purge-logs')->dailyAt('01:00');
