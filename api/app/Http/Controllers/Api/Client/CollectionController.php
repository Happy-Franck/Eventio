<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\CollectionRequest;
use App\Http\Resources\CollectionResource;
use App\Models\Collection;
use App\Models\CollectionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CollectionController extends Controller
{
    /**
     * Display a listing of client's collections.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Collection::where('user_id', $request->user()->id);

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by public/private
        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        // Search by name
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Include relationships
        $query->with(['category', 'items.provider', 'items.prestationType'])
              ->withCount('items');

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $collections = $query->paginate($perPage);

        return CollectionResource::collection($collections);
    }

    /**
     * Store a newly created collection.
     */
    public function store(CollectionRequest $request): JsonResponse
    {
        $collection = Collection::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        $collection->load(['category', 'items']);

        return response()->json([
            'message' => 'Collection créée avec succès.',
            'data' => new CollectionResource($collection),
        ], 201);
    }

    /**
     * Display the specified collection.
     */
    public function show(Request $request, Collection $collection): JsonResponse
    {
        // Verify ownership
        if ($collection->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $collection->load(['category', 'items.provider', 'items.prestationType'])
                   ->loadCount('items');

        return response()->json([
            'data' => new CollectionResource($collection),
        ]);
    }

    /**
     * Update the specified collection.
     */
    public function update(CollectionRequest $request, Collection $collection): JsonResponse
    {
        // Verify ownership
        if ($collection->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $collection->update($request->validated());

        $collection->load(['category', 'items']);

        return response()->json([
            'message' => 'Collection mise à jour avec succès.',
            'data' => new CollectionResource($collection),
        ]);
    }

    /**
     * Remove the specified collection.
     */
    public function destroy(Request $request, Collection $collection): JsonResponse
    {
        // Verify ownership
        if ($collection->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $collection->delete();

        return response()->json([
            'message' => 'Collection supprimée avec succès.',
        ]);
    }

    /**
     * Add an item to the collection.
     */
    public function addItem(Request $request, Collection $collection): JsonResponse
    {
        // Verify ownership
        if ($collection->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $request->validate([
            'provider_id' => 'required|exists:users,id',
            'prestation_type_id' => 'required|exists:prestation_types,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if item already exists
        $exists = $collection->items()
            ->where('provider_id', $request->provider_id)
            ->where('prestation_type_id', $request->prestation_type_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Cet item existe déjà dans la collection.',
            ], 422);
        }

        // Get next order
        $maxOrder = $collection->items()->max('order') ?? 0;

        $item = $collection->items()->create([
            'provider_id' => $request->provider_id,
            'prestation_type_id' => $request->prestation_type_id,
            'notes' => $request->notes,
            'order' => $maxOrder + 1,
        ]);

        $item->load(['provider', 'prestationType']);

        return response()->json([
            'message' => 'Item ajouté à la collection avec succès.',
            'data' => $item,
        ], 201);
    }

    /**
     * Remove an item from the collection.
     */
    public function removeItem(Request $request, Collection $collection, CollectionItem $item): JsonResponse
    {
        // Verify ownership
        if ($collection->user_id !== $request->user()->id || $item->collection_id !== $collection->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $item->delete();

        return response()->json([
            'message' => 'Item retiré de la collection avec succès.',
        ]);
    }

    /**
     * Get collections by category.
     */
    public function byCategory(Request $request, int $categoryId): AnonymousResourceCollection
    {
        $collections = Collection::where('user_id', $request->user()->id)
            ->where('category_id', $categoryId)
            ->with(['category', 'items.provider', 'items.prestationType'])
            ->withCount('items')
            ->get();

        return CollectionResource::collection($collections);
    }
}
