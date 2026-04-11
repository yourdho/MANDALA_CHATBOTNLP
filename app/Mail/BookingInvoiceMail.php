<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Booking;

class BookingInvoiceMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $booking;

    /**
     * Create a new message instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Mission Receipt: Mandala Arena #' . strtoupper(substr(md5($this->booking->id), 0, 8)),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.bookings.invoice',
            with: [
                'booking' => $this->booking,
                'customerName' => $this->booking->guest_name ?? ($this->booking->user->name ?? 'Member'),
                'customerPhone' => $this->booking->guest_phone ?? ($this->booking->user->phone ?? '-'),
                'invoiceNumber' => 'MSN-' . str_pad($this->booking->id, 5, '0', STR_PAD_LEFT),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
