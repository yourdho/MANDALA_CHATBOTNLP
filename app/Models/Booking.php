<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'facility_id',
        'guest_name',
        'guest_email',
        'guest_phone',
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
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_with_referee' => 'boolean',
        'total_price' => 'decimal:2',
        'referee_price' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

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
