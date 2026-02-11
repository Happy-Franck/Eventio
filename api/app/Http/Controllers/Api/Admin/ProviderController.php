<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProviderController extends Controller
{
    /**
     * Display a listing of providers.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::role('prestataire');

        // Search by name or email
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter by prestation type
        if ($request->filled('prestation_type_id')) {
            $query->whereHas('prestationTypes', function ($q) use ($request) {
                $q->where('prestation_types.id', $request->prestation_type_id);
            });
        }

        // Include relationships and counts
        $query->with(['roles', 'prestationTypes', 'providerServices']);

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
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

        $provider->load(['roles', 'prestationTypes', 'providerServices.prestationType']);

        return response()->json([
            'data' => new UserResource($provider),
        ]);
    }

    /**
     * Update the specified provider.
     */
    public function update(UpdateUserRequest $request, User $provider): JsonResponse
    {
        // Verify user is a provider
        if (!$provider->hasRole('prestataire')) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        $data = $request->validated();

        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        // Update prestation types if provided
        if (isset($data['prestation_type_ids'])) {
            $provider->prestationTypes()->sync($data['prestation_type_ids']);
            unset($data['prestation_type_ids']);
        }

        $provider->update($data);

        $provider->load(['roles', 'prestationTypes']);

        return response()->json([
            'message' => 'Prestataire mis à jour avec succès.',
            'data' => new UserResource($provider),
        ]);
    }

    /**
     * Remove the specified provider.
     */
    public function destroy(User $provider): JsonResponse
    {
        // Verify user is a provider
        if (!$provider->hasRole('prestataire')) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        $provider->delete();

        return response()->json([
            'message' => 'Prestataire supprimé avec succès.',
        ]);
    }

    /**
     * Approve the specified provider.
     */
    public function approve(User $provider): JsonResponse
    {
        if (!$provider->hasRole('prestataire')) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        $provider->update(['is_approved' => true, 'is_active' => true]);

        return response()->json([
            'message' => 'Prestataire approuvé avec succès.',
            'data' => new UserResource($provider),
        ]);
    }

    /**
     * Reject the specified provider.
     */
    public function reject(User $provider): JsonResponse
    {
        if (!$provider->hasRole('prestataire')) {
            return response()->json([
                'message' => 'Prestataire non trouvé.',
            ], 404);
        }

        $provider->update(['is_approved' => false, 'is_active' => false]);

        return response()->json([
            'message' => 'Prestataire rejeté avec succès.',
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
            ->get();

        return response()->json([
            'data' => $services,
        ]);
    }
}
