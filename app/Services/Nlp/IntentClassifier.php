<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Config;

/**
 * IntentClassifier — Multi-layer NLP scoring engine.
 *
 * Layer 1 : Phrase Bonus (exact substring match, highest priority)
 * Layer 2 : TF-Weighted Token Scoring (config token_weights + synonym map)
 * Layer 3 : Jaccard Similarity terhadap Training Corpus
 * Layer 4 : Entity Context Reinforcement (facility + time → booking)
 * Output   : [intent_name, confidence_score, ambiguous_intents[]]
 */
class IntentClassifier
{
    /**
     * Training corpus per intent.
     * Setiap intent memiliki satu atau lebih "dokumen" kata kunci representatif.
     * Semakin kaya kosakata di sini, semakin akurat Jaccard Similarity-nya.
     *
     * Format: 'intent' => [ ['kata1', 'kata2', ...], ... ]
     */
    protected array $trainingCorpus = [
        'greeting' => [
            ['halo', 'hai', 'hello', 'hi', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'permisi', 'punten'],
            ['assalamualaikum', 'waalaikumsalam', 'sampurasun'],
        ],
        'booking' => [
            ['booking', 'book', 'reservasi', 'pesan', 'sewa', 'pesen', 'order'],
            ['mau', 'ingin', 'bisa', 'bantu', 'lapangan', 'padel', 'basket', 'pilates', 'soccer'],
            ['jadwal', 'jam', 'tanggal', 'besok', 'hari', 'slot'],
        ],
        'availability_check' => [
            ['jadwal', 'kosong', 'tersedia', 'slot', 'ketersediaan', 'available', 'cek'],
            ['masih', 'ada', 'hari', 'ini', 'besok', 'lusa', 'jam'],
            ['bisa', 'main', 'bermain', 'kapan'],
        ],
        'price_check' => [
            ['harga', 'tarif', 'biaya', 'ongkos', 'price', 'rate', 'berapa', 'sabaraha'],
            ['sewa', 'booking', 'main', 'lapangan', 'per', 'jam'],
        ],
        'facility_info' => [
            ['fasilitas', 'venue', 'lapangan', 'kelas', 'studio', 'ada', 'apa'],
            ['mini', 'soccer', 'padel', 'basket', 'pilates', 'olahraga'],
            ['info', 'detail', 'daftar', 'pilihan', 'lengkap'],
        ],
        'location_info' => [
            ['lokasi', 'alamat', 'dimana', 'maps', 'map', 'google', 'petunjuk', 'arah', 'jalan'],
            ['tempat', 'arena', 'mandala', 'garut'],
        ],
        'operating_hours' => [
            ['buka', 'tutup', 'jam', 'operasional', 'waktu', 'hari'],
            ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'],
            ['pagi', 'siang', 'sore', 'malam', 'berapa', 'sampai'],
        ],
        'payment_help' => [
            ['bayar', 'pembayaran', 'payment', 'metode', 'cara', 'transfer', 'qris', 'ovo', 'dana'],
            ['va', 'virtual', 'account', 'cash', 'tunai', 'ewallet', 'wallet'],
        ],
        'payment_status_check' => [
            ['status', 'pembayaran', 'sudah', 'belum', 'cek', 'konfirmasi', 'lunas', 'invoice'],
            ['transfer', 'masuk', 'diterima', 'berhasil', 'gagal', 'tf', 'qris'],
        ],
        'cancel' => [
            ['batal', 'cancel', 'batalkan', 'tidak', 'jadi', 'teu', 'moal', 'hapus'],
            ['booking', 'reservasi', 'pesanan', 'jadwal'],
        ],
        'reschedule' => [
            ['ubah', 'ganti', 'pindah', 'geser', 'reschedule', 'jadwal', 'ulang'],
            ['jadwal', 'jam', 'tanggal', 'hari'],
        ],
        'matchmaking' => [
            ['lawan', 'partner', 'sparing', 'sparring', 'mabar', 'teman', 'cari', 'neangan'],
            ['main', 'bermain', 'olahraga', 'join', 'tim', 'team'],
        ],
        'promo_info' => [
            ['promo', 'diskon', 'voucher', 'cashback', 'potongan', 'murah', 'hemat'],
            ['ada', 'sedang', 'berlaku', 'info'],
        ],
        'login_help' => [
            ['login', 'masuk', 'signin', 'akun', 'account', 'password', 'lupa', 'email'],
        ],
        'register_help' => [
            ['daftar', 'register', 'registrasi', 'signup', 'buat', 'akun', 'baru'],
        ],
        'thanks' => [
            ['terima', 'kasih', 'makasih', 'thanks', 'thank', 'nuhun', 'hatur'],
        ],
        'complaint' => [
            ['komplain', 'keluhan', 'masalah', 'error', 'gagal', 'kecewa', 'bermasalah', 'jelek'],
        ],
    ];

    /**
     * Bobot untuk setiap layer scoring.
     */
    protected float $phraseWeight   = 1.0;   // Layer 1: multiplier phrase bonus
    protected float $tfWeight       = 1.0;   // Layer 2: multiplier TF / synonym
    protected float $jaccardWeight  = 40.0;  // Layer 3: Jaccard score dikonversi ke skala ini
    protected float $entityWeight   = 1.0;   // Layer 4: multiplier entity bump

