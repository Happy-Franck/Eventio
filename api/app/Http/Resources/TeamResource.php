<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
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
            'event_location' => $this->event_location,
            'expected_guests' => $this->expected_guests,
            'status' => $this->status,
            'notes' => $this->notes,
            'client' => new UserResource($this->whenLoaded('client')),
            'selections' => TeamSelectionResource::collection($this->whenLoaded('selections')),
            'selections_count' => $this->whenCounted('selections'),
            'total_estimated_price' => $this->when(isset($this->total_estimated_price), $this->total_estimated_price),
            'confirmed_count' => $this->when(isset($this->confirmed_count), $this->confirmed_count),
            'pending_count' => $this->when(isset($this->pending_count), $this->pending_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
