<?php

namespace App\Events;

use App\Models\SportsMatch;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchFound implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $m1;
    public $m2;

    /**
     * Create a new event instance.
     */
    public function __construct(SportsMatch $m1, SportsMatch $m2)
    {
        $this->m1 = $m1;
        $this->m2 = $m2;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->m1->user_id),
            new PrivateChannel('user.' . $this->m2->user_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'status' => 'matched',
            'facility' => $this->m1->facility,
            'message' => 'Lawan Ditemukan! Hubungi mereka sekarang.'
        ];
    }
}
