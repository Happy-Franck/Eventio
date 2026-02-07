<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\MagicLinkController;
use App\Http\Controllers\Auth\OTPController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

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
});
