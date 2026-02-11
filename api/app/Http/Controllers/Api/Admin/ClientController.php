<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::role('client');

        // Search by name or email
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Include relationships and counts
        $query->with(['roles'])
              ->withCount(['budgets', 'teams', 'collections']);

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $clients = $query->paginate($perPage);

        return UserResource::collection($clients);
    }

    /**
     * Display the specified client.
     */
    public function show(User $client): JsonResponse
    {
        // Verify user is a client
        if (!$client->hasRole('client')) {
            return response()->json([
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }

        $client->load(['roles'])
               ->loadCount(['budgets', 'teams', 'collections']);

        return response()->json([
            'data' => new UserResource($client),
        ]);
    }

    /**
     * Update the specified client.
     */
    public function update(UpdateUserRequest $request, User $client): JsonResponse
    {
        // Verify user is a client
        if (!$client->hasRole('client')) {
            return response()->json([
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }

        $data = $request->validated();

        // Hash password if provided
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        $client->update($data);

        $client->load(['roles']);

        return response()->json([
            'message' => 'Client mis à jour avec succès.',
            'data' => new UserResource($client),
        ]);
    }

    /**
     * Remove the specified client.
     */
    public function destroy(User $client): JsonResponse
    {
        // Verify user is a client
        if (!$client->hasRole('client')) {
            return response()->json([
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }

        $client->delete();

        return response()->json([
            'message' => 'Client supprimé avec succès.',
        ]);
    }

    /**
     * Suspend the specified client.
     */
    public function suspend(User $client): JsonResponse
    {
        if (!$client->hasRole('client')) {
            return response()->json([
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }

        $client->update(['is_active' => false]);

        return response()->json([
            'message' => 'Client suspendu avec succès.',
            'data' => new UserResource($client),
        ]);
    }

    /**
     * Activate the specified client.
     */
    public function activate(User $client): JsonResponse
    {
        if (!$client->hasRole('client')) {
            return response()->json([
                'message' => 'Utilisateur non trouvé.',
            ], 404);
        }

        $client->update(['is_active' => true]);

        return response()->json([
            'message' => 'Client activé avec succès.',
            'data' => new UserResource($client),
        ]);
    }
}
