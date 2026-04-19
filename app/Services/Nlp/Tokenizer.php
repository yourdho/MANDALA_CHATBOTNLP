<?php

namespace App\Services\Nlp;

use Illuminate\Support\Facades\Config;
use Sastrawi\Stemmer\StemmerFactory;

/**
 * Tokenizer handles text segmentation, stopword removal, and robust stemming.
 */
class Tokenizer
{
    protected array $stopwords;
    protected $stemmer;

    public function __construct()
    {
        $this->stopwords = Config::get('chatbot_nlp.stopwords', []);
        
        // Inisialisasi Sastrawi Stemmer ala Nazief & Adriani
        $stemmerFactory = new StemmerFactory();
        $this->stemmer = $stemmerFactory->createStemmer();
    }

    /**
     * Main tokenization pipeline.
     */
    public function tokenize(string $message): array
    {
        // Hapus tanda baca (punctuation) agar tidak menempel pada token
        $cleanMessage = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', strtolower($message));
        
        // Split berdasarkan spasi (whitespace)
        $tokens = preg_split('/\s+/', trim($cleanMessage), -1, PREG_SPLIT_NO_EMPTY);
        
        if (!$tokens) {
            return [
                'tokens' => [],
                'stems' => [],
            ];
        }

        $cleanTokens = $this->removeStopwords($tokens);
        
        return [
            'tokens' => array_values($cleanTokens),
            'stems'  => array_values(array_map([$this, 'stem'], $cleanTokens)),
        ];
    }

    /**
     * Remove generic stopwords.
     */
    public function removeStopwords(array $tokens): array
    {
        return array_filter($tokens, fn($t) => !in_array($t, $this->stopwords));
    }

    /**
     * Stemming bahasa Indonesia yang robust menggunakan Sastrawi.
     */
    public function stem(string $token): string
    {
        return $this->stemmer->stem($token);
    }
}
