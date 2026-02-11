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
            'username' => $this->username,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'bio' => $this->bio,
            'website' => $this->website,
            'business_type' => $this->business_type,
            'company_name' => $this->company_name,
            'is_active' => $this->is_active,
            'is_approved' => $this->is_approved,
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }),
            'prestation_types' => PrestationTypeResource::collection($this->whenLoaded('prestationTypes')),
            'provider_services' => ProviderServiceResource::collection($this->whenLoaded('providerServices')),
            'budgets_count' => $this->whenCounted('budgets'),
            'teams_count' => $this->whenCounted('teams'),
            'collections_count' => $this->whenCounted('collections'),
            'services_count' => $this->whenCounted('providerServices'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
