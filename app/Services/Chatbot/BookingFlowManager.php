<?php

namespace App\Services\Chatbot;

use App\Models\Facility;
use App\Models\Booking;
use Carbon\Carbon;

class BookingFlowManager
{
    /**
     * Add-ons price list (dalam Rupiah).
     * Bisa dipindah ke config/DB di masa depan.
     */
    protected array $addonPrices = [
        'wasit'      => 100000,
        'fotografer' => 150000,
    ];

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

        $currentState = $conversation['state'] ?? 'IDLE';

        // 2. Context Override: Jika ada facility baru di-input saat sedang collect hal lain
        if (isset($nlpResult['entities']['facility']) && in_array($currentState, ['COLLECTING_DATE', 'COLLECTING_TIME', 'COLLECTING_DURATION'])) {
             $newFacility = $nlpResult['entities']['facility'];
             $currentFacilityId = $conversation['slots']['facility_id'] ?? null;

             if ($currentFacilityId !== $newFacility['id']) {
                 $conversation['slots']['facility_id'] = $newFacility['id'];
                 $conversation['slots']['facility_name'] = $newFacility['name'];
                 $conversation['slots']['date'] = null;
                 $conversation['slots']['time'] = null;
                 $conversation['state'] = 'COLLECTING_DATE';

                 $conversation = $this->mergeEntities($conversation, $nlpResult['entities']);

                 return $this->buildResponse(
                      'COLLECTING_DATE',
                      "Oke, Mandalabot ganti ke {$newFacility['name']} ya. Rencana tanggal berapa mainnya Kak?",
                      [],
                      $conversation
                 );
             }
        }

        // 3. Gabungkan entitas baru dengan slot yang sudah kita miliki
        $conversation = $this->mergeEntities($conversation, $nlpResult['entities']);
        $currentState = $conversation['state'] ?? 'IDLE'; // refresh if mutated

        // 4. Routing logika berdasarkan State (Dynamic Prompting)
        switch ($currentState) {

            // ── Availability Check Proaktif ────────────────────────────────
            // Saat user tanya "ada jam kosong?" dari IDLE/INTENT_DETECTED
            case 'IDLE':
            case 'INTENT_DETECTED':
                if ($nlpResult['intent'] === 'availability_check') {
                    return $this->handleAvailabilityIntent($conversation, $nlpResult);
                }
                // fall-through ke collecting flow
            case 'COLLECTING_FACILITY':
            case 'COLLECTING_DATE':
            case 'COLLECTING_TIME':
            case 'COLLECTING_DURATION':
                $missingSlots = $this->getMissingSlots($conversation);

                if (empty($missingSlots)) {
                    $conversation['state'] = 'CHECKING_AVAILABILITY';
                    return $this->checkAvailability($conversation);
                }

                return $this->determineNextQuestion($missingSlots, $conversation);

            // ── State: Menunggu konfirmasi slot hasil cek ketersediaan ──────
            case 'SLOT_OFFERED':
                return $this->handleSlotOfferResponse($conversation, $nlpResult);

            // ── State: Menunggu jawaban add-ons (Wasit / Fotografer) ────────
            case 'WAITING_ADDONS_CONFIRMATION':
                return $this->handleAddonsResponse($conversation, $nlpResult);

            // ── State: Summary sudah tampil, tunggu konfirmasi lanjut ───────
            case 'CHECKING_AVAILABILITY':
            case 'BOOKING_SUMMARY':
                if ($this->isAffirmative($nlpResult)) {
                    // Setelah konfirmasi summary → tanyakan add-ons
                    return $this->askForAddons($conversation);
                }

                if ($nlpResult['intent'] === 'reschedule') {
                    $conversation['slots']['time'] = null;
                    return $this->determineNextQuestion(['time'], $conversation);
                }

                return $this->buildBookingSummary($conversation);

            case 'WAITING_CONFIRMATION':
                return $this->handleConfirmation($conversation, $nlpResult);
        }

