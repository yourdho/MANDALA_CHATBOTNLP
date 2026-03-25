<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;
use App\Channels\WhatsAppChannel;

class BookingCreatedNotification extends Notification implements ShouldQueue
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
        $url = route('admin.bookings.index');
        $customerName = $this->booking->user->name;

        return (new MailMessage)
            ->subject('⚡ New Mission Alert: ' . $this->booking->facility->name)
            ->greeting('Attention Command!')
            ->line('A new booking mission has been initialized and requires your tactical confirmation.')
            ->line('**Mission Brief:**')
            ->line('- Athlete: ' . $customerName)
            ->line('- Division: ' . $this->booking->facility->name)
            ->line('- Timeline: ' . $this->booking->starts_at->format('d M Y | H:i'))
            ->line('- Duration: ' . $this->booking->duration_hours . ' Hour(s)')
            ->line('- Total Credit: Rp ' . number_format((float) $this->booking->total_price, 0, ',', '.'))
            ->action('Commence Review in Dashboard', $url)
            ->line('Operational excellence is the Mandala standard.');
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toWhatsApp(object $notifiable): string
    {
        $customerName = $this->booking->user->name;
        $customerPhone = $this->booking->user->phone;

        return "🔔 *New Mission Initialized at Mandala Arena!*\n\n"
            . "Command, a new booking has arrived for division *{$this->booking->facility->name}*.\n\n"
            . "👤 *Athlete:* $customerName\n"
            . "📱 *Comm Link:* $customerPhone\n"
            . "📅 *Timeline:* {$this->booking->starts_at->format('d M Y')}\n"
            . "⏰ *Window:* {$this->booking->starts_at->format('H:i')} - {$this->booking->ends_at->format('H:i')}\n"
            . "💰 *Total Credit:* Rp " . number_format((float) $this->booking->total_price, 0, ',', '.') . "\n\n"
            . "Confirm deployment immediately via Command Center:\n"
            . route('admin.bookings.index');
    }

    /**
     * Route notification for WhatsApp
     */
    public function routeNotificationForWhatsApp()
    {
        // Admin notification logic
        return config('services.whatsapp.admin_phone');
    }
}
