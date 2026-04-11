<?php

namespace App\Contracts\Services;

interface WhatsAppServiceInterface
{
    public function sendMessage(string $target, string $message): bool;

}
