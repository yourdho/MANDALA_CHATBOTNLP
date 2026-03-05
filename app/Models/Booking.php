<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'booking_code',
        'user_id',
        'guest_name',
        'guest_phone',
        'venue_id',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'total_price',
        'points_earned',
        'payment_status',
        'payment_method',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'total_price' => 'decimal:2',
        'points_earned' => 'integer',
    ];

    // ── Relationships ────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function venue()
    {
        return $this->belongsTo(Venue::class);
    }

    // ── Helpers ──────────────────────────────────────────────────

    /** Nama pemesan: pakai nama user jika login, fallback ke guest_name */
    public function getBookerNameAttribute(): string
    {
        return $this->user?->name ?? $this->guest_name ?? 'Guest';
    }

    /** Apakah booking ini dilakukan oleh guest (tanpa akun) */
    public function isGuest(): bool
    {
        return is_null($this->user_id);
    }

    /**
     * Hitung poin yang diperoleh dari total harga.
     * Rumus: 1 poin per Rp 1.000 yang dibayar.
     */
    public static function calculatePoints(float $totalPrice): int
    {
        return (int) floor($totalPrice / 1000);
    }
}
