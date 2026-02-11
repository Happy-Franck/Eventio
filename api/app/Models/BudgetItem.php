<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'budget_id',
        'prestation_type_id',
        'allocated_min',
        'allocated_max',
        'actual_cost',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'allocated_min' => 'decimal:2',
        'allocated_max' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    /**
     * Get the budget that owns the item.
     */
    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    /**
     * Get the prestation type for this budget item.
     */
    public function prestationType(): BelongsTo
    {
        return $this->belongsTo(PrestationType::class);
    }

    /**
     * Check if actual cost exceeds allocated budget.
     */
    public function isOverBudget(): bool
    {
        return $this->actual_cost && $this->actual_cost > $this->allocated_max;
    }

    /**
     * Get the variance between actual and allocated.
     */
    public function getVarianceAttribute(): ?float
    {
        if (!$this->actual_cost) {
            return null;
        }

        $midpoint = ($this->allocated_min + $this->allocated_max) / 2;
        return $this->actual_cost - $midpoint;
    }
}
