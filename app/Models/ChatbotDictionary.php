<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotDictionary extends Model
{
    protected $fillable = [
        'slang',
        'formal',
    ];
}
