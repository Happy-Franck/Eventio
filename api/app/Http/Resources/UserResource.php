<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'provider' => $this->provider,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }),
            'prestation_types' => PrestationTypeResource::collection($this->whenLoaded('prestationTypes')),
            'provider_services' => ProviderServiceResource::collection($this->whenLoaded('providerServices')),
            'budgets_count' => $this->whenCounted('budgets'),
            'teams_count' => $this->whenCounted('teams'),
            'collections_count' => $this->whenCounted('collections'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
