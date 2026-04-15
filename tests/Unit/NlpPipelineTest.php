<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\Nlp\TextNormalizer;
use App\Services\Nlp\Tokenizer;
use App\Services\Nlp\IntentClassifier;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;

class NlpPipelineTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock Config for NLP
        Config::set('chatbot_nlp.stopwords', ['dan', 'di', 'ke', 'dari', 'ya', 'sih', 'dong']);
        Config::set('chatbot_nlp.slang_map', [
            'ayeuna' => 'hari ini',
            'isukan' => 'besok',
            'minisoccer' => 'mini soccer'
        ]);
        Config::set('chatbot_nlp.typo_map', [
            'boking' => 'booking',
            'pesen' => 'booking'
        ]);
        Config::set('chatbot_nlp.aliases', [
            'booking' => ['booking', 'reservasi', 'sewa']
        ]);

        // Mock Cache to prevent DB hits during simple unit tests
        Cache::shouldReceive('remember')->andReturn([]);
    }

    public function test_normalizer_fixes_slang_and_typos()
    {
        $normalizer = new TextNormalizer();
        
        $input = "Boking minisoccer ayeuna ya?";
        $expected = "booking mini soccer hari ini ya?";
        
        $this->assertEquals($expected, $normalizer->normalize($input));
    }

    public function test_tokenizer_removes_stopwords_and_stems()
    {
        $tokenizer = new Tokenizer();
        
        $input = "aku mau booking lapangan di hari membesok ya";
        $tokens = $tokenizer->tokenize($input);
        
        $this->assertNotContains('di', $tokens);
        $this->assertNotContains('ya', $tokens);
        
        // 'membesok' should theoretically be stemmed to 'besok' based on the basic stemmer
        $this->assertTrue(in_array('besok', $tokens));
    }

    public function test_intent_classifier_uses_aliases()
    {
        $classifier = new IntentClassifier();
        
        $tokens = ['mau', 'reservasi', 'lapangan'];
        $raw = "mau reservasi lapangan";
        
        // Aliases sets booking score to 3 or more because 'reservasi' maps to booking alias
        list($intent, $score) = $classifier->classify($tokens, $raw);
        
        // It should match 'booking' because of the aliases mapping
        $this->assertEquals('booking', $intent);
        $this->assertGreaterThan(0, $score);
    }
}
