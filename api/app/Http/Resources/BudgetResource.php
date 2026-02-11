<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
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
            'user_id' => $this->user_id,
            'event_name' => $this->event_name,
            'event_date' => $this->event_date?->format('Y-m-d'),
            'total_budget_min' => $this->total_budget_min,
            'total_budget_max' => $this->total_budget_max,
            'budget_range' => "{$this->total_budget_min} - {$this->total_budget_max} €",
            'status' => $this->status,
            'notes' => $this->notes,
            'client' => new UserResource($this->whenLoaded('client')),
            'items' => BudgetItemResource::collection($this->whenLoaded('items')),
            'items_count' => $this->whenCounted('items'),
            'total_allocated_min' => $this->when(isset($this->total_allocated_min), $this->total_allocated_min),
            'total_allocated_max' => $this->when(isset($this->total_allocated_max), $this->total_allocated_max),
            'total_actual_cost' => $this->when(isset($this->total_actual_cost), $this->total_actual_cost),
            'is_exceeded' => $this->when(method_exists($this->resource, 'isExceeded'), fn() => $this->isExceeded()),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
