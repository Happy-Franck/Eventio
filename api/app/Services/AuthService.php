<?php

namespace App\Services;

use App\Models\User;
use App\Services\EmailAuth\EmailAuthService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthService
{
    public function __construct(
        private EmailAuthService $emailAuthService
    ) {}

    /**
     * Register a new user (Step 1: Send OTP for email verification)
     * 
     * This method sends an OTP code to the user's email but does NOT create
     * the user account yet. The account will be created after OTP verification
     * in completeRegistration().
     * 
     * @param array $data Registration data (name, email, password, role, prestation_type_ids)
     * @return array Registration status with email and OTP sent flag
     * @throws \Exception If OTP sending fails
     */
    public function register(array $data): array
    {
        // Send OTP for email verification BEFORE creating the account
        $otpResult = $this->emailAuthService->sendOTPCode($data['email']);
        
        if (!$otpResult->success) {
            throw new \Exception($otpResult->message);
        }

        // Store registration data in cache for later use (expires in 15 minutes)
        \Illuminate\Support\Facades\Cache::put(
            'registration_data_' . $data['email'],
            [
                'name' => $data['name'],
                'password' => $data['password'],
                'role' => $data['role'] ?? 'client',
                'prestation_type_ids' => $data['prestation_type_ids'] ?? null,
                'username' => $data['username'] ?? null,
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'business_type' => $data['business_type'] ?? null,
                'company_name' => $data['company_name'] ?? null,
            ],
            now()->addMinutes(15)
        );

        // Return success - the user will be created after OTP verification
        return [
            'email' => $data['email'],
            'name' => $data['name'],
            'password' => $data['password'],
            'otp_sent' => true,
        ];
    }

    /**
     * Complete user registration (Step 2: Create account after OTP verification)
     * 
     * This method is called AFTER the OTP has been verified. It creates the user
     * account with email_verified_at already set, since we know the email is valid.
     * 
     * @param string $email User's email address
     * @param string $name User's full name
     * @param string $password User's password (will be hashed)
     * @return array User data and authentication token
     */
    public function completeRegistration(string $email, string $name, string $password): array
    {
        // Retrieve stored registration data from cache
        $registrationData = \Illuminate\Support\Facades\Cache::get('registration_data_' . $email);
        
        // Create the user after OTP verification
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(), // Email is already verified via OTP
            'username' => $registrationData['username'] ?? null,
            'first_name' => $registrationData['first_name'] ?? null,
            'last_name' => $registrationData['last_name'] ?? null,
            'phone' => $registrationData['phone'] ?? null,
            'address' => $registrationData['address'] ?? null,
            'city' => $registrationData['city'] ?? null,
            'postal_code' => $registrationData['postal_code'] ?? null,
            'business_type' => $registrationData['business_type'] ?? null,
            'company_name' => $registrationData['company_name'] ?? null,
        ]);

        // Assigner le rôle (use cached data if available, otherwise default to client)
        $role = $registrationData['role'] ?? 'client';
        $user->assignRole($role);

        // Si c'est un prestataire, attacher les types de prestation
        if ($role === 'prestataire' && isset($registrationData['prestation_type_ids'])) {
            $user->prestationTypes()->attach($registrationData['prestation_type_ids']);
        }

        // Clear the cached registration data
        \Illuminate\Support\Facades\Cache::forget('registration_data_' . $email);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['roles', 'prestationTypes']),
            'token' => $token,
        ];
    }

    public function login(string $email, string $password): ?array
    {
        if (!\Illuminate\Support\Facades\Auth::attempt(['email' => $email, 'password' => $password])) {
            return null;
        }

        $user = User::where('email', $email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->load(['roles', 'prestationTypes']),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function sendPasswordResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        return $status;
    }

    public function resetPassword(array $credentials): string
    {
        $status = Password::reset(
            $credentials,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status;
    }
}
