<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ProfileUpdateRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get provider profile.
     */
    public function show(Request $request): JsonResponse
    {
        $provider = $request->user()->load([
            'roles',
            'prestationTypes',
            'providerServices.prestationType'
        ]);

        return response()->json([
            'data' => new UserResource($provider),
        ]);
    }

    /**
     * Update provider profile.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $provider = $request->user();
        $data = $request->validated();

        // Update prestation types if provided
        if (isset($data['prestation_type_ids'])) {
            $provider->prestationTypes()->sync($data['prestation_type_ids']);
            unset($data['prestation_type_ids']);
        }

        // Update profile
        $provider->update($data);

        $provider->load(['roles', 'prestationTypes', 'providerServices.prestationType']);

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'data' => new UserResource($provider),
        ]);
    }

    /**
     * Get provider statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $provider = $request->user();

        $stats = [
            'services_count' => $provider->providerServices()->count(),
            'active_services_count' => $provider->providerServices()->where('is_available', true)->count(),
            'prestation_types_count' => $provider->prestationTypes()->count(),
            'team_selections_count' => $provider->teamSelections()->count(),
            'confirmed_selections_count' => $provider->teamSelections()->where('status', 'confirmed')->count(),
            'pending_selections_count' => $provider->teamSelections()->where('status', 'pending')->count(),
            'collection_items_count' => $provider->collectionItems()->count(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
