<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PrestationType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    /**
     * Les utilisateurs (prestataires) qui ont ce type de prestation
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_prestation_types');
    }
}
