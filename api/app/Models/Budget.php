<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
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
        'total_budget_min',
        'total_budget_max',
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
        'total_budget_min' => 'decimal:2',
        'total_budget_max' => 'decimal:2',
    ];

    /**
     * Get the client (user) that owns the budget.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the budget items for this budget.
     */
    public function items(): HasMany
    {
        return $this->hasMany(BudgetItem::class);
    }

    /**
     * Calculate total allocated budget (min).
     */
    public function getTotalAllocatedMinAttribute(): float
    {
        return $this->items()->sum('allocated_min');
    }

    /**
     * Calculate total allocated budget (max).
     */
    public function getTotalAllocatedMaxAttribute(): float
    {
        return $this->items()->sum('allocated_max');
    }

    /**
     * Calculate total actual cost.
     */
    public function getTotalActualCostAttribute(): float
    {
        return $this->items()->sum('actual_cost');
    }

    /**
     * Check if budget is exceeded.
     */
    public function isExceeded(): bool
    {
        return $this->total_actual_cost > $this->total_budget_max;
    }

    /**
     * Scope a query to only include active budgets.
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
}
