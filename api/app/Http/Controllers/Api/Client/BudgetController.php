<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\BudgetItemRequest;
use App\Http\Requests\Client\BudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Models\BudgetItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BudgetController extends Controller
{
    /**
     * Display a listing of client's budgets.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Budget::where('user_id', $request->user()->id);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search by event name
        if ($request->filled('search')) {
            $query->where('event_name', 'like', "%{$request->search}%");
        }

        // Include relationships
        $query->with(['items.prestationType'])
              ->withCount('items');

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $budgets = $query->paginate($perPage);

        return BudgetResource::collection($budgets);
    }

    /**
     * Store a newly created budget.
     */
    public function store(BudgetRequest $request): JsonResponse
    {
        $budget = Budget::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        $budget->load('items.prestationType');

        return response()->json([
            'message' => 'Budget créé avec succès.',
            'data' => new BudgetResource($budget),
        ], 201);
    }

    /**
     * Display the specified budget.
     */
    public function show(Request $request, Budget $budget): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $budget->load(['items.prestationType'])
               ->loadCount('items');

        return response()->json([
            'data' => new BudgetResource($budget),
        ]);
    }

    /**
     * Update the specified budget.
     */
    public function update(BudgetRequest $request, Budget $budget): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $budget->update($request->validated());

        $budget->load('items.prestationType');

        return response()->json([
            'message' => 'Budget mis à jour avec succès.',
            'data' => new BudgetResource($budget),
        ]);
    }

    /**
     * Remove the specified budget.
     */
    public function destroy(Request $request, Budget $budget): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $budget->delete();

        return response()->json([
            'message' => 'Budget supprimé avec succès.',
        ]);
    }

    /**
     * Add an item to the budget.
     */
    public function addItem(BudgetItemRequest $request, Budget $budget): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        // Check if item already exists
        $exists = $budget->items()
            ->where('prestation_type_id', $request->prestation_type_id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce type de prestation existe déjà dans le budget.',
            ], 422);
        }

        $item = $budget->items()->create($request->validated());

        $item->load('prestationType');

        return response()->json([
            'message' => 'Item ajouté au budget avec succès.',
            'data' => $item,
        ], 201);
    }

    /**
     * Update a budget item.
     */
    public function updateItem(BudgetItemRequest $request, Budget $budget, BudgetItem $item): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id || $item->budget_id !== $budget->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $item->update($request->validated());

        $item->load('prestationType');

        return response()->json([
            'message' => 'Item mis à jour avec succès.',
            'data' => $item,
        ]);
    }

    /**
     * Remove an item from the budget.
     */
    public function removeItem(Request $request, Budget $budget, BudgetItem $item): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id || $item->budget_id !== $budget->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $item->delete();

        return response()->json([
            'message' => 'Item supprimé du budget avec succès.',
        ]);
    }

    /**
     * Get budget summary with calculations.
     */
    public function summary(Request $request, Budget $budget): JsonResponse
    {
        // Verify ownership
        if ($budget->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Non autorisé.',
            ], 403);
        }

        $budget->load('items.prestationType');

        $summary = [
            'budget' => new BudgetResource($budget),
            'total_allocated_min' => $budget->total_allocated_min,
            'total_allocated_max' => $budget->total_allocated_max,
            'total_actual_cost' => $budget->total_actual_cost,
            'remaining_min' => $budget->total_budget_min - $budget->total_allocated_min,
            'remaining_max' => $budget->total_budget_max - $budget->total_allocated_max,
            'is_exceeded' => $budget->isExceeded(),
            'items_count' => $budget->items->count(),
        ];

        return response()->json([
            'data' => $summary,
        ]);
    }
}
