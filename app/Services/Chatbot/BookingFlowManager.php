<?php

namespace App\Services\Chatbot;

use App\Models\Facility;
use App\Models\Booking;
use Carbon\Carbon;

class BookingFlowManager
{
    /**
     * Entry point utama untuk mengelola state booking berdasarkan konteks percakapan saat ini.
     *
     * @param array $conversation State berjalan (beserta slot-slot yang sudah terkumpul)
     * @param array $nlpResult Hasil parsing NLP (intent, entities, text)
     * @return array
     */
    public function handle(array $conversation, array $nlpResult): array
    {
        // 1. Tangani pembatalan sepihak di tengah jalan
        if (in_array($nlpResult['intent'], ['cancel', 'cancel_booking'])) {
            return $this->handleCancellation($conversation);
        }

        // 2. Gabungkan entitas baru dengan slot yang sudah kita miliki
        $conversation = $this->mergeEntities($conversation, $nlpResult['entities']);
        
        $currentState = $conversation['state'] ?? 'IDLE';

        // 3. Routing logika berdasarkan State
        switch ($currentState) {
            case 'IDLE':
            case 'INTENT_DETECTED':
            case 'COLLECTING_FACILITY':
            case 'COLLECTING_DATE':
            case 'COLLECTING_TIME':
            case 'COLLECTING_DURATION':
                // Check missing minimal slots
                $missingSlots = $this->getMissingSlots($conversation);
                
                if (empty($missingSlots)) {
                    // Jika data lengkap, cek availability
                    return $this->checkAvailability($conversation);
                }

                // Jika belum lengkap, tentukan pertanyaan berikutnya
                return $this->determineNextQuestion($missingSlots, $conversation);

            case 'CHECKING_AVAILABILITY':
            case 'BOOKING_SUMMARY':
                // Jika user konfirmasi booking summary
                if (
                    str_contains(strtolower($nlpResult['normalized']), 'lanjut') || 
                    str_contains(strtolower($nlpResult['normalized']), 'ya') || 
                    str_contains(strtolower($nlpResult['normalized']), 'bayar') ||
                    $nlpResult['intent'] === 'booking'
                ) {
                    return $this->handleConfirmation($conversation, $nlpResult);
                }
                
                // Jika ingin ubah jadwal (reschedule) saat melihat summary
                if ($nlpResult['intent'] === 'reschedule') {
                    $conversation['slots']['time'] = null; // reset jam
                    return $this->determineNextQuestion(['time'], $conversation);
                }

                // Fallback, tanyakan ulang summary
                return $this->buildBookingSummary($conversation);

            case 'WAITING_CONFIRMATION':
                return $this->handleConfirmation($conversation, $nlpResult);
        }

        // Return Default / Fallback
        return $this->buildResponse('IDLE', 'Wah, kita mulai lagi yuk. Mau booking fasilitas apa?', $this->facilityChips(), $conversation);
    }

    /**
     * Gabungkan entitas yang baru dideteksi ke dalam memori $conversation.
     * Tidak dioverwrite jika sudah ada, kecuali formatnya lebih jelas.
     */
    protected function mergeEntities(array $conversation, array $entities): array
    {
        if (!isset($conversation['slots'])) $conversation['slots'] = [];

        if (isset($entities['facility'])) {
            $conversation['slots']['facility_id'] = $entities['facility']['id'];
            $conversation['slots']['facility_name'] = $entities['facility']['name'];
        }
        
        if (isset($entities['date']))     $conversation['slots']['date'] = $entities['date'];
        if (isset($entities['time']))     $conversation['slots']['time'] = $entities['time'];
        if (isset($entities['duration'])) $conversation['slots']['duration'] = $entities['duration'];
        
        // Slot tambahan
        if (isset($entities['number_of_people'])) $conversation['slots']['number_of_people'] = $entities['number_of_people'];
        if (isset($entities['payment_method']))   $conversation['slots']['payment_method'] = $entities['payment_method'];

        return $conversation;
    }

    /**
     * Dapatkan slot minimal yang belum terisi.
     */
    protected function getMissingSlots(array $conversation): array
    {
        $minimalSlots = ['facility_id', 'date', 'time', 'duration'];
        $missing = [];

        foreach ($minimalSlots as $slot) {
            if (empty($conversation['slots'][$slot])) {
                $missing[] = $slot;
            }
        }
        return $missing;
    }

    /**
     * Tentukan pertanyaan apa yang harus diajukan berdasarkan rentetan missing slots teratas.
     */
    protected function determineNextQuestion(array $missingSlots, array $conversation): array
    {
        $slotToAsk = $missingSlots[0] ?? null;

        return match ($slotToAsk) {
            'facility_id' => $this->buildResponse(
                'COLLECTING_FACILITY', 
                'Mau main di fasilitas apa Kak?', 
                $this->facilityChips(), 
                $conversation
            ),
            'date' => $this->buildResponse(
                'COLLECTING_DATE', 
                'Oke, rencana untuk tanggal berapa? (Contoh: "Besok", "15 Oktober")', 
                [], 
                $conversation
            ),
            'time' => $this->buildResponse(
                'COLLECTING_TIME', 
                'Jam berapa rencana mulainya Kak? (Contoh: "Jam 19:00", "Jam 7 malam")', 
                [], 
                $conversation
            ),
            'duration' => $this->buildResponse(
                'COLLECTING_DURATION', 
                'Mau main berapa jam Kak?', 
                [   
                    ['label' => '1 Jam', 'msg' => '1 jam'], 
                    ['label' => '2 Jam', 'msg' => '2 jam']
                ], 
                $conversation
            ),
            default => $this->buildResponse('IDLE', 'Bingung nih. Coba diulang ya.', [], $conversation)
        };
    }

