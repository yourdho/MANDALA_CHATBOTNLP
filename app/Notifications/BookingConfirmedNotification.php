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
     *
     * @return array<int, string>
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
        $customerName = $this->booking->isGuest() ? $this->booking->guest_name : $this->booking->user->name;

        return (new MailMessage)
            ->subject('✅ Booking Anda Telah Dikonfirmasi!')
            ->greeting('Halo, ' . $customerName . '!')
            ->line('Mitra telah **mengkonfirmasi** booking Anda untuk: ' . $this->booking->venue->name)
            ->line('**Detail Jadwal:**')
            ->line('- Tanggal: ' . $this->booking->booking_date->format('d M Y'))
            ->line('- Jam: ' . $this->booking->start_time . ' - ' . $this->booking->end_time)
            ->line('- Lokasi: ' . $this->booking->venue->address)
            ->line('Tim venue kami menantikan kedatangan Anda. Selamat bertanding!');
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toWhatsApp(object $notifiable): string
    {
        $customerName = $this->booking->isGuest() ? $this->booking->guest_name : $this->booking->user->name;

        return "✅ *Konfirmasi Booking Janjee*\n\n"
            . "Halo $customerName! Booking Anda di *{$this->booking->venue->name}* telah dikonfirmasi oleh pengelola venue.\n\n"
            . "📌 *Detail Jadwal:*\n"
            . "📅 Tanggal: {$this->booking->booking_date->format('d M Y')}\n"
            . "⏰ Jam: {$this->booking->start_time} - {$this->booking->end_time}\n\n"
            . "📍 *Lokasi:* {$this->booking->venue->address}\n\n"
            . "Pastikan Anda hadir tepat waktu. Selamat bertanding dan terima kasih atas kepercayaannya pada platform Janjee!";
    }

    /**
     * Route notification for WhatsApp.
     */
    public function routeNotificationForWhatsApp()
    {
        return $this->booking->isGuest() ? $this->booking->guest_phone : ($this->booking->user->phone ?? null);
    }
}
