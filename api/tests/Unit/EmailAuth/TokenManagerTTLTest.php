<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\TokenManager;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Property-Based Tests for TokenManager TTL Enforcement
 * 
 * Feature: email-authentication-service
 * Property 4: TTL Enforcement
 * Validates: Requirements 1.2, 2.2, 3.2
 */
class TokenManagerTTLTest extends TestCase
{
    private TokenManager $tokenManager;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->tokenManager = new TokenManager(Cache::store('array'));
    }

    /**
     * Property 4: TTL Enforcement
     * For all tokens or codes with a configured TTL, attempting to validate 
     * the token after TTL expiration must fail with an expiration error.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_tokens_expire_after_ttl(): void
    {
        // Test with very short TTL (1 second)
        for ($i = 0; $i < 10; $i++) {
            $email = "user{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 1; // 1 second
            
            // Store the code
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Validate immediately - should succeed
            $this->assertTrue(
                $this->tokenManager->validateOTP($email, $code),
                "Validation should succeed immediately after storage (iteration {$i})"
            );
            
            // Wait for expiration
            sleep(2);
            
            // Validate after expiration - should fail
            $this->assertFalse(
                $this->tokenManager->validateOTP($email, $code),
                "Validation should fail after TTL expiration (iteration {$i})"
            );
        }
    }

    /**
     * Property test: Tokens remain valid within TTL window.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_tokens_remain_valid_within_ttl(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $key = "test_token_{$i}";
            $token = $this->tokenManager->generateToken(32);
            $ttl = 10; // 10 seconds
            
            // Store the token
            $this->tokenManager->storeToken($key, $token, $ttl);
            
            // Validate immediately
            $this->assertTrue(
                $this->tokenManager->validateToken($key, $token),
                "Token should be valid immediately (iteration {$i})"
            );
            
            // Wait 1 second (still within TTL)
            sleep(1);
            
            // Should still be valid
            $this->assertTrue(
                $this->tokenManager->validateToken($key, $token),
                "Token should still be valid within TTL (iteration {$i})"
            );
        }
    }

    /**
     * Property test: Different TTL values are respected.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_different_ttl_values_are_respected(): void
    {
        $ttlValues = [1, 2, 3]; // seconds
        
        foreach ($ttlValues as $ttl) {
            $email = "user_ttl_{$ttl}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            
            // Store with specific TTL
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Should be valid immediately
            $this->assertTrue(
                $this->tokenManager->validateOTP($email, $code),
                "Code should be valid immediately with TTL={$ttl}"
            );
            
            // Wait for TTL + 1 second
            sleep($ttl + 1);
            
            // Should be expired
            $this->assertFalse(
                $this->tokenManager->validateOTP($email, $code),
                "Code should be expired after TTL={$ttl}"
            );
        }
    }

    /**
     * Property test: Zero or negative TTL results in immediate expiration.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_zero_ttl_results_in_immediate_expiration(): void
    {
        $email = "user@example.com";
        $code = $this->tokenManager->generateOTPCode();
        
        // Store with 0 TTL
        $this->tokenManager->storeOTP($email, $code, 0);
        
        // Should be immediately invalid (or not stored)
        $this->assertFalse(
            $this->tokenManager->validateOTP($email, $code),
            "Code with 0 TTL should be immediately invalid"
        );
    }
}
