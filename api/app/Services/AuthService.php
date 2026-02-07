<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class AuthService
{
    public function register(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Assigner le rôle par défaut (client)
        $role = $data['role'] ?? 'client';
        $user->assignRole($role);

        // Si c'est un prestataire, attacher les types de prestation
        if ($role === 'prestataire' && isset($data['prestation_type_ids'])) {
            $user->prestationTypes()->attach($data['prestation_type_ids']);
        }

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
