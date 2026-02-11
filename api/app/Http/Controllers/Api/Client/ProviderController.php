<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProviderServiceResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProviderController extends Controller
{
    /**
     * Display a listing of providers with filters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::role('prestataire')
            ->where('is_active', true)
            ->where('is_approved', true);

        // Filter by prestation type
        if ($request->filled('prestation_type_id')) {
            $query->whereHas('prestationTypes', function ($q) use ($request) {
                $q->where('prestation_types.id', $request->prestation_type_id);
            });
        }

        // Filter by category (through prestation types)
        if ($request->filled('category_id')) {
            // This would require a category relationship on prestation_types
            // For now, we'll skip this filter
        }

        // Filter by price range
        if ($request->filled('price_min') || $request->filled('price_max')) {
            $query->whereHas('providerServices', function ($q) use ($request) {
                if ($request->filled('price_min')) {
                    $q->where('price_max', '>=', $request->price_min);
                }
                if ($request->filled('price_max')) {
                    $q->where('price_min', '<=', $request->price_max);
                }
            });
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Include relationships
        $query->with(['prestationTypes', 'providerServices.prestationType']);

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $providers = $query->paginate($perPage);

        return UserResource::collection($providers);
    }

    /**
     * Display the specified provider.
     */
    public function show(User $provider): JsonResponse
    {
        // Verify user is a provider
        if (!$provider->hasRole('prestataire')) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        // Verify provider is active and approved
        if (!$provider->is_active || !$provider->is_approved) {
            return response()->json([
                'message' => 'Prestataire non disponible.',
            ], 404);
        }

        $provider->load(['prestationTypes', 'providerServices.prestationType']);

        return response()->json([
            'data' => new UserResource($provider),
        ]);
    }

    /**
     * Get services for a specific provider.
     */
    public function services(User $provider): JsonResponse
    {
        if (!$provider->hasRole('prestataire')) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        $services = $provider->providerServices()
            ->with('prestationType')
            ->where('is_available', true)
            ->get();

        return response()->json([
            'data' => ProviderServiceResource::collection($services),
        ]);
    }

    /**
     * Get providers by prestation type.
     */
    public function byPrestationType(int $prestationTypeId): AnonymousResourceCollection
    {
        $providers = User::role('prestataire')
            ->where('is_active', true)
            ->where('is_approved', true)
            ->whereHas('prestationTypes', function ($q) use ($prestationTypeId) {
                $q->where('prestation_types.id', $prestationTypeId);
            })
            ->with(['prestationTypes', 'providerServices.prestationType'])
            ->get();

        return UserResource::collection($providers);
    }
}
