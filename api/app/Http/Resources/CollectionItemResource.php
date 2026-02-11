<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CollectionItemResource extends JsonResource
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
            'collection_id' => $this->collection_id,
            'provider_id' => $this->provider_id,
            'prestation_type_id' => $this->prestation_type_id,
            'order' => $this->order,
            'notes' => $this->notes,
            'provider' => new UserResource($this->whenLoaded('provider')),
            'prestation_type' => new PrestationTypeResource($this->whenLoaded('prestationType')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
