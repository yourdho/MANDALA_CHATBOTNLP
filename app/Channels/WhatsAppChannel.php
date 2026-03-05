<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use App\Services\WhatsAppService;

class WhatsAppChannel
{
    /**
     * Kirim notifikasi WhatsApp.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);
        $target = $notifiable->routeNotificationFor('WhatsApp') ?: $notifiable->phone;

        if (!$target && method_exists($notifiable, 'getPhoneNumber')) {
            $target = $notifiable->getPhoneNumber();
        }

        if ($target && $message) {
            WhatsAppService::sendMessage($target, $message);
        }
    }
}
