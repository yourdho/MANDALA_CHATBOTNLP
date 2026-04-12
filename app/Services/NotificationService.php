<?php

namespace App\Services;

use App\Contracts\Services\NotificationServiceInterface;
use App\Models\Booking;
use App\Mail\BookingInvoiceMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Services\WhatsAppService;

class NotificationService implements NotificationServiceInterface
{
    public function notifyBookingSuccess(Booking $booking): void
    {
        $phone = $booking->guest_phone ?? ($booking->user->phone ?? null);
        $name  = $booking->guest_name  ?? ($booking->user->name  ?? 'User');
        $date  = $booking->starts_at->format('d/m/Y');
        $time  = $booking->starts_at->format('H:i');

        if ($phone) {
            $message = "✅ *BOOKING BERHASIL DIKONFIRMASI*\n\n"
                . "Halo {$name}, pembayaran Anda telah kami terima.\n\n"
                . "*Detail Jadwal:*\n"
                . "Fasilitas: {$booking->facility->name}\n"
                . "Tanggal: {$date}\n"
                . "Jam: {$time} WIB\n"
                . "Kode Booking: #MA-{$booking->id}\n\n"
                . "Terima kasih telah memilih Mandala Arena! Sampai jumpa di lapangan.";

            WhatsAppService::sendMessage($phone, $message);
        }

        $email = $booking->guest_email ?? ($booking->user->email ?? null);
        if ($email) {
            try {
                Mail::to($email)->send(new BookingInvoiceMail($booking));
            } catch (\Exception $e) {
                Log::error('Failed to send booking invoice email: ' . $e->getMessage());
            }
        }
    }

    public function notifyBookingConflict(Booking $booking): void
    {
        $phone = $booking->guest_phone ?? ($booking->user->phone ?? null);
        $name  = $booking->guest_name  ?? ($booking->user->name  ?? 'User');

        if ($phone) {
            $message = "⚠️ *MAAF, TERJADI BENTROK JADWAL*\n\n"
                . "Halo {$name}, kami mendeteksi adanya bentrok jadwal pada pesanan Anda (#MA-{$booking->id}).\n\n"
                . "Sesuai sistem kami, pembayaran pertama yang masuk adalah yang sah. "
                . "Dana Anda sedang kami kembalikan (Auto-Refund) melalui metode pembayaran yang Anda gunakan.\n\n"
                . "Estimasi refund: 1-3 hari kerja (tergantung bank/e-wallet).\n"
                . "Mohon maaf atas ketidaknyamanan ini.";

            WhatsAppService::sendMessage($phone, $message);
        }
    }

    public function generateAdminWhatsAppLink(Booking $booking): string
    {
        $wa_number = config('services.mandala.admin_wa', '6287892312759');
        $date  = $booking->starts_at->format('d/m/Y');
        $code  = 'MA-' . str_pad($booking->id, 5, '0', STR_PAD_LEFT);
        $message = urlencode(
            "Halo Admin Mandala Arena, saya ingin bertanya tentang pesanan Booking saya.\n\n"
            . "Kode Booking: {$code}\n"
            . "Fasilitas: {$booking->facility->name}\n"
            . "Tanggal: {$date}\n"
            . "Status: " . strtoupper($booking->status)
        );

        return "https://wa.me/{$wa_number}?text={$message}";
    }
}
