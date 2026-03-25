<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;
use App\Channels\WhatsAppChannel;

class BookingConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', WhatsAppChannel::class];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $customerName = $this->booking->user->name;

        return (new MailMessage)
            ->subject('✅ Mission Confirmed: ' . $this->booking->facility->name)
            ->greeting('Welcome Back, ' . $customerName . '!')
            ->line('Mandala Command has **confirmed** your mission deployment for: ' . $this->booking->facility->name)
            ->line('**Mission Brief:**')
            ->line('- Timeline: ' . $this->booking->starts_at->format('d M Y'))
            ->line('- Window: ' . $this->booking->starts_at->format('H:i') . ' - ' . $this->booking->ends_at->format('H:i'))
            ->line('- Division: ' . $this->booking->facility->category)
            ->line('Mandala Arena teams are standing by for your arrival. Prepare for deployment!');
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toWhatsApp(object $notifiable): string
    {
        $customerName = $this->booking->user->name;

        return "✅ *Konfirmasi Mission Mandala Arena*\n\n"
            . "Halo $customerName! Mission Anda di *{$this->booking->facility->name}* telah dikonfirmasi oleh Command Center.\n\n"
            . "📌 *Detail Deployment:*\n"
            . "📅 Timeline: {$this->booking->starts_at->format('d M Y')}\n"
            . "⏰ Window: {$this->booking->starts_at->format('H:i')} - {$this->booking->ends_at->format('H:i')}\n\n"
            . "📍 *Division:* {$this->booking->facility->category}\n\n"
            . "Pastikan Anda hadir tepat waktu. Mandala Arena Operational excellence awaits you!";
    }

    /**
     * Route notification for WhatsApp.
     */
    public function routeNotificationForWhatsApp()
    {
        return $this->booking->user->phone ?? null;
    }
}
