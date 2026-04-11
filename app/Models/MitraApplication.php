<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MitraApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_tempat',
        'nama_pemilik',
        'no_hp',
        'qris_rekening',
        'status',
        'jadwal_temu',
        'catatan',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'jadwal_temu' => 'datetime',
    ];

    /**
     * Get the user that owns the application.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
