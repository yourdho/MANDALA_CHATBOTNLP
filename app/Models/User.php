<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'points_balance',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'points_balance' => 'integer',
        ];
    }

    // ── Relationships ────────────────────────────────────────────

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    // ── Points Helpers ───────────────────────────────────────────

    /**
     * Tambahkan poin ke saldo user dan kembalikan jumlah baru.
     */
    public function addPoints(int $points): int
    {
        $this->increment('points_balance', $points);
        return $this->fresh()->points_balance;
    }

    /**
     * Gunakan poin (kurangi saldo). Kembalikan false jika saldo tidak cukup.
     */
    public function usePoints(int $points): bool
    {
        if ($this->points_balance < $points) {
            return false;
        }
        $this->decrement('points_balance', $points);
        return true;
    }

    /**
     * Konversi saldo poin ke nilai diskon Rupiah.
     * Rumus: 1 poin = Rp 1 diskon.
     */
    public function pointsValueInRupiah(): int
    {
        return $this->points_balance; // 1 poin = Rp 1
    }
}
