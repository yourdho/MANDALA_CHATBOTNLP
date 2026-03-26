<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SportsMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'team_name',
        'facility',
        'date',
        'time',
        'skill_level',
        'contact_type',
        'contact_value',
        'status',
        'matched_with'
    ];

    protected $casts = [
        'date' => 'date',
        'skill_level' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function opponent()
    {
        return $this->belongsTo(User::class, 'matched_with');
    }
}
