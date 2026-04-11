<?php

namespace App\Contracts\Services;

interface ChatbotServiceInterface
{
    /**
     * Normalize raw user message using slang dictionary.
     */
    public function normalize(string $message): string;

    /**
     * Detect the user's intent from a normalized message string.
     */
    public function detectIntent(string $message): string;

    /**
     * Process an incoming user message and return a structured response.
     */
    public function processMessage(string $rawMessage, string $state): array;

    /**
     * Return quick reply chip options for facility selection.
     */
    public function facilityChips(): array;
}
