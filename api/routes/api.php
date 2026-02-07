<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Public routes - Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // OAuth routes
    Route::get('/{provider}', [AuthController::class, 'redirectToProvider']);
    Route::get('/{provider}/callback', [AuthController::class, 'handleProviderCallback']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'updatePassword']);
        Route::delete('/', [ProfileController::class, 'destroy']);
    });

    // Routes protégées par rôle Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Exemple: gestion des utilisateurs
        // Route::get('/users', [AdminController::class, 'users']);
        // Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    });

    // Routes protégées par rôle Prestataire
    Route::middleware('role:prestataire')->prefix('prestataire')->group(function () {
        // Exemple: gestion des événements
        // Route::post('/events', [EventController::class, 'store']);
        // Route::put('/events/{id}', [EventController::class, 'update']);
        // Route::delete('/events/{id}', [EventController::class, 'destroy']);
    });

    // Routes protégées par rôle Client
    Route::middleware('role:client')->prefix('client')->group(function () {
        // Exemple: réservations
        // Route::post('/bookings', [BookingController::class, 'store']);
        // Route::get('/bookings', [BookingController::class, 'index']);
    });

    // Routes accessibles par plusieurs rôles
    Route::middleware('role:admin,prestataire')->group(function () {
        // Exemple: statistiques
        // Route::get('/statistics', [StatisticsController::class, 'index']);
    });
});
