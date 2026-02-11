<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    /**
     * Get provider statistics and analytics.
     */
    public function index(Request $request): JsonResponse
    {
        $provider = $request->user();

        // Services statistics
        $servicesStats = [
            'total_services' => $provider->providerServices()->count(),
            'active_services' => $provider->providerServices()->where('is_available', true)->count(),
            'inactive_services' => $provider->providerServices()->where('is_available', false)->count(),
        ];

        // Requests statistics
        $requestsStats = [
            'total_requests' => $provider->teamSelections()->count(),
            'pending_requests' => $provider->teamSelections()->where('status', 'pending')->count(),
            'confirmed_requests' => $provider->teamSelections()->where('status', 'confirmed')->count(),
            'rejected_requests' => $provider->teamSelections()->where('status', 'rejected')->count(),
        ];

        // Collections statistics
        $collectionsStats = [
            'total_in_collections' => $provider->collectionItems()->count(),
            'unique_collections' => $provider->collectionItems()->distinct('collection_id')->count('collection_id'),
        ];

        // Price statistics
        $services = $provider->providerServices;
        $priceStats = [
            'average_price_min' => $services->avg('price_min'),
            'average_price_max' => $services->avg('price_max'),
            'lowest_price' => $services->min('price_min'),
            'highest_price' => $services->max('price_max'),
        ];

        // Recent activity
        $recentRequests = $provider->teamSelections()
            ->with(['team.client', 'prestationType'])
            ->latest()
            ->take(5)
            ->get();

        $stats = [
            'services' => $servicesStats,
            'requests' => $requestsStats,
            'collections' => $collectionsStats,
            'pricing' => $priceStats,
            'recent_requests' => $recentRequests,
            'profile_completion' => $this->calculateProfileCompletion($provider),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }

    /**
     * Calculate profile completion percentage.
     */
    private function calculateProfileCompletion($provider): array
    {
        $fields = [
            'name' => !empty($provider->name),
            'email' => !empty($provider->email),
            'phone' => !empty($provider->phone),
            'address' => !empty($provider->address),
            'city' => !empty($provider->city),
            'bio' => !empty($provider->bio),
            'website' => !empty($provider->website),
            'prestation_types' => $provider->prestationTypes()->count() > 0,
            'services' => $provider->providerServices()->count() > 0,
        ];

        $completed = count(array_filter($fields));
        $total = count($fields);
        $percentage = round(($completed / $total) * 100);

        return [
            'percentage' => $percentage,
            'completed_fields' => $completed,
            'total_fields' => $total,
            'missing_fields' => array_keys(array_filter($fields, fn($v) => !$v)),
        ];
    }

    /**
     * Get monthly statistics.
     */
    public function monthly(Request $request): JsonResponse
    {
        $provider = $request->user();
        $year = $request->get('year', now()->year);

        $monthlyStats = [];

        for ($month = 1; $month <= 12; $month++) {
            $startDate = now()->setYear($year)->setMonth($month)->startOfMonth();
            $endDate = now()->setYear($year)->setMonth($month)->endOfMonth();

            $monthlyStats[] = [
                'month' => $month,
                'month_name' => $startDate->format('F'),
                'requests_received' => $provider->teamSelections()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'requests_confirmed' => $provider->teamSelections()
                    ->where('status', 'confirmed')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'added_to_collections' => $provider->collectionItems()
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
            ];
        }

        return response()->json([
            'data' => [
                'year' => $year,
                'monthly_stats' => $monthlyStats,
            ],
        ]);
    }
}
