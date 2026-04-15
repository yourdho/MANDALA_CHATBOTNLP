<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Config;

/**
 * Tokenizer handles text segmentation, stopword removal, and basic stemming.
 */
class Tokenizer
{
    protected array $stopwords;

    public function __construct()
    {
        $this->stopwords = Config::get('chatbot_nlp.stopwords', []);
    }

    /**
     * Main tokenization pipeline.
     */
    public function tokenize(string $message): array
    {
        // Split by non-word characters
        $tokens = preg_split('/[\s,?.!]+/', strtolower($message), -1, PREG_SPLIT_NO_EMPTY);
        if (!$tokens) {
            return [];
        }

        $cleanTokens = $this->removeStopwords($tokens);
        
        // Stemming is optional but helpful
        return array_map([$this, 'stem'], $cleanTokens);
    }

    /**
     * Remove generic stopwords.
     */
    public function removeStopwords(array $tokens): array
    {
        return array_filter($tokens, fn($t) => !in_array($t, $this->stopwords));
    }

    /**
     * Basic Indonesian Light Stemmer.
     */
    public function stem(string $token): string
    {
        if (strlen($token) <= 4) {
            return $token;
        }

        $prefixes = ['memper', 'mempunyai', 'meng', 'peng', 'meny', 'peny', 'memp', 'mem', 'pem', 'men', 'pen', 'me', 'pe', 'ber', 'ter', 'di', 'ke', 'se'];
        foreach ($prefixes as $p) {
            if (str_starts_with($token, $p) && strlen($token) > strlen($p) + 2) {
                return substr($token, strlen($p));
            }
        }
        
        $suffixes = ['kan', 'nya', 'lah', 'pun', 'kah', 'i'];
        foreach ($suffixes as $s) {
            if (str_ends_with($token, $s) && strlen($token) > strlen($s) + 3) {
                 return substr($token, 0, -strlen($s));
            }
        }

        return $token;
    }
}
