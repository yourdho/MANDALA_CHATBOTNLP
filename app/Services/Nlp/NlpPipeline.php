<?php

namespace App\Services\Nlp;

/**
 * Orchestrator class that runs the entire NLP pipeline.
 */
class NlpPipeline
{
    protected TextNormalizer $normalizer;
    protected Tokenizer $tokenizer;
    protected IntentClassifier $intentClassifier;
    protected EntityExtractor $entityExtractor;
    protected ResponseGenerator $responseGenerator;

    public function __construct(
        TextNormalizer $normalizer,
        Tokenizer $tokenizer,
        IntentClassifier $intentClassifier,
        EntityExtractor $entityExtractor,
        ResponseGenerator $responseGenerator
    ) {
        $this->normalizer = $normalizer;
        $this->tokenizer = $tokenizer;
        $this->intentClassifier = $intentClassifier;
        $this->entityExtractor = $entityExtractor;
        $this->responseGenerator = $responseGenerator;
    }

    /**
     * Process a raw message and extract its NLP features.
     */
    public function process(string $rawMessage): array
    {
        $normalizedText = $this->normalizer->normalize($rawMessage);
        
        $tokenData = $this->tokenizer->tokenize($normalizedText);
        $tokens = $tokenData['tokens'];
        $stems = $tokenData['stems'];
        
        $entities = $this->entityExtractor->extract($normalizedText);
        
        // Pass stems to IntentClassifier for better matching
        list($intent, $confidence, $ambiguous) = $this->intentClassifier->classify($stems, $normalizedText, $entities);

        return [
            'raw' => $rawMessage,
            'normalized' => $normalizedText,
            'tokens' => $tokens,
            'stems' => $stems,
            'entities' => $entities,
            'intent' => $intent,
            'confidence' => $confidence,
            'ambiguous_intents' => $ambiguous
        ];
    }

    public function getResponseGenerator(): ResponseGenerator
    {
        return $this->responseGenerator;
    }
}
