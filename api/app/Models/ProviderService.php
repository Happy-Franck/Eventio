<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProviderService extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'prestation_type_id',
        'price_min',
        'price_max',
        'description',
        'portfolio_images',
        'experience_years',
        'is_available',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price_min' => 'decimal:2',
        'price_max' => 'decimal:2',
        'portfolio_images' => 'array',
        'experience_years' => 'integer',
        'is_available' => 'boolean',
    ];

    /**
     * Get the provider (user) that owns the service.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the prestation type for this service.
     */
    public function prestationType(): BelongsTo
    {
        return $this->belongsTo(PrestationType::class);
    }

    /**
     * Scope a query to only include available services.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope a query to filter by price range.
     */
    public function scopeInPriceRange($query, $minPrice, $maxPrice)
    {
        return $query->where(function ($q) use ($minPrice, $maxPrice) {
            $q->whereBetween('price_min', [$minPrice, $maxPrice])
              ->orWhereBetween('price_max', [$minPrice, $maxPrice])
              ->orWhere(function ($q2) use ($minPrice, $maxPrice) {
                  $q2->where('price_min', '<=', $minPrice)
                     ->where('price_max', '>=', $maxPrice);
              });
        });
    }
}
