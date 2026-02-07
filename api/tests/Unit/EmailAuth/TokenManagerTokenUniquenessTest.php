<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\TokenManager;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Property-Based Tests for TokenManager Token Uniqueness
 * 
 * Feature: email-authentication-service
 * Property 2: Token Uniqueness
 * Validates: Requirements 2.1, 3.1, 5.1
 */
class TokenManagerTokenUniquenessTest extends TestCase
{
    private TokenManager $tokenManager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tokenManager = new TokenManager(Cache::store('array'));
    }

    /**
     * Property 2: Token Uniqueness
     * For all generated tokens (verification or magic link), each token must be unique 
     * and cryptographically secure with a minimum length of 64 characters.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_generated_tokens_are_unique_and_secure(): void
    {
        $tokens = [];
        $iterations = 100;
        
        for ($i = 0; $i < $iterations; $i++) {
            $token = $this->tokenManager->generateToken(32); // 32 bytes = 64 hex chars
            
            // Assert: Token is at least 64 characters long
            $this->assertGreaterThanOrEqual(64, strlen($token), "Token must be at least 64 characters (iteration {$i})");
            
            // Assert: Token is hexadecimal (cryptographically secure format)
            $this->assertMatchesRegularExpression('/^[0-9a-f]+$/', $token, "Token must be hexadecimal (iteration {$i})");
            
            // Assert: Token is unique (not seen before)
            $this->assertNotContains($token, $tokens, "Token must be unique (iteration {$i})");
            
            $tokens[] = $token;
        }
        
        // Final assertion: All tokens are unique
        $this->assertCount($iterations, array_unique($tokens), 'All generated tokens must be unique');
    }

    /**
     * Property test: Tokens with different lengths are properly generated.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_tokens_respect_specified_length(): void
    {
        $testLengths = [16, 32, 64, 128]; // bytes
        
        foreach ($testLengths as $byteLength) {
            $expectedHexLength = $byteLength * 2; // hex encoding doubles the length
            
            for ($i = 0; $i < 10; $i++) {
                $token = $this->tokenManager->generateToken($byteLength);
                
                // Assert: Token has exactly the expected length
                $this->assertSame(
                    $expectedHexLength, 
                    strlen($token), 
                    "Token with {$byteLength} bytes should be {$expectedHexLength} hex characters (iteration {$i})"
                );
                
                // Assert: Token is valid hexadecimal
                $this->assertMatchesRegularExpression('/^[0-9a-f]+$/', $token);
            }
        }
    }

    /**
     * Property test: Default token length (32 bytes = 64 chars) meets security requirements.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_default_token_length_meets_security_requirements(): void
    {
        for ($i = 0; $i < 100; $i++) {
            $token = $this->tokenManager->generateToken(); // default length
            
            // Assert: Default token is exactly 64 characters (32 bytes hex encoded)
            $this->assertSame(64, strlen($token), "Default token must be 64 characters (iteration {$i})");
            
            // Assert: Token is hexadecimal
            $this->assertMatchesRegularExpression('/^[0-9a-f]{64}$/', $token, "Default token must be 64 hex chars (iteration {$i})");
        }
    }

    /**
     * Property test: Tokens have high entropy (good randomness).
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_tokens_have_high_entropy(): void
    {
        $tokens = [];
        
        for ($i = 0; $i < 100; $i++) {
            $tokens[] = $this->tokenManager->generateToken(32);
        }
        
        // Check character distribution - all hex characters should appear
        $allChars = implode('', $tokens);
        $charCounts = count_chars($allChars, 1);
        
        // We expect to see all hex digits (0-9, a-f) in 100 tokens of 64 chars each
        $hexDigits = array_merge(range(ord('0'), ord('9')), range(ord('a'), ord('f')));
        
        foreach ($hexDigits as $charCode) {
            $this->assertArrayHasKey(
                $charCode, 
                $charCounts, 
                'All hex digits should appear in generated tokens (char: ' . chr($charCode) . ')'
            );
        }
    }

    /**
     * Property test: Consecutive token generations produce different results.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_consecutive_tokens_are_different(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $token1 = $this->tokenManager->generateToken(32);
            $token2 = $this->tokenManager->generateToken(32);
            
            // Assert: Two consecutively generated tokens are different
            $this->assertNotSame($token1, $token2, "Consecutive tokens must be different (iteration {$i})");
        }
    }
}
