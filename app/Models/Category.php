<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'icon'];

    public function venues()
    {
        return $this->hasMany(Venue::class);
    }
}
