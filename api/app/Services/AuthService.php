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
     * @param array $data Registration data (name, email, password)
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
        // Create the user after OTP verification
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'email_verified_at' => now(), // Email is already verified via OTP
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
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
            'user' => $user,
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
