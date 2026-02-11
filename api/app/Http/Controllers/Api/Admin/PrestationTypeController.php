<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PrestationTypeRequest;
use App\Http\Resources\PrestationTypeResource;
use App\Models\PrestationType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PrestationTypeController extends Controller
{
    /**
     * Display a listing of prestation types.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = PrestationType::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Include provider count
        $query->withCount('users');

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate or get all
        if ($request->boolean('all')) {
            $prestationTypes = $query->get();
            return PrestationTypeResource::collection($prestationTypes);
        }

        $perPage = $request->get('per_page', 15);
        $prestationTypes = $query->paginate($perPage);

        return PrestationTypeResource::collection($prestationTypes);
    }

    /**
     * Store a newly created prestation type.
     */
    public function store(PrestationTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Auto-generate slug if not provided
        if (!isset($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $prestationType = PrestationType::create($data);

        return response()->json([
            'message' => 'Type de prestation créé avec succès.',
            'data' => new PrestationTypeResource($prestationType),
        ], 201);
    }

    /**
     * Display the specified prestation type.
     */
    public function show(PrestationType $prestationType): JsonResponse
    {
        $prestationType->loadCount('users');

        return response()->json([
            'data' => new PrestationTypeResource($prestationType),
        ]);
    }

    /**
     * Update the specified prestation type.
     */
    public function update(PrestationTypeRequest $request, PrestationType $prestationType): JsonResponse
    {
        $data = $request->validated();
        
        // Auto-generate slug if name changed and slug not provided
        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $prestationType->update($data);

        return response()->json([
            'message' => 'Type de prestation mis à jour avec succès.',
            'data' => new PrestationTypeResource($prestationType),
        ]);
    }

    /**
     * Remove the specified prestation type.
     */
    public function destroy(PrestationType $prestationType): JsonResponse
    {
        // Check if prestation type is used by providers
        if ($prestationType->users()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer un type de prestation utilisé par des prestataires.',
            ], 422);
        }

        $prestationType->delete();

        return response()->json([
            'message' => 'Type de prestation supprimé avec succès.',
        ]);
    }
}
