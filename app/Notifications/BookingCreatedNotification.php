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
        $url = route('mitra.bookings.index');
        $customerName = $this->booking->isGuest() ? $this->booking->guest_name : $this->booking->user->name;

        return (new MailMessage)
            ->subject('🔔 Booking Baru Masuk: ' . $this->booking->venue->name)
            ->greeting('Halo Mitra!')
            ->line('Anda memiliki satu pesanan (booking) baru yang memerlukan konfirmasi Anda.')
            ->line('**Detail Booking:**')
            ->line('- Customer: ' . $customerName)
            ->line('- Tanggal: ' . $this->booking->booking_date->format('d M Y'))
            ->line('- Waktu: ' . $this->booking->start_time . ' - ' . $this->booking->end_time)
            ->line('- Total Harga: Rp ' . number_format($this->booking->total_price, 0, ',', '.'))
            ->action('Lihat & Konfirmasi di Dashboard', $url)
            ->line('Terima kasih telah menggunakan Janjee!');
    }

    /**
     * Get the WhatsApp representation.
     */
    public function toWhatsApp(object $notifiable): string
    {
        $customerName = $this->booking->isGuest() ? $this->booking->guest_name : $this->booking->user->name;
        $customerPhone = $this->booking->isGuest() ? $this->booking->guest_phone : $this->booking->user->phone;

        return "🔔 *Booking Baru Masuk di Janjee!*\n\n"
            . "Halo Mitra, ada booking baru untuk venue *{$this->booking->venue->name}*.\n\n"
            . "👤 *Pemesan:* $customerName\n"
            . "📱 *Nomor WA:* $customerPhone\n"
            . "📅 *Tanggal:* {$this->booking->booking_date->format('d M Y')}\n"
            . "⏰ *Jam:* {$this->booking->start_time} - {$this->booking->end_time}\n"
            . "💰 *Total Pembayaran:* Rp " . number_format($this->booking->total_price, 0, ',', '.') . "\n\n"
            . "Segera cek dan konfirmasi booking ini melalui dashboard Janjee Anda:\n"
            . route('mitra.bookings.index');
    }

    /**
     * Route notification for WhatsApp (optional, fallback to phone logic in Channel)
     */
    public function routeNotificationForWhatsApp()
    {
        return $this->booking->venue->owner->phone ?? null;
    }
}
