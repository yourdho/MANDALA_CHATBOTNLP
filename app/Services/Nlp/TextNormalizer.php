<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;

/**
 * TextNormalizer handles basic preprocessing:
 * Lowercasing, unicode/punctuation cleanup, slang to formal translation, and typo correction.
 */
class TextNormalizer
{
    /**
     * Normalize the raw user message.
     */
    public function normalize(string $message): string
    {
        // 1. Lowercase
        $message = mb_strtolower(trim($message));

        // 2. Unicode Cleanup (Remove emojis or non-ascii junk if needed, but keep letters and numbers)
        // This removes everything except alphanumeric, spaces, and basic punctuation
        $message = preg_replace('/[^\p{L}\p{N}\s.,?!\-:]/u', '', $message);

        // 3. Repeated Character Normalization (e.g. "okeeee" -> "oke", "siiip" -> "sip")
        $message = preg_replace('/(.)\1{2,}/', '$1', $message); // reduces 3+ same chars to 1.
        
        // Edge cases for typical Indonesian style repetitions usually needing 2 chars e.g. "yoo" -> "yo"
        // But to be safe, reducing 3+ to 1 is a sturdy standard logic. (e.g. "haaaloooo" -> "halo")

        // 4. Static Configuration Mapping (Slang & Typo)
        $slangMap = Config::get('chatbot_nlp.slang_map', []);
        $typoMap = Config::get('chatbot_nlp.typo_map', []);
        $staticMap = array_merge($slangMap, $typoMap);

        foreach ($staticMap as $slang => $formal) {
            $message = preg_replace('/\b' . preg_quote($slang, '/') . '\b/u', $formal, $message);
        }

        // Database Dictionary Mapping has been deprecated in favor of config
        
        // Final punctuation cleanup (normalize extra spaces)
        return preg_replace('/\s+/', ' ', trim($message));
    }
}
