<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;


/**
 * IntentClassifier calculates confidence scores to detect intent.
 * Phase 2: Phrase Bonus, Entity Context Mutators, Ambiguity Clarification.
 */
class IntentClassifier
{
    public function classify(array $messageTokens, string $rawNormalizedMessage, array $entities = []): array
    {
        $scores = [];
        $synonyms = Config::get('chatbot_nlp.synonyms', []);
        $phraseWeights = Config::get('chatbot_nlp.phrase_weights', []);

        // 1. Phrase Bonus Match (Absolute Highest Priority)
        foreach ($phraseWeights as $phrase => $data) {
             if (str_contains($rawNormalizedMessage, $phrase)) {
                 $scores[$data['intent']] = ($scores[$data['intent']] ?? 0) + $data['score'];
             }
        }

        // 2. Prepopulate synonym match score (maps 'booking_keywords' to 'booking' intent)
        foreach ($synonyms as $synonymCategory => $synonymKeywords) {
            $aliasIntent = str_replace('_keywords', '', $synonymCategory);
            foreach ($synonymKeywords as $ak) {
                if (in_array(strtolower($ak), $messageTokens)) {
                    $scores[$aliasIntent] = ($scores[$aliasIntent] ?? 0) + 4;
                }
            }
        }

        // 3. Database DB match
        // Note: For advanced intents not in DB yet, they rely solely on aliases/phrase bonus which is perfectly fine.
        $dictionaries = [];

        foreach ($dictionaries as $dict) {

        // 4. Entity Context Reinforcement
        // "jika user menyebut fasilitas + aksi booking/waktu, perkuat booking intent"
        $hasTime = isset($entities['booking_time']) || isset($entities['booking_date']);
        $hasFacility = isset($entities['facility_id']) || isset($entities['sport_type']);

        if ($hasTime || $hasFacility) {
             $scores['booking'] = ($scores['booking'] ?? 0) + 5; // Base bump
             if ($hasTime && $hasFacility) {
                 $scores['booking'] += 30; // Absolute domination, hard override
             }
             if ($hasFacility && !isset($scores['facility_info']) && !isset($scores['price_check'])) {
                 $scores['facility_info'] = ($scores['facility_info'] ?? 0) + 3;
             }
        }

        // Compile logic
        arsort($scores);
        $intents = array_keys($scores);
        
        $topIntent = $intents[0] ?? 'unknown';
        $topScore = $scores[$topIntent] ?? 0;
        
        $secondIntent = $intents[1] ?? null;
        $secondScore = $secondIntent ? $scores[$secondIntent] : 0;

        // Validation 1: Threshold
        if ($topScore < 4) {
             return ['low_confidence', $topScore, []];
        }

        // Validation 2: Multiple ambiguity check
        // If highest and second highest are very close (diff <= 2) and top score isn't super high
        if ($secondIntent && ($topScore - $secondScore <= 2) && $topScore < 20) {
             return ['ambiguous', $topScore, [$topIntent, $secondIntent]];
        }

        return [$topIntent, $topScore, []];
    }
}
