<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MitraApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_tempat',
        'kategori_venue',
        'nama_pemilik',
        'no_hp',
        'status',
        'jadwal_temu',
        'catatan',
    ];

    protected $casts = [
        'jadwal_temu' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
