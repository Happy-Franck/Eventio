<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\Provider\ServiceRequest;
use App\Http\Resources\ProviderServiceResource;
use App\Models\ProviderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    /**
     * Display a listing of provider's services.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $services = $request->user()
            ->providerServices()
            ->with('prestationType')
            ->get();

        return ProviderServiceResource::collection($services);
    }

    /**
     * Store a newly created service.
     */
    public function store(ServiceRequest $request): JsonResponse
    {
        $provider = $request->user();

        // Check if service already exists for this prestation type
        $exists = $provider->providerServices()
            ->where('prestation_type_id', $request->prestation_type_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Vous avez déjà un service pour ce type de prestation.',
            ], 422);
        }

        // Verify provider has this prestation type
        if (!$provider->prestationTypes()->where('prestation_types.id', $request->prestation_type_id)->exists()) {
            return response()->json([
                'message' => 'Vous devez d\'abord ajouter ce type de prestation à votre profil.',
            ], 422);
        }

        $service = $provider->providerServices()->create($request->validated());

        $service->load('prestationType');

        return response()->json([
            'message' => 'Service créé avec succès.',
            'data' => new ProviderServiceResource($service),
        ], 201);
    }

    /**
     * Display the specified service.
     */
    public function show(Request $request, ProviderService $service): JsonResponse
    {
        // Verify ownership
        if ($service->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $service->load('prestationType');

        return response()->json([
            'data' => new ProviderServiceResource($service),
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(ServiceRequest $request, ProviderService $service): JsonResponse
    {
        // Verify ownership
        if ($service->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $service->update($request->validated());

        $service->load('prestationType');

        return response()->json([
            'message' => 'Service mis à jour avec succès.',
            'data' => new ProviderServiceResource($service),
        ]);
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Request $request, ProviderService $service): JsonResponse
    {
        // Verify ownership
        if ($service->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $service->delete();

        return response()->json([
            'message' => 'Service supprimé avec succès.',
        ]);
    }

    /**
     * Toggle service availability.
     */
    public function toggleAvailability(Request $request, ProviderService $service): JsonResponse
    {
        // Verify ownership
        if ($service->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $service->update([
            'is_available' => !$service->is_available,
        ]);

        $service->load('prestationType');

        return response()->json([
            'message' => $service->is_available 
                ? 'Service activé avec succès.' 
                : 'Service désactivé avec succès.',
            'data' => new ProviderServiceResource($service),
        ]);
    }
}
