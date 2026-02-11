<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\MagicLinkController;
use App\Http\Controllers\Auth\OTPController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PrestationTypeController;
use Illuminate\Support\Facades\Route;

// Public routes - Types de prestation (accessible sans authentification)
Route::get('/prestation-types', [PrestationTypeController::class, 'index']);
Route::get('/prestation-types/{id}', [PrestationTypeController::class, 'show']);

// Public routes - Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/complete-registration', [AuthController::class, 'completeRegistration']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // OTP Login routes
    Route::prefix('otp')->group(function () {
        Route::post('/send', [OTPController::class, 'send']);
        Route::post('/verify', [OTPController::class, 'verify']);
        Route::post('/resend', [OTPController::class, 'resend']);
    });
    
    // Email Verification routes
    Route::prefix('email')->group(function () {
        Route::post('/verify', [EmailVerificationController::class, 'verify']);
        Route::post('/verify-otp', [OTPController::class, 'verify']);
        Route::post('/resend-otp', [OTPController::class, 'resend']);
    });
    
    // Magic Link routes
    Route::prefix('magic-link')->group(function () {
        Route::post('/send', [MagicLinkController::class, 'send']);
        Route::post('/verify', [MagicLinkController::class, 'verify']);
        Route::post('/resend', [MagicLinkController::class, 'resend']);
    });
    
    // OAuth routes
    Route::get('/{provider}', [AuthController::class, 'redirectToProvider']);
    Route::get('/{provider}/callback', [AuthController::class, 'handleProviderCallback']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Email Verification resend (protected)
    Route::post('/auth/email/resend', [EmailVerificationController::class, 'resend']);
    
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'updatePassword']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });

    // Routes protégées par rôle Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Prestation Types Management
        Route::apiResource('prestation-types', \App\Http\Controllers\Api\Admin\PrestationTypeController::class);
        
        // Categories Management
        Route::get('categories/tree', [\App\Http\Controllers\Api\Admin\CategoryController::class, 'tree']);
        Route::apiResource('categories', \App\Http\Controllers\Api\Admin\CategoryController::class);
        
        // Clients Management
        Route::post('clients/{client}/suspend', [\App\Http\Controllers\Api\Admin\ClientController::class, 'suspend']);
        Route::post('clients/{client}/activate', [\App\Http\Controllers\Api\Admin\ClientController::class, 'activate']);
        Route::apiResource('clients', \App\Http\Controllers\Api\Admin\ClientController::class)->only(['index', 'show', 'update', 'destroy']);
        
        // Providers Management
        Route::post('providers/{provider}/approve', [\App\Http\Controllers\Api\Admin\ProviderController::class, 'approve']);
        Route::post('providers/{provider}/reject', [\App\Http\Controllers\Api\Admin\ProviderController::class, 'reject']);
        Route::get('providers/{provider}/services', [\App\Http\Controllers\Api\Admin\ProviderController::class, 'services']);
        Route::apiResource('providers', \App\Http\Controllers\Api\Admin\ProviderController::class)->only(['index', 'show', 'update', 'destroy']);
    });

    // Routes protégées par rôle Prestataire
    Route::middleware('role:prestataire')->prefix('provider')->group(function () {
        // Profile
        Route::get('profile', [\App\Http\Controllers\Api\Provider\ProfileController::class, 'show']);
        Route::put('profile', [\App\Http\Controllers\Api\Provider\ProfileController::class, 'update']);
        Route::get('profile/statistics', [\App\Http\Controllers\Api\Provider\ProfileController::class, 'statistics']);
        
        // Services
        Route::apiResource('services', \App\Http\Controllers\Api\Provider\ServiceController::class);
        Route::post('services/{service}/toggle-availability', [\App\Http\Controllers\Api\Provider\ServiceController::class, 'toggleAvailability']);
        
        // Requests (Team Selections)
        Route::get('requests', [\App\Http\Controllers\Api\Provider\RequestController::class, 'index']);
        Route::get('requests/{selectionId}', [\App\Http\Controllers\Api\Provider\RequestController::class, 'show']);
        Route::post('requests/{selectionId}/accept', [\App\Http\Controllers\Api\Provider\RequestController::class, 'accept']);
        Route::post('requests/{selectionId}/reject', [\App\Http\Controllers\Api\Provider\RequestController::class, 'reject']);
        Route::get('requests/pending/count', [\App\Http\Controllers\Api\Provider\RequestController::class, 'pendingCount']);
        
        // Statistics
        Route::get('stats', [\App\Http\Controllers\Api\Provider\StatsController::class, 'index']);
        Route::get('stats/monthly', [\App\Http\Controllers\Api\Provider\StatsController::class, 'monthly']);
    });

    // Routes protégées par rôle Client
    Route::middleware('role:client')->prefix('client')->group(function () {
        // Providers - Consultation
        Route::get('providers', [\App\Http\Controllers\Api\Client\ProviderController::class, 'index']);
        Route::get('providers/{provider}', [\App\Http\Controllers\Api\Client\ProviderController::class, 'show']);
        Route::get('providers/{provider}/services', [\App\Http\Controllers\Api\Client\ProviderController::class, 'services']);
        Route::get('prestation-types/{prestationTypeId}/providers', [\App\Http\Controllers\Api\Client\ProviderController::class, 'byPrestationType']);
        
        // Comparison
        Route::post('compare/providers', [\App\Http\Controllers\Api\Client\ComparisonController::class, 'compare']);
        Route::get('compare/providers/{providerId1}/vs/{providerId2}', [\App\Http\Controllers\Api\Client\ComparisonController::class, 'compareTwo']);
        
        // Teams (Panier)
        Route::apiResource('teams', \App\Http\Controllers\Api\Client\TeamController::class);
        Route::post('teams/{team}/selections', [\App\Http\Controllers\Api\Client\TeamController::class, 'addSelection']);
        Route::delete('teams/{team}/selections/{selection}', [\App\Http\Controllers\Api\Client\TeamController::class, 'removeSelection']);
        Route::get('teams/{team}/total-estimate', [\App\Http\Controllers\Api\Client\TeamController::class, 'totalEstimate']);
        
        // Budgets
        Route::apiResource('budgets', \App\Http\Controllers\Api\Client\BudgetController::class);
        Route::post('budgets/{budget}/items', [\App\Http\Controllers\Api\Client\BudgetController::class, 'addItem']);
        Route::put('budgets/{budget}/items/{item}', [\App\Http\Controllers\Api\Client\BudgetController::class, 'updateItem']);
        Route::delete('budgets/{budget}/items/{item}', [\App\Http\Controllers\Api\Client\BudgetController::class, 'removeItem']);
        Route::get('budgets/{budget}/summary', [\App\Http\Controllers\Api\Client\BudgetController::class, 'summary']);
        
        // Collections
        Route::apiResource('collections', \App\Http\Controllers\Api\Client\CollectionController::class);
        Route::post('collections/{collection}/items', [\App\Http\Controllers\Api\Client\CollectionController::class, 'addItem']);
        Route::delete('collections/{collection}/items/{item}', [\App\Http\Controllers\Api\Client\CollectionController::class, 'removeItem']);
        Route::get('categories/{categoryId}/collections', [\App\Http\Controllers\Api\Client\CollectionController::class, 'byCategory']);
    });

    // Routes accessibles par plusieurs rôles
    Route::middleware('role:admin,prestataire')->group(function () {
        // Exemple: statistiques
        // Route::get('/statistics', [StatisticsController::class, 'index']);
    });
});
