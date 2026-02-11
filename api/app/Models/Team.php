<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'event_name',
        'event_date',
        'event_location',
        'expected_guests',
        'status',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'event_date' => 'date',
        'expected_guests' => 'integer',
    ];

    /**
     * Get the client (user) that owns the team.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the selections for this team.
     */
    public function selections(): HasMany
    {
        return $this->hasMany(TeamSelection::class);
    }

    /**
     * Calculate total estimated price.
     */
    public function getTotalEstimatedPriceAttribute(): float
    {
        return $this->selections()->sum('estimated_price');
    }

    /**
     * Get count of confirmed selections.
     */
    public function getConfirmedCountAttribute(): int
    {
        return $this->selections()->where('status', 'confirmed')->count();
    }

    /**
     * Get count of pending selections.
     */
    public function getPendingCountAttribute(): int
    {
        return $this->selections()->where('status', 'pending')->count();
    }

    /**
     * Scope a query to only include active teams.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to include upcoming events.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now())->orderBy('event_date');
    }
}
