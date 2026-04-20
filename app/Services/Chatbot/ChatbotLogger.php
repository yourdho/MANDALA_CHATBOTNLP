<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatbotLogger
{
    /**
     * Menyimpan pesan yang tidak dikenali ke tabel unrecognized_messages untuk analisis Continuous Learning.
     * 
     * @param string $rawMessage Pesan ketikan user yang asli atau sudah normalisasi yang gagal dikenali
     * @param array $extractedEntities Entitas apa pun yang berhasil ditangkap meski intent gagal
     * @return void
     */
    public function logUnrecognized(string $rawMessage, array $extractedEntities = []): void
    {
        try {
            DB::table('unrecognized_messages')->insert([
                'message' => $rawMessage,
                'entities_json' => json_encode($extractedEntities),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mencatat unrecognized message di ChatbotLogger: ' . $e->getMessage());
        }
    }
}
