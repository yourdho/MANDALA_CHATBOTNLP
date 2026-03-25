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
    ];

    protected $casts = [
        'images' => 'array',
        'price_per_hour' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
