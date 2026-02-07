<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\TokenManager;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Property-Based Tests for TokenManager Token Hashing
 * 
 * Feature: email-authentication-service
 * Property 3: Token Storage with Hashing
 * Validates: Requirements 5.2
 */
class TokenManagerHashingTest extends TestCase
{
    private TokenManager $tokenManager;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->tokenManager = new TokenManager(Cache::store('array'));
    }

    /**
     * Property 3: Token Storage with Hashing
     * For all stored tokens or codes, the value stored in cache must be 
     * the hash of the original token, not the token in plain text.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_stored_otp_codes_are_hashed(): void
    {
        $iterations = 100;
        
        for ($i = 0; $i < $iterations; $i++) {
            $email = "user{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 600;
            
            // Store the OTP code
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Get the stored value directly from cache
            $cacheKey = $this->getOTPKey($email);
            $storedValue = Cache::store('array')->get($cacheKey);
            
            // Assert: Stored value exists
            $this->assertNotNull($storedValue, "Stored value should exist (iteration {$i})");
            
            // Assert: Stored value is NOT the plain code
            $this->assertNotSame($code, $storedValue, "Stored value must not be plain code (iteration {$i})");
            
            // Assert: Stored value is the hash of the code
            $expectedHash = $this->tokenManager->hashToken($code);
            $this->assertSame($expectedHash, $storedValue, "Stored value must be hash of code (iteration {$i})");
            
            // Assert: Hash is 64 characters (SHA-256 hex)
            $this->assertSame(64, strlen($storedValue), "Hash must be 64 characters (iteration {$i})");
            
            // Assert: Hash is hexadecimal
            $this->assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $storedValue, "Hash must be hexadecimal (iteration {$i})");
        }
    }

    /**
     * Property test: Stored tokens (verification/magic link) are hashed.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_stored_tokens_are_hashed(): void
    {
        $iterations = 100;
        
        for ($i = 0; $i < $iterations; $i++) {
            $key = "test_token_{$i}";
            $token = $this->tokenManager->generateToken(32);
            $ttl = 3600;
            
            // Store the token
            $this->tokenManager->storeToken($key, $token, $ttl);
            
            // Get the stored value directly from cache
            $storedValue = Cache::store('array')->get($key);
            
            // Assert: Stored value exists
            $this->assertNotNull($storedValue, "Stored value should exist (iteration {$i})");
            
            // Assert: Stored value is NOT the plain token
            $this->assertNotSame($token, $storedValue, "Stored value must not be plain token (iteration {$i})");
            
            // Assert: Stored value is the hash of the token
            $expectedHash = $this->tokenManager->hashToken($token);
            $this->assertSame($expectedHash, $storedValue, "Stored value must be hash of token (iteration {$i})");
            
            // Assert: Hash is 64 characters (SHA-256 hex)
            $this->assertSame(64, strlen($storedValue), "Hash must be 64 characters (iteration {$i})");
        }
    }

    /**
     * Property test: Same input always produces same hash (deterministic).
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_hashing_is_deterministic(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $input = $this->tokenManager->generateToken(32);
            
            $hash1 = $this->tokenManager->hashToken($input);
            $hash2 = $this->tokenManager->hashToken($input);
            
            // Assert: Same input produces same hash
            $this->assertSame($hash1, $hash2, "Hashing must be deterministic (iteration {$i})");
        }
    }

    /**
     * Property test: Different inputs produce different hashes.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_different_inputs_produce_different_hashes(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $input1 = $this->tokenManager->generateToken(32);
            $input2 = $this->tokenManager->generateToken(32);
            
            $hash1 = $this->tokenManager->hashToken($input1);
            $hash2 = $this->tokenManager->hashToken($input2);
            
            // Assert: Different inputs produce different hashes
            $this->assertNotSame($hash1, $hash2, "Different inputs must produce different hashes (iteration {$i})");
        }
    }

    /**
     * Property test: Validation works with hashed storage.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_validation_works_with_hashed_storage(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $email = "user{$i}@example.com";
            $code = $this->tokenManager->generateOTPCode();
            $ttl = 600;
            
            // Store the code (which hashes it)
            $this->tokenManager->storeOTP($email, $code, $ttl);
            
            // Validate with the original plain code
            $isValid = $this->tokenManager->validateOTP($email, $code);
            
            // Assert: Validation succeeds with correct code
            $this->assertTrue($isValid, "Validation must succeed with correct code (iteration {$i})");
            
            // Try with wrong code
            $wrongCode = str_pad((string) ((int) $code + 1) % 1000000, 6, '0', STR_PAD_LEFT);
            $isInvalid = $this->tokenManager->validateOTP($email, $wrongCode);
            
            // Assert: Validation fails with wrong code
            $this->assertFalse($isInvalid, "Validation must fail with wrong code (iteration {$i})");
        }
    }

    /**
     * Property test: Plain tokens are never stored in cache.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_plain_tokens_never_stored_in_cache(): void
    {
        $tokens = [];
        
        for ($i = 0; $i < 50; $i++) {
            $token = $this->tokenManager->generateToken(32);
            $key = "test_{$i}";
            
            $this->tokenManager->storeToken($key, $token, 3600);
            $tokens[] = $token;
        }
        
        // Get all values from cache
        $allCacheValues = [];
        for ($i = 0; $i < 50; $i++) {
            $value = Cache::store('array')->get("test_{$i}");
            if ($value) {
                $allCacheValues[] = $value;
            }
        }
        
        // Assert: No plain token appears in cache
        foreach ($tokens as $plainToken) {
            $this->assertNotContains(
                $plainToken, 
                $allCacheValues, 
                'Plain tokens must never be stored in cache'
            );
        }
    }

    /**
     * Helper method to get OTP cache key (mirrors TokenManager private method).
     */
    private function getOTPKey(string $email): string
    {
        $prefix = config('email-auth.cache.prefix', 'email_auth');
        return "{$prefix}:otp:" . strtolower($email);
    }
}