    /**
     * Classify user intent.
     *
     * @param  array  $messageTokens  Stems dari Tokenizer
     * @param  string $rawNormalizedMessage  Teks ternormalisasi (dari TextNormalizer)
     * @param  array  $entities  Entitas hasil EntityExtractor
     * @return array  [intent_name, confidence_score, ambiguous_intents[]]
     */
    public function classify(array $messageTokens, string $rawNormalizedMessage, array $entities = []): array
    {
        $scores = [];

        // ── Layer 1: Phrase Bonus ──────────────────────────────────────────────
        // Pencocokan frasa exact substring (tertinggi prioritasnya).
        $phraseWeights = Config::get('chatbot_nlp.phrase_weights', []);
        foreach ($phraseWeights as $phrase => $data) {
            if (str_contains($rawNormalizedMessage, $phrase)) {
                $scores[$data['intent']] = ($scores[$data['intent']] ?? 0)
                    + ($data['score'] * $this->phraseWeight);
            }
        }

        // ── Layer 2: TF-Weighted Token Scoring ────────────────────────────────
        // 2a. config token_weights (skor per kata kunci tunggal)
        $tokenWeights = Config::get('chatbot_nlp.token_weights', []);
        foreach ($messageTokens as $token) {
            if (isset($tokenWeights[$token])) {
                $tw = $tokenWeights[$token];
                $scores[$tw['intent']] = ($scores[$tw['intent']] ?? 0)
                    + ($tw['score'] * $this->tfWeight);
            }
        }

        // 2b. Synonym/alias map
        $synonyms = Config::get('chatbot_nlp.synonyms', []);
        foreach ($synonyms as $synonymCategory => $synonymKeywords) {
            $aliasIntent = str_replace('_keywords', '', $synonymCategory);
            foreach ($synonymKeywords as $ak) {
                if (in_array(strtolower($ak), $messageTokens)) {
                    $scores[$aliasIntent] = ($scores[$aliasIntent] ?? 0) + (4 * $this->tfWeight);
                }
            }
        }

        // ── Layer 3: Jaccard Similarity ───────────────────────────────────────
        // Menghitung kesamaan set antara token input dan setiap dokumen training corpus.
        // Jaccard = |A ∩ B| / |A ∪ B|
        if (!empty($messageTokens)) {
            $inputSet = array_unique($messageTokens);

            foreach ($this->trainingCorpus as $intent => $documents) {
                $maxJaccard = 0.0;

                foreach ($documents as $doc) {
                    $docSet       = array_unique($doc);
                    $intersection = array_intersect($inputSet, $docSet);
                    $union        = array_unique(array_merge($inputSet, $docSet));

                    $jaccard = count($union) > 0
                        ? count($intersection) / count($union)
                        : 0.0;

                    if ($jaccard > $maxJaccard) {
                        $maxJaccard = $jaccard;
                    }
                }

                if ($maxJaccard > 0) {
                    // Skalakan Jaccard (0–1) ke skor yang bisa dibandingkan dengan layer lain
                    $scores[$intent] = ($scores[$intent] ?? 0)
                        + ($maxJaccard * $this->jaccardWeight);
                }
            }
        }

        // ── Layer 4: Entity Context Reinforcement ─────────────────────────────
        // Jika entitas fasilitas + waktu sama-sama ada → booking sangat dominan.
        $hasTime     = isset($entities['time']) || isset($entities['date']);
        $hasFacility = isset($entities['facility']);

        if ($hasTime || $hasFacility) {
            $scores['booking'] = ($scores['booking'] ?? 0) + (5 * $this->entityWeight);

            if ($hasTime && $hasFacility) {
                $scores['booking'] = ($scores['booking'] ?? 0) + (30 * $this->entityWeight);
            }

            if ($hasFacility && empty($scores['facility_info']) && empty($scores['price_check'])) {
                $scores['facility_info'] = ($scores['facility_info'] ?? 0) + (3 * $this->entityWeight);
            }
        }

        // ── Compile & Evaluate ────────────────────────────────────────────────
        arsort($scores);
        $intents = array_keys($scores);

        $topIntent    = $intents[0] ?? 'unknown';
        $topScore     = round($scores[$topIntent] ?? 0, 2);
        $secondIntent = $intents[1] ?? null;
        $secondScore  = $secondIntent ? round($scores[$secondIntent], 2) : 0;

        // Threshold config (low_confidence)
        $lowConfidenceThreshold = Config::get('chatbot_nlp.thresholds.low_confidence', 4);
        if ($topScore < $lowConfidenceThreshold) {
            return ['low_confidence', $topScore, []];
        }

        // Ambiguity check: gap antara top-1 dan top-2 terlalu kecil
        $ambiguityGap = Config::get('chatbot_nlp.thresholds.ambiguity_gap', 3);
        if ($secondIntent && ($topScore - $secondScore <= $ambiguityGap) && $topScore < 20) {
            return ['ambiguous', $topScore, [$topIntent, $secondIntent]];
        }

        return [$topIntent, $topScore, []];
    }
}
