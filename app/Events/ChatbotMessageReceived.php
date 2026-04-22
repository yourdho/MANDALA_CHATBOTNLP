<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class ChatbotMessageReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $reply;
    public ?int   $senderId;

    public function __construct(string $reply, ?int $senderId = null)
    {
        $this->reply    = $reply;
        $this->senderId = $senderId;
    }

    /**
     * Broadcast ke private channel per user ID.
     *
     * Menggunakan PrivateChannel agar hanya user yang terautentikasi
     * (dan pemilik channel) yang bisa subscribe melalui Laravel Echo.
     *
     * Frontend listen ke: Echo.private('chatbot.{userId}')
     * channels.php harus mendaftarkan: Broadcast::channel('chatbot.{id}', ...)
     */
    public function broadcastOn(): array
    {
        $userId = $this->senderId ?? Auth::id();

        return [
            new PrivateChannel('chatbot.' . $userId),
        ];
    }
}
