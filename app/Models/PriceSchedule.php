<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'sport_type',
        'session_name',
        'start_time',
        'end_time',
        'price',
    ];
}
