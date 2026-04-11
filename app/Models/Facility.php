<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'price_per_hour',
        'open_time',
        'close_time',
        'images',
        'is_active',
        'addons',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'qris_image_url',
    ];

    protected $casts = [
        'images' => 'array',
        'addons' => 'array',
        'is_active' => 'boolean',
        'price_per_hour' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
