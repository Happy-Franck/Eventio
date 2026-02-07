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
