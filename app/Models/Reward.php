<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reward extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'image_url',
        'applicable_category',
        'points_required',
        'discount_type',
        'discount_value',
        'max_discount',
        'valid_until',
        'quota',
        'is_active',
    ];

    protected $casts = [
        'points_required' => 'integer',
        'discount_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'valid_until' => 'date',
        'quota' => 'integer',
        'is_active' => 'boolean',
    ];

    // ── Relationships ────────────────────────────────────────────

    public function userRewards()
    {
        return $this->hasMany(UserReward::class);
    }
}
