<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending'; // Menunggu Pembayaran
    const STATUS_CONFIRMED = 'confirmed'; // Dikonfirmasi
    const STATUS_CANCELLED = 'cancelled'; // Dibatalkan
    const STATUS_REFUND_PROCESSED = 'refund_processing'; // Refund Diproses
    const STATUS_REFUND_SUCCESSFUL = 'refund_successful'; // Refund Berhasil

    protected $fillable = [
        'user_id',
        'facility_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'booking_token',
        'starts_at',
        'ends_at',
        'duration_hours',
        'is_with_referee',
        'referee_price',
        'total_price',
        'dp_amount',
        'points_used',
        'user_reward_id',
        'discount_amount',
        'status',
        'payment_status',
        'payment_token',
        'snap_token',
        'payment_url',
        'payment_method',
        'selected_addons',
        'addons_total_price',
        'paid_at',
        'refund_id',
        'refund_status',
        'conflict_note',
        'booking_slot_key',
    ];

    protected $casts = [
        'starts_at'        => 'datetime',
        'ends_at'          => 'datetime',
        'paid_at'          => 'datetime',
        'is_with_referee'  => 'boolean',
        'total_price'      => 'decimal:2',
        'referee_price'    => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'selected_addons'  => 'array',
        'addons_total_price' => 'decimal:2',
    ];

    /**
     * Auto-generate booking_token (UUID) saat record pertama kali dibuat.
     * Token ini dipakai sebagai parameter URL publik untuk menggantikan ID integer
     * sehingga IDOR via enumeration tidak mungkin terjadi.
     *
     * Juga menjaga booking_slot_key agar konsisten saat saving.
     */
    protected static function booted(): void
    {
        // Set UUID token saat creating
        static::creating(function (self $booking) {
            if (empty($booking->booking_token)) {
                $booking->booking_token = (string) Str::uuid();
            }
        });

        // Maintain booking_slot_key saat setiap save
        static::saving(function (self $booking) {
            if ($booking->status === self::STATUS_CANCELLED) {
                // Bebaskan slot agar bisa dipesan orang lain
                $booking->booking_slot_key = null;
            } elseif ($booking->facility_id && $booking->starts_at) {
                $booking->booking_slot_key = $booking->facility_id . '-' . $booking->starts_at->format('YmdHi');
            }
        });
    }

    // ── Relationships ────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }

    public function userReward()
    {
        return $this->belongsTo(UserReward::class);
    }

    // ── Helpers ──────────────────────────────────────────────────

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function isMiniSoccer(): bool
    {
        return str_contains(strtolower($this->facility?->name ?? ''), 'mini soccer');
    }

    public function getBookingCodeAttribute(): string
    {
        return 'MA-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }
}
