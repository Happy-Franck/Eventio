<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'budget_id' => $this->budget_id,
            'prestation_type_id' => $this->prestation_type_id,
            'allocated_min' => $this->allocated_min,
            'allocated_max' => $this->allocated_max,
            'allocated_range' => "{$this->allocated_min} - {$this->allocated_max} €",
            'actual_cost' => $this->actual_cost,
            'notes' => $this->notes,
            'prestation_type' => new PrestationTypeResource($this->whenLoaded('prestationType')),
            'is_over_budget' => $this->when(method_exists($this->resource, 'isOverBudget'), fn() => $this->isOverBudget()),
            'variance' => $this->when(isset($this->variance), $this->variance),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
