<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamSelectionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RequestController extends Controller
{
    /**
     * Get all requests (team selections) for the provider.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->teamSelections();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Include relationships
        $query->with([
            'team.client',
            'prestationType'
        ]);

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $selections = $query->paginate($perPage);

        return TeamSelectionResource::collection($selections);
    }

    /**
     * Get a specific request.
     */
    public function show(Request $request, int $selectionId): JsonResponse
    {
        $selection = $request->user()
            ->teamSelections()
            ->with(['team.client', 'prestationType'])
            ->findOrFail($selectionId);

        return response()->json([
            'data' => new TeamSelectionResource($selection),
        ]);
    }

    /**
     * Accept a request.
     */
    public function accept(Request $request, int $selectionId): JsonResponse
    {
        $selection = $request->user()
            ->teamSelections()
            ->findOrFail($selectionId);

        if ($selection->status !== 'pending') {
            return response()->json([
                'message' => 'Cette demande a déjà été traitée.',
            ], 422);
        }

        $selection->update(['status' => 'confirmed']);

        $selection->load(['team.client', 'prestationType']);

        return response()->json([
            'message' => 'Demande acceptée avec succès.',
            'data' => new TeamSelectionResource($selection),
        ]);
    }

    /**
     * Reject a request.
     */
    public function reject(Request $request, int $selectionId): JsonResponse
    {
        $selection = $request->user()
            ->teamSelections()
            ->findOrFail($selectionId);

        if ($selection->status !== 'pending') {
            return response()->json([
                'message' => 'Cette demande a déjà été traitée.',
            ], 422);
        }

        $selection->update(['status' => 'rejected']);

        $selection->load(['team.client', 'prestationType']);

        return response()->json([
            'message' => 'Demande rejetée avec succès.',
            'data' => new TeamSelectionResource($selection),
        ]);
    }

    /**
     * Get pending requests count.
     */
    public function pendingCount(Request $request): JsonResponse
    {
        $count = $request->user()
            ->teamSelections()
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'data' => [
                'pending_count' => $count,
            ],
        ]);
    }
}
