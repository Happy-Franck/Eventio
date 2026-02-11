<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderServiceResource extends JsonResource
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
            'prestation_type_id' => $this->prestation_type_id,
            'price_min' => $this->price_min,
            'price_max' => $this->price_max,
            'price_range' => $this->price_min && $this->price_max 
                ? "{$this->price_min} - {$this->price_max} €"
                : null,
            'description' => $this->description,
            'portfolio_images' => $this->portfolio_images,
            'experience_years' => $this->experience_years,
            'is_available' => $this->is_available,
            'provider' => new UserResource($this->whenLoaded('provider')),
            'prestation_type' => new PrestationTypeResource($this->whenLoaded('prestationType')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
