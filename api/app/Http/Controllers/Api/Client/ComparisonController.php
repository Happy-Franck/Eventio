<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComparisonController extends Controller
{
    /**
     * Compare multiple providers.
     */
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'provider_ids' => 'required|array|min:2|max:5',
            'provider_ids.*' => 'exists:users,id',
            'prestation_type_id' => 'nullable|exists:prestation_types,id',
        ]);

        $providers = User::role('prestataire')
            ->whereIn('id', $request->provider_ids)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->with(['prestationTypes', 'providerServices.prestationType'])
            ->get();

        if ($providers->count() !== count($request->provider_ids)) {
            return response()->json([
                'message' => 'Un ou plusieurs prestataires ne sont pas disponibles.',
            ], 404);
        }

        $comparison = $providers->map(function ($provider) use ($request) {
            $services = $provider->providerServices;

            // Filter by prestation type if provided
            if ($request->filled('prestation_type_id')) {
                $services = $services->where('prestation_type_id', $request->prestation_type_id);
            }

            return [
                'provider' => [
                    'id' => $provider->id,
                    'name' => $provider->name,
                    'email' => $provider->email,
                ],
                'prestation_types' => $provider->prestationTypes->map(fn($pt) => [
                    'id' => $pt->id,
                    'name' => $pt->name,
                ]),
                'services' => $services->map(function ($service) {
                    return [
                        'prestation_type' => $service->prestationType->name,
                        'price_min' => $service->price_min,
                        'price_max' => $service->price_max,
                        'price_range' => "{$service->price_min} - {$service->price_max} €",
                        'experience_years' => $service->experience_years,
                        'is_available' => $service->is_available,
                        'description' => $service->description,
                    ];
                }),
                'services_count' => $services->count(),
                'average_price_min' => $services->avg('price_min'),
                'average_price_max' => $services->avg('price_max'),
            ];
        });

        return response()->json([
            'data' => $comparison,
            'comparison_count' => $comparison->count(),
        ]);
    }

    /**
     * Compare two providers side by side.
     */
    public function compareTwo(Request $request, int $providerId1, int $providerId2): JsonResponse
    {
        $request->validate([
            'prestation_type_id' => 'nullable|exists:prestation_types,id',
        ]);

        $provider1 = User::role('prestataire')
            ->where('id', $providerId1)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->with(['prestationTypes', 'providerServices.prestationType'])
            ->first();

        $provider2 = User::role('prestataire')
            ->where('id', $providerId2)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->with(['prestationTypes', 'providerServices.prestationType'])
            ->first();

        if (!$provider1 || !$provider2) {
            return response()->json([
                'message' => 'Un ou plusieurs prestataires ne sont pas disponibles.',
            ], 404);
        }

        $prestationTypeId = $request->prestation_type_id;

        $comparison = [
            'provider_1' => $this->formatProviderForComparison($provider1, $prestationTypeId),
            'provider_2' => $this->formatProviderForComparison($provider2, $prestationTypeId),
            'differences' => $this->calculateDifferences($provider1, $provider2, $prestationTypeId),
        ];

        return response()->json([
            'data' => $comparison,
        ]);
    }

    /**
     * Format provider data for comparison.
     */
    private function formatProviderForComparison(User $provider, ?int $prestationTypeId): array
    {
        $services = $provider->providerServices;

        if ($prestationTypeId) {
            $services = $services->where('prestation_type_id', $prestationTypeId);
        }

        return [
            'id' => $provider->id,
            'name' => $provider->name,
            'email' => $provider->email,
            'prestation_types' => $provider->prestationTypes->pluck('name'),
            'services' => $services->map(fn($s) => [
                'prestation_type' => $s->prestationType->name,
                'price_min' => $s->price_min,
                'price_max' => $s->price_max,
                'experience_years' => $s->experience_years,
                'description' => $s->description,
            ]),
            'average_price_min' => $services->avg('price_min'),
            'average_price_max' => $services->avg('price_max'),
            'total_experience' => $services->sum('experience_years'),
        ];
    }

    /**
     * Calculate differences between two providers.
     */
    private function calculateDifferences(User $provider1, User $provider2, ?int $prestationTypeId): array
    {
        $services1 = $provider1->providerServices;
        $services2 = $provider2->providerServices;

        if ($prestationTypeId) {
            $services1 = $services1->where('prestation_type_id', $prestationTypeId);
            $services2 = $services2->where('prestation_type_id', $prestationTypeId);
        }

        $avgPriceMin1 = $services1->avg('price_min') ?? 0;
        $avgPriceMin2 = $services2->avg('price_min') ?? 0;
        $avgPriceMax1 = $services1->avg('price_max') ?? 0;
        $avgPriceMax2 = $services2->avg('price_max') ?? 0;

        return [
            'price_difference_min' => abs($avgPriceMin1 - $avgPriceMin2),
            'price_difference_max' => abs($avgPriceMax1 - $avgPriceMax2),
            'cheaper_provider' => $avgPriceMin1 < $avgPriceMin2 ? $provider1->name : $provider2->name,
            'more_experienced' => $services1->sum('experience_years') > $services2->sum('experience_years') 
                ? $provider1->name 
                : $provider2->name,
        ];
    }
}