        return $this->buildResponse('IDLE', 'Wah, kita mulai lagi yuk! 🙌 Mau booking fasilitas apa Kak?', $this->facilityChips(), $conversation);
    }

    // ════════════════════════════════════════════════════════════════════════
    // AVAILABILITY CHECK PROAKTIF
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Tangani ketika user intent adalah availability_check dari state IDLE.
     * Jika sudah ada cukup entitas → langsung cek DB.
     * Jika belum lengkap → kumpulkan info yang kurang.
     */
    protected function handleAvailabilityIntent(array $conversation, array $nlpResult): array
    {
        $missingSlots = $this->getMissingSlots($conversation);

        if (empty($missingSlots)) {
            // Semua info tersedia → cek ketersediaan langsung
            $conversation['state'] = 'CHECKING_AVAILABILITY';
            return $this->checkAvailabilityAndOffer($conversation);
        }

        // Belum lengkap → mulai kumpulkan
        return $this->determineNextQuestion($missingSlots, $conversation);
    }

    /**
     * Cek ketersediaan dan jika kosong, TAWARKAN slot itu (state SLOT_OFFERED).
     * Berbeda dari checkAvailability() biasa yang langsung ke summary.
     */
    protected function checkAvailabilityAndOffer(array $conversation): array
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

        // Slot KOSONG → simpan harga dan tawarkan dengan antusias
        $conversation['slots']['price'] = $facility->price_per_hour * $duration;

        $dateLabel = $startTime->translatedFormat('l, d F Y');
        $timeLabel = $startTime->format('H:i') . '–' . $endTime->format('H:i');

        $templates = [
            "Wah, kebetulan banget Kak! 🎉 Untuk **{$dateLabel}** jam **{$timeLabel}** di **{$facility->name}** masih ada slot kosong nih. Mau langsung Mandalabot pesankan sekarang?",
            "Kabar baik! ✅ Slot **{$facility->name}** tanggal **{$dateLabel}** jam **{$timeLabel}** masih tersedia. Ayo, langsung dipesan sebelum diambil orang, Kak! 😄",
            "Mantap, masih kosong! 🏟️ Lapangan **{$facility->name}** pada **{$dateLabel}** pukul **{$timeLabel}** belum ada yang book. Mau Mandalabot langsung jadwalkan?",
        ];

        $reply = $templates[array_rand($templates)];

        return $this->buildResponse(
            'SLOT_OFFERED',
            $reply,
            [
                ['label' => '✅ Ya, pesan sekarang!', 'msg' => 'ya pesan sekarang'],
                ['label' => '🔄 Ganti jadwal', 'msg' => 'ganti jadwal'],
                ['label' => '❌ Tidak jadi', 'msg' => 'batal'],
            ],
            $conversation
        );
    }

    /**
     * Tangani respons user setelah slot ditawarkan (state SLOT_OFFERED).
     */
    protected function handleSlotOfferResponse(array $conversation, array $nlpResult): array
    {
        if ($this->isAffirmative($nlpResult)) {
            // User setuju → tunjukkan summary dulu, lalu tanyakan add-ons
            return $this->buildBookingSummaryThenAddons($conversation);
        }

        if ($nlpResult['intent'] === 'reschedule' || $this->isNegative($nlpResult)) {
            if ($nlpResult['intent'] === 'reschedule') {
                $conversation['slots']['time'] = null;
                $conversation['slots']['duration'] = null;
                return $this->determineNextQuestion(['time'], $conversation);
            }
            return $this->handleCancellation($conversation);
        }

        // Ulangi tawaran
        return $this->checkAvailabilityAndOffer($conversation);
    }

    // ════════════════════════════════════════════════════════════════════════
    // ADD-ONS FLOW
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Tampilkan summary booking, lalu langsung ajukan pertanyaan add-ons.
     * Dipanggil saat user konfirmasi booking dari SLOT_OFFERED atau BOOKING_SUMMARY.
     */
    protected function buildBookingSummaryThenAddons(array $conversation): array
    {
        // Simpan summary ke slot dulu
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

        // Langsung set ke WAITING_ADDONS_CONFIRMATION setelah summary
        $conversation['state'] = 'WAITING_ADDONS_CONFIRMATION';

        $response = $this->buildResponse(
            'WAITING_ADDONS_CONFIRMATION',
            json_encode($summary),
            [],
            $conversation,
            $summary
        );

        // Tambahkan pesan follow-up untuk add-ons (akan ditampilkan setelah card)
        $response['addons_prompt'] = $this->pickAddonsQuestion();
        $response['addons_chips'] = $this->addonsChips();

        return $response;
    }

    /**
     * Tanya add-ons secara eksplisit (dipanggil dari BOOKING_SUMMARY → affirmative).
     */
    protected function askForAddons(array $conversation): array
    {
        $conversation['state'] = 'WAITING_ADDONS_CONFIRMATION';

        $question = $this->pickAddonsQuestion();

        return $this->buildResponse(
            'WAITING_ADDONS_CONFIRMATION',
            $question,
            $this->addonsChips(),
            $conversation
        );
    }

    /**
     * Proses jawaban user saat ditanya add-ons (Wasit / Fotografer / Tidak).
     */
    protected function handleAddonsResponse(array $conversation, array $nlpResult): array
    {
        $normalizedText = strtolower($nlpResult['normalized'] ?? '');

        // Ekstrak pilihan layanan tambahan dari entity atau teks
        $additionalServices = $nlpResult['entities']['additional_services'] ?? [];

        // Fallback: parse manual dari teks jika entity extractor belum menangkap
        if (empty($additionalServices)) {
            $additionalServices = $this->parseAddonsFromText($normalizedText);
        }

        // Simpan ke slots
        $conversation['slots']['addon_wasit']      = in_array('wasit', $additionalServices);
        $conversation['slots']['addon_fotografer']  = in_array('fotografer', $additionalServices);

        // Hitung harga add-ons
        $addonTotal = 0;
        if ($conversation['slots']['addon_wasit'])     $addonTotal += $this->addonPrices['wasit'];
        if ($conversation['slots']['addon_fotografer']) $addonTotal += $this->addonPrices['fotografer'];

        $conversation['slots']['addon_total'] = $addonTotal;
        $conversation['slots']['price_total']  = ($conversation['slots']['price'] ?? 0) + $addonTotal;

        // Susun ringkasan add-ons untuk dikonfirmasi
        if ($this->isNegative($nlpResult) && empty($additionalServices)) {
            // User tidak mau add-ons
            $replyTemplates = [
                "Oke, no problem! Mantap, Mandalabot siapkan booking tanpa layanan tambahan ya Kak. 🙌",
                "Sip Kak! Kita proses tanpa Wasit/Fotografer ya. Oke lanjut ke pembayaran?",
                "Oke skip add-ons. Fokus main aja dulu! 💪 Langsung ke pembayaran ya Kak.",
            ];
            $reply = $replyTemplates[array_rand($replyTemplates)];
        } else {
            // User memilih satu atau lebih add-ons
            $chosenLabels = [];
            if ($conversation['slots']['addon_wasit'])     $chosenLabels[] = '🟡 Wasit (Rp ' . number_format($this->addonPrices['wasit'], 0, ',', '.') . ')';
            if ($conversation['slots']['addon_fotografer']) $chosenLabels[] = '📷 Fotografer (Rp ' . number_format($this->addonPrices['fotografer'], 0, ',', '.') . ')';

            $chosenStr = implode(' & ', $chosenLabels);
            $totalStr  = 'Rp ' . number_format($conversation['slots']['price_total'], 0, ',', '.');

            $replyTemplates = [
                "Keren! Mantap banget Kak, {$chosenStr} sudah ditambahkan. 🎉 Total jadi **{$totalStr}**. Lanjut ke pembayaran ya?",
                "Oke siap! {$chosenStr} langsung kami sediakan. 🔥 Total pembayaran: **{$totalStr}**. Lanjutkan ke pembayaran?",
                "Pilihan yang tepat! {$chosenStr} sudah masuk di daftar. Total sekarang **{$totalStr}**. Mau langsung bayar sekarang?",
            ];
            $reply = $replyTemplates[array_rand($replyTemplates)];
        }

        // Pindah ke konfirmasi final → payment
        return $this->handleConfirmation($conversation, $nlpResult, $reply);
    }

    /**
     * Parse entitas add-ons dari teks bebas.
     */
    protected function parseAddonsFromText(string $text): array
    {
        $chosen = [];
        $wasitKeywords     = config('chatbot_nlp.additional_services.wasit', ['wasit', 'referee', 'hakim']);
        $fotograferKeywords = config('chatbot_nlp.additional_services.fotografer', ['fotografer', 'foto', 'dokumentasi', 'photographer', 'kamera', 'fotografi']);

        foreach ($wasitKeywords as $kw) {
            if (str_contains($text, $kw)) { $chosen[] = 'wasit'; break; }
        }
        foreach ($fotograferKeywords as $kw) {
            if (str_contains($text, $kw)) { $chosen[] = 'fotografer'; break; }
        }

        // "dua-duanya" / "keduanya" / "semua"
        if (preg_match('/\b(dua-duanya|dua duanya|keduanya|semua|both)\b/', $text)) {
            $chosen = ['wasit', 'fotografer'];
        }

        return array_unique($chosen);
    }

    // ════════════════════════════════════════════════════════════════════════
    // CORE BOOKING FLOW
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Gabungkan entitas yang baru dideteksi ke dalam memori $conversation.
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

        if (isset($entities['number_of_people'])) $conversation['slots']['number_of_people'] = $entities['number_of_people'];
        if (isset($entities['payment_method']))   $conversation['slots']['payment_method'] = $entities['payment_method'];

        // Add-ons entities
        if (isset($entities['additional_services'])) {
            $services = $entities['additional_services'];
            $conversation['slots']['addon_wasit']     = in_array('wasit', $services);
            $conversation['slots']['addon_fotografer'] = in_array('fotografer', $services);
        }

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
     * Tentukan pertanyaan apa yang harus diajukan berdasarkan rentetan missing slots.
     */
    protected function determineNextQuestion(array $missingSlots, array $conversation): array
    {
        $slotToAsk = $missingSlots[0] ?? null;

        $facilityName = $conversation['slots']['facility_name'] ?? null;
        $dateStr      = $conversation['slots']['date']          ?? null;

        // ── Variasi pertanyaan per slot agar tidak terasa robotik ───────────

        if ($slotToAsk === 'facility_id') {
            $q = [
                'Mau main di fasilitas apa Kak? ⚽🏀🎾🧘',
                'Lapangan apa yang mau disewa Kak? Pilih salah satu ya!',
                'Fasilitas mana nih yang mau dicoba? Mini Soccer, Padel, Basket, atau Pilates?',
            ];
            return $this->buildResponse('COLLECTING_FACILITY', $q[array_rand($q)], $this->facilityChips(), $conversation);
        }

        if ($slotToAsk === 'date') {
            $prefix = $facilityName ? "Oke **{$facilityName}** siap!" : "Oke siap!";
            $q = [
                "{$prefix} Rencana mainnya tanggal berapa Kak? (Contoh: \"Besok\", \"Sabtu\", atau \"15 Mei\")",
                "{$prefix} Main tanggal berapa rencananya? Bisa sebut hari atau tanggalnya ya Kak.",
                "{$prefix} Kapan nih mau mainnya? Besok? Minggu ini? Sebutin aja Kak! 📅",
            ];
            return $this->buildResponse('COLLECTING_DATE', $q[array_rand($q)], [], $conversation);
        }

        if ($slotToAsk === 'time') {
            $dateLabel = $dateStr ? \Carbon\Carbon::parse($dateStr)->translatedFormat('l, d F') : 'hari itu';
            $q = [
                "Jam berapa rencana mulainya Kak? (Contoh: \"Jam 19:00\", \"Jam 7 malam\")",
                "Pukul berapa mau mulai mainnya pada **{$dateLabel}** Kak? ⏰",
                "Jam berapa nih kira-kira? Sebut jam mulai mainnya ya. (Contoh: \"jam 8 malem\")",
            ];
            return $this->buildResponse('COLLECTING_TIME', $q[array_rand($q)], [], $conversation);
        }

        if ($slotToAsk === 'duration') {
            $q = [
                'Mau main berapa jam Kak?',
                'Durasi mainnya berapa jam? 1 jam atau 2 jam? ⏳',
                'Rencananya main selama berapa jam Kak?',
            ];
            return $this->buildResponse(
                'COLLECTING_DURATION',
                $q[array_rand($q)],
                [
                    ['label' => '1 Jam', 'msg' => '1 jam'],
                    ['label' => '2 Jam', 'msg' => '2 jam'],
                    ['label' => '3 Jam', 'msg' => '3 jam'],
                ],
                $conversation
            );
        }

        return $this->buildResponse('IDLE', 'Hmm, ada info yang kurang. Bisa diulang ya Kak?', [], $conversation);
    }

    /**
     * Cek jadwal ke database apakah bertubrukan. Jika aman buat ringkasan.
     * Dipakai untuk alur booking biasa (bukan availability_check).
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

        $conversation['slots']['time'] = null;
        $conversation['slots']['duration'] = null;

        $templates = [
            "Waduh 😱 jadwal **{$facilityName}** di jam itu sudah full booked Kak. Mau geser ke jam berapa?",
            "Sayang banget, slot **{$facilityName}** di jam tersebut sudah terisi. Mau coba jam lain Kak?",
            "Yah, sudah ada yang book 😅 Jam lain masih banyak pilihan kok. Mau main jam berapa Kak?",
        ];

        return $this->buildResponse(
            'COLLECTING_TIME',
            $templates[array_rand($templates)],
            [],
            $conversation
        );
    }

    /**
     * Merender payload JSON Booking Summary Card (dipakai alur booking biasa).
     */
    protected function buildBookingSummary(array $conversation): array
    {
        $slots = $conversation['slots'];
        $startTime = Carbon::parse($slots['date'] . ' ' . $slots['time']);
        $endTime = $startTime->copy()->addHours($slots['duration']);

        // Hitung total harga termasuk add-ons jika sudah ada
        $basePrice  = $slots['price'] ?? 0;
        $addonTotal = $slots['addon_total'] ?? 0;
        $totalPrice = $basePrice + $addonTotal;

        $summary = [
            'type'          => 'booking_summary',
            'facility_name' => $slots['facility_name'],
            'date'          => $startTime->translatedFormat('l, d F Y'),
            'time'          => $startTime->format('H:i') . ' - ' . $endTime->format('H:i'),
            'duration'      => $slots['duration'] . ' Jam',
            'price'         => 'Rp ' . number_format($basePrice, 0, ',', '.'),
            'addon_wasit'   => $slots['addon_wasit'] ?? false,
            'addon_fotografer' => $slots['addon_fotografer'] ?? false,
            'addon_total'   => $addonTotal > 0 ? 'Rp ' . number_format($addonTotal, 0, ',', '.') : null,
            'total_price'   => 'Rp ' . number_format($totalPrice, 0, ',', '.'),
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
    protected function handleConfirmation(array $conversation, array $nlpResult, ?string $customReply = null): array
    {
        $response = $this->buildResponse(
            'WAITING_PAYMENT_METHOD',
            $customReply ?? 'Data booking sudah aman! 🔒 Sekarang, mau bayar pakai apa Kak?',
            [],
            $conversation
        );
        $response['ready_for_payment'] = true;
        $response['next_action'] = 'payment_method_selection';

        $payload = ['type' => 'payment_method_selection'];
        $response['reply'] = json_encode($payload);

        return $response;
    }

    /**
     * Batalkan booking berjalan.
     */
    protected function handleCancellation(array $conversation): array
    {
        $conversation['slots'] = [];
        return $this->buildResponse(
            'CANCELED',
            'Baiklah, proses booking dibatalkan. Kalau mau main lagi, Mandalabot siap bantu! 🙏',
            [['label' => '🏟️ Booking Lagi', 'msg' => 'booking']],
            $conversation
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Deteksi apakah user menjawab afirmatif (ya / lanjut / oke / dll).
     */
    protected function isAffirmative(array $nlpResult): bool
    {
        $affirmativeKeywords = config('chatbot_nlp.affirmative_keywords', [
            'ya', 'iya', 'yap', 'yup', 'oke', 'ok', 'siap', 'lanjut', 'gas',
            'boleh', 'bisa', 'setuju', 'deal', 'mau', 'pesan', 'booking', 'bayar',
            'yang itu', 'ambil', 'jadi', 'confirm', 'konfirmasi', 'ayo',
        ]);

        $normalized = strtolower($nlpResult['normalized'] ?? '');
        foreach ($affirmativeKeywords as $kw) {
            if (str_contains($normalized, $kw)) return true;
        }

        return in_array($nlpResult['intent'], ['booking', 'payment_help']);
    }

    /**
     * Deteksi apakah user menjawab negatif (tidak / enggak / dll).
     */
    protected function isNegative(array $nlpResult): bool
    {
        $negativeKeywords = config('chatbot_nlp.negative_keywords', [
            'tidak', 'enggak', 'engga', 'ngga', 'nggak', 'gak', 'ga', 'gak usah',
            'tidak usah', 'enggak usah', 'skip', 'lewat', 'nope', 'no', 'jangan',
        ]);

        $normalized = strtolower($nlpResult['normalized'] ?? '');
        foreach ($negativeKeywords as $kw) {
            if (str_contains($normalized, $kw)) return true;
        }

        return false;
    }

    /**
     * Pilih satu variasi pertanyaan add-ons secara acak.
     */
    protected function pickAddonsQuestion(): string
    {
        $questions = [
            "Oke siap! 🎉 Biar mainnya makin pro, perlu Mandalabot siapkan **Wasit** atau **Fotografer** juga nggak Kak? Lumayan buat dokumentasi mabar nanti. 📷",
            "Mantap! Oh iya Kak, sekalian mau dibantu pesan **Wasit** atau **Fotografer** biar mainnya makin seru? 🏆",
            "Gas! Mau tambah **Wasit** biar fair, atau **Fotografer** buat abadiin momen epic-nya Kak? Pilih aja ya! 📸",
            "Siap diproses! Ngomong-ngomong, mau sekalian pesan **Wasit** (Rp 100rb) atau **Fotografer** (Rp 150rb) nggak Kak? Biar makin berkesan! ✨",
        ];

        return $questions[array_rand($questions)];
    }

    /**
     * Quick reply chips untuk pilihan add-ons.
     */
    protected function addonsChips(): array
    {
        return [
            ['label' => '🟡 Wasit aja',         'msg' => 'wasit aja'],
            ['label' => '📷 Fotografer aja',     'msg' => 'fotografer aja'],
            ['label' => '🎯 Dua-duanya',         'msg' => 'dua-duanya'],
            ['label' => '❌ Enggak usah',        'msg' => 'enggak usah'],
        ];
    }

    /**
     * Standardized array return format untuk diproses oleh ChatbotService/Dispatcher.
     */
    protected function buildResponse(string $state, string $reply, array $chips, array $conversation, ?array $summary = null): array
    {
        return [
            'state'            => $state,
            'reply'            => $reply,
            'quick_replies'    => $chips,
            'collected_slots'  => $conversation['slots'] ?? [],
            'missing_slots'    => $this->getMissingSlots($conversation),
            'booking_summary'  => $summary,
            'next_action'      => null,
            'ready_for_payment'=> false,
            'addons_prompt'    => null,
            'addons_chips'     => [],
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