    /**
     * Cek jadwal ke database apakah bertubrukan. Jika aman buat ringkasan.
     */
    protected function checkAvailability(array $conversation): array
    {
        $slots = $conversation['slots'];
        
        $facility = Facility::find($slots['facility_id']);
        if (!$facility) {
            $conversation['slots']['facility_id'] = null;
            return $this->determineNextQuestion(['facility_id'], $conversation);
        }

        $startTime = Carbon::parse($slots['date'] . ' ' . $slots['time']);
        $duration  = (int) $slots['duration'];
        $endTime   = $startTime->copy()->addHours($duration);

        $conflict = $this->hasBookingConflict($facility->id, $startTime, $endTime);

        if ($conflict) {
            return $this->suggestAlternatives($conversation);
        }

        // Available — build summary
        $conversation['slots']['price'] = $facility->price_per_hour * $duration;
        return $this->buildBookingSummary($conversation);
    }

    /**
     * Mengecek konflik jadwal di database.
     */
    protected function hasBookingConflict(string $facilityId, Carbon $startTime, Carbon $endTime): bool
    {
        return Booking::where('facility_id', $facilityId)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('starts_at', '<', $endTime)
                      ->where('ends_at', '>', $startTime);
                });
            })->exists();
    }

    /**
     * Berikan alternatif jadwal bila penuh.
     */
    protected function suggestAlternatives(array $conversation): array
    {
        $slots = $conversation['slots'];
        $facilityName = $slots['facility_name'] ?? 'Fasilitas tersebut';
        
        // Reset waktu & durasi agar ditanya ulang
        $conversation['slots']['time'] = null;
        $conversation['slots']['duration'] = null;

        // Idealnya memanggil service untuk mengkalkulasi slot terdekat, sementara mockup
        return $this->buildResponse(
            'COLLECTING_TIME',
            "Waduh 😱 jadwal untuk {$facilityName} di jam tersebut sudah **full booked** Kak.\nMau geser jam berapa? (Contoh: 'jam 20:00')",
            [],
            $conversation
        );
    }

    /**
     * Merender payload JSON Booking Summary Card untuk MessageList Front-End.
     */
    protected function buildBookingSummary(array $conversation): array
    {
        $slots = $conversation['slots'];
        $startTime = Carbon::parse($slots['date'] . ' ' . $slots['time']);
        $endTime = $startTime->copy()->addHours($slots['duration']);
        
        $summary = [
            'type'          => 'booking_summary',
            'facility_name' => $slots['facility_name'],
            'date'          => $startTime->translatedFormat('l, d F Y'),
            'time'          => $startTime->format('H:i') . ' - ' . $endTime->format('H:i'),
            'duration'      => $slots['duration'] . ' Jam',
            'price'         => 'Rp ' . number_format($slots['price'], 0, ',', '.'),
        ];

        return $this->buildResponse(
            'BOOKING_SUMMARY',
            json_encode($summary),
            [],
            $conversation,
            $summary
        );
    }

    /**
     * Mark konfirmasi sukses, dan limpahkan ke Payment Flow.
     */
    protected function handleConfirmation(array $conversation, array $nlpResult): array
    {
        $response = $this->buildResponse(
            'WAITING_PAYMENT_METHOD',
            'Data booking sudah aman! 🔒 Sekarang, mau bayar pakai apa Kak?',
            // Payload akan merender PaymentMethodCard dari Flow berikutnya, atau gunakan raw json di sini:
            [],
            $conversation
        );
        $response['ready_for_payment'] = true;
        $response['next_action'] = 'payment_method_selection';

        // Kembalikan Payload UI Selection Card
        $payload = ['type' => 'payment_method_selection'];
        $response['reply'] = json_encode($payload);

        return $response;
    }

    /**
     * Batalkan booking berjalan.
     */
    protected function handleCancellation(array $conversation): array
    {
        $conversation['slots'] = []; // Reset memori
        return $this->buildResponse(
            'CANCELED',
            'Baiklah, proses booking dibatalkan secara aman. Beri tahu saya jika ada hal lain! 🙏',
            [],
            $conversation
        );
    }

    /**
     * Standardized array return format untuk diproses oleh ChatbotService/Dispatcher.
     */
    protected function buildResponse(string $state, string $reply, array $chips, array $conversation, array $summary = null): array
    {
        return [
            'state'           => $state,
            'reply'           => $reply,
            'quick_replies'   => $chips,
            'collected_slots' => $conversation['slots'] ?? [],
            'missing_slots'   => $this->getMissingSlots($conversation),
            'booking_summary' => $summary,
            'next_action'     => null,
            'ready_for_payment'=> false,
        ];
    }

    protected function facilityChips(): array
    {
        return [
            ['label' => 'Mini Soccer ⚽', 'msg' => 'Mini Soccer'],
            ['label' => 'Padel Court 🎾', 'msg' => 'Padel'],
            ['label' => 'Pilates 🧘‍♀️', 'msg' => 'Pilates'],
            ['label' => 'Basket 🏀', 'msg' => 'Basket'],
        ];
    }
}
