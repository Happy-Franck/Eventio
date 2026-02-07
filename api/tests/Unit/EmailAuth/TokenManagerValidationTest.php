<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\TokenManager;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Property-Based Tests for TokenManager Validation
 * 
 * Feature: email-authentication-service
 * Property 6: Valid Token Acceptance
 * Property 7: Invalid Token Rejection  
 * Property 8: Single Use Tokens (Idempotence)
 * Validates: Requirements 1.4, 1.5, 1.6, 2.4, 2.5, 2.6, 3.4, 3.5, 3.6, 6.1, 6.5
 */
class TokenManagerValidationTest extends TestCase
{
    private TokenManager $tokenManager;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->tokenManager = new TokenManager(Cache::store('array'));
    }

    /**
     * Property 6: Valid Token Acceptance
     * For all valid and non-expired tokens or codes, validation must succeed 
     * and return a positive result.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_valid_tokens_are_accepted(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $email = "user{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 600;
            
            // Store the code
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Validate with correct code
            $isValid = $this->tokenManager->validateOTP($email, $code);
            
            // Assert: Valid code is accepted
            $this->assertTrue($isValid, "Valid OTP code must be accepted (iteration {$i})");
        }
    }

    /**
     * Property 6 (continued): Valid tokens work for all token types.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_valid_tokens_are_accepted_for_all_types(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $key = "test_token_{$i}";
            $token = $this->tokenManager->generateToken(32);
            $ttl = 3600;
            
            // Store the token
            $this->tokenManager->storeToken($key, $token, $ttl);
            
            // Validate with correct token
            $isValid = $this->tokenManager->validateToken($key, $token);
            
            // Assert: Valid token is accepted
            $this->assertTrue($isValid, "Valid token must be accepted (iteration {$i})");
        }
    }

    /**
     * Property 7: Invalid Token Rejection
     * For all invalid or expired tokens or codes, validation must fail and 
     * return an error with an appropriate error code.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_invalid_codes_are_rejected(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $email = "user{$i}@example.com";
            $correctCode = $this->tokenManager->generateOTPCode();
            $wrongCode = str_pad((string) ((int) $correctCode + 1) % 1000000, 6, '0', STR_PAD_LEFT);
            $ttl = 600;
            
            // Store the correct code
            $this->tokenManager->storeOTP($email, $correctCode, $ttl);
            
            // Validate with wrong code
            $isValid = $this->tokenManager->validateOTP($email, $wrongCode);
            
            // Assert: Invalid code is rejected
            $this->assertFalse($isValid, "Invalid OTP code must be rejected (iteration {$i})");
        }
    }

    /**
     * Property 7 (continued): Non-existent tokens are rejected.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_nonexistent_tokens_are_rejected(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $email = "nonexistent{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            
            // Try to validate without storing
            $isValid = $this->tokenManager->validateOTP($email, $code);
            
            // Assert: Non-existent code is rejected
            $this->assertFalse($isValid, "Non-existent OTP code must be rejected (iteration {$i})");
        }
    }

    /**
     * Property 7 (continued): Expired tokens are rejected.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_expired_tokens_are_rejected(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $email = "user{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 1; // 1 second
            
            // Store the code
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Wait for expiration
            sleep(2);
            
            // Validate after expiration
            $isValid = $this->tokenManager->validateOTP($email, $code);
            
            // Assert: Expired code is rejected
            $this->assertFalse($isValid, "Expired OTP code must be rejected (iteration {$i})");
        }
    }

    /**
     * Property 8: Single Use Tokens (Idempotence)
     * For all tokens or codes used successfully, a second validation attempt 
     * with the same token must fail because the token has been invalidated.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_tokens_can_only_be_used_once(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $email = "user{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 600;
            
            // Store the code
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // First validation - should succeed
            $firstValidation = $this->tokenManager->validateOTP($email, $code);
            $this->assertTrue($firstValidation, "First validation should succeed (iteration {$i})");
            
            // Invalidate the code (simulating successful use)
            $this->tokenManager->invalidateOTP($email);
            
            // Second validation - should fail
            $secondValidation = $this->tokenManager->validateOTP($email, $code);
            $this->assertFalse($secondValidation, "Second validation should fail after invalidation (iteration {$i})");
        }
    }

    /**
     * Property 8 (continued): Tokens for different users don't interfere.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_tokens_are_isolated_per_user(): void
    {
        $email1 = "user1@example.com";
        $email2 = "user2@example.com";
        $code1 = $this->tokenManager->generateOTPCode();
        $code2 = $this->tokenManager->generateOTPCode();
        $ttl = 600;
        
        // Store codes for both users
        $this->tokenManager->storeOTP($email1, $code1, $ttl);
        $this->tokenManager->storeOTP($email2, $code2, $ttl);
        
        // Validate user1's code
        $this->assertTrue($this->tokenManager->validateOTP($email1, $code1));
        
        // Invalidate user1's code
        $this->tokenManager->invalidateOTP($email1);
        
        // User1's code should be invalid
        $this->assertFalse($this->tokenManager->validateOTP($email1, $code1));
        
        // User2's code should still be valid
        $this->assertTrue($this->tokenManager->validateOTP($email2, $code2));
    }

    /**
     * Property test: Case-insensitive email handling for OTP.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_email_case_insensitive_for_otp(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $email = "User{$i}@Example.COM";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 600;
            
            // Store with mixed case email
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Validate with lowercase email
            $isValid = $this->tokenManager->validateOTP(strtolower($email), $code);
            
            // Assert: Validation works regardless of case
            $this->assertTrue($isValid, "Email should be case-insensitive (iteration {$i})");
        }
    }
}
