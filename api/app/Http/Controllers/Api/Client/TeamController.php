<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\TeamRequest;
use App\Http\Requests\Client\TeamSelectionRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use App\Models\TeamSelection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TeamController extends Controller
{
    /**
     * Display a listing of client's teams.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Team::where('user_id', $request->user()->id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by event name
        if ($request->filled('search')) {
            $query->where('event_name', 'like', "%{$request->search}%");
        }

        // Filter upcoming events
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        // Include relationships
        $query->with(['selections.provider', 'selections.prestationType'])
              ->withCount('selections');

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $teams = $query->paginate($perPage);

        return TeamResource::collection($teams);
    }

    /**
     * Store a newly created team.
     */
    public function store(TeamRequest $request): JsonResponse
    {
        $team = Team::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        $team->load('selections.provider', 'selections.prestationType');

        return response()->json([
            'message' => 'Team créée avec succès.',
            'data' => new TeamResource($team),
        ], 201);
    }

    /**
     * Display the specified team.
     */
    public function show(Request $request, Team $team): JsonResponse
    {
        // Verify ownership
        if ($team->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $team->load(['selections.provider', 'selections.prestationType'])
             ->loadCount('selections');

        return response()->json([
            'data' => new TeamResource($team),
        ]);
    }

    /**
     * Update the specified team.
     */
    public function update(TeamRequest $request, Team $team): JsonResponse
    {
        // Verify ownership
        if ($team->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $team->update($request->validated());

        $team->load('selections.provider', 'selections.prestationType');

        return response()->json([
            'message' => 'Team mise à jour avec succès.',
            'data' => new TeamResource($team),
        ]);
    }

    /**
     * Remove the specified team.
     */
    public function destroy(Request $request, Team $team): JsonResponse
    {
        // Verify ownership
        if ($team->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $team->delete();

        return response()->json([
            'message' => 'Team supprimée avec succès.',
        ]);
    }

    /**
     * Add a selection to the team (add to cart).
     */
    public function addSelection(TeamSelectionRequest $request, Team $team): JsonResponse
    {
        // Verify ownership
        if ($team->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        // Check if selection already exists
        $exists = $team->selections()
            ->where('provider_id', $request->provider_id)
            ->where('prestation_type_id', $request->prestation_type_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce prestataire avec ce type de prestation existe déjà dans la team.',
            ], 422);
        }

        $selection = $team->selections()->create($request->validated());

        $selection->load(['provider', 'prestationType']);

        return response()->json([
            'message' => 'Sélection ajoutée à la team avec succès.',
            'data' => $selection,
        ], 201);
    }

    /**
     * Remove a selection from the team.
     */
    public function removeSelection(Request $request, Team $team, TeamSelection $selection): JsonResponse
    {
        // Verify ownership
        if ($team->user_id !== $request->user()->id || $selection->team_id !== $team->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $selection->delete();

        return response()->json([
            'message' => 'Sélection retirée de la team avec succès.',
        ]);
    }

    /**
     * Get total estimated price for the team.
     */
    public function totalEstimate(Request $request, Team $team): JsonResponse
    {
        // Verify ownership
        if ($team->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $team->load('selections.provider', 'selections.prestationType');

        $summary = [
            'team' => new TeamResource($team),
            'total_estimated_price' => $team->total_estimated_price,
            'confirmed_count' => $team->confirmed_count,
            'pending_count' => $team->pending_count,
            'selections_count' => $team->selections->count(),
        ];

        return response()->json([
            'data' => $summary,
        ]);
    }
}
