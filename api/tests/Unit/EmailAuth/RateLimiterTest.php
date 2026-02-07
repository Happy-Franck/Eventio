<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Property-Based Tests for RateLimiter
 * 
 * Feature: email-authentication-service
 * Property 11: Rate Limiting Enforcement
 * Validates: Requirements 4.5, 4.6, 5.5, 5.6
 */
class RateLimiterTest extends TestCase
{
    private RateLimiter $rateLimiter;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->rateLimiter = new RateLimiter(Cache::store('array'));
    }

    /**
     * Property 11: Rate Limiting Enforcement
     * For all users making more than N requests in the configured period,
     * additional requests must be refused with a rate limit error.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_rate_limit_blocks_excessive_requests(): void
    {
        $maxAttempts = 3;
        $decayMinutes = 5;
        
        for ($i = 0; $i < 10; $i++) {
            $key = "test_user_{$i}";
            
            // First N attempts should succeed
            for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
                $allowed = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
                $this->assertTrue(
                    $allowed,
                    "Attempt {$attempt}/{$maxAttempts} should be allowed for user {$i}"
                );
            }
            
            // Attempts beyond the limit should fail
            for ($attempt = 1; $attempt <= 5; $attempt++) {
                $allowed = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
                $this->assertFalse(
                    $allowed,
                    "Attempt beyond limit should be blocked for user {$i} (extra attempt {$attempt})"
                );
            }
        }
    }

    /**
     * Property test: Rate limits are enforced at exact threshold.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_rate_limit_enforced_at_exact_threshold(): void
    {
        $testCases = [
            ['max' => 1, 'decay' => 1],
            ['max' => 3, 'decay' => 5],
            ['max' => 5, 'decay' => 10],
            ['max' => 10, 'decay' => 15],
        ];
        
        foreach ($testCases as $index => $case) {
            $key = "threshold_test_{$index}";
            $maxAttempts = $case['max'];
            $decayMinutes = $case['decay'];
            
            // Exactly maxAttempts should be allowed
            for ($i = 0; $i < $maxAttempts; $i++) {
                $allowed = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
                $this->assertTrue(
                    $allowed,
                    "Attempt {$i} should be allowed (max={$maxAttempts})"
                );
            }
            
            // The very next attempt should be blocked
            $blocked = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
            $this->assertFalse(
                $blocked,
                "Attempt at threshold+1 should be blocked (max={$maxAttempts})"
            );
        }
    }

    /**
     * Property test: Hit counter increments correctly.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_hit_counter_increments_correctly(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $key = "counter_test_{$i}";
            $decayMinutes = 10;
            
            // Initial attempts should be 0
            $this->assertSame(0, $this->rateLimiter->attempts($key));
            
            // Hit multiple times and verify counter
            for ($hit = 1; $hit <= 10; $hit++) {
                $count = $this->rateLimiter->hit($key, $decayMinutes);
                
                $this->assertSame($hit, $count, "Hit count should be {$hit} after {$hit} hits");
                $this->assertSame($hit, $this->rateLimiter->attempts($key), "Attempts should match hit count");
            }
        }
    }

    /**
     * Property test: tooManyAttempts correctly identifies limit exceeded.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_too_many_attempts_detection(): void
    {
        $maxAttempts = 5;
        $decayMinutes = 10;
        
        for ($i = 0; $i < 20; $i++) {
            $key = "detection_test_{$i}";
            
            // Before hitting limit
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                $this->assertFalse(
                    $this->rateLimiter->tooManyAttempts($key, $maxAttempts),
                    "Should not have too many attempts at {$attempt}/{$maxAttempts}"
                );
                $this->rateLimiter->hit($key, $decayMinutes);
            }
            
            // At and after limit
            $this->assertTrue(
                $this->rateLimiter->tooManyAttempts($key, $maxAttempts),
                "Should have too many attempts at {$maxAttempts}/{$maxAttempts}"
            );
            
            // Additional hits don't change the fact that limit is exceeded
            $this->rateLimiter->hit($key, $decayMinutes);
            $this->assertTrue(
                $this->rateLimiter->tooManyAttempts($key, $maxAttempts),
                "Should still have too many attempts after additional hit"
            );
        }
    }

    /**
     * Property test: Clear resets the rate limiter.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_clear_resets_rate_limiter(): void
    {
        $maxAttempts = 3;
        $decayMinutes = 5;
        
        for ($i = 0; $i < 50; $i++) {
            $key = "clear_test_{$i}";
            
            // Hit the limit
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                $this->rateLimiter->hit($key, $decayMinutes);
            }
            
            // Verify limit is hit
            $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
            
            // Clear the limiter
            $this->rateLimiter->clear($key);
            
            // Verify it's reset
            $this->assertFalse(
                $this->rateLimiter->tooManyAttempts($key, $maxAttempts),
                "Rate limiter should be reset after clear"
            );
            $this->assertSame(0, $this->rateLimiter->attempts($key), "Attempts should be 0 after clear");
            
            // Should be able to make requests again
            $allowed = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
            $this->assertTrue($allowed, "Requests should be allowed after clear");
        }
    }

    /**
     * Property test: Rate limits are isolated per key.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_rate_limits_isolated_per_key(): void
    {
        $maxAttempts = 3;
        $decayMinutes = 5;
        
        $key1 = "user1@example.com";
        $key2 = "user2@example.com";
        
        // Exhaust limit for key1
        for ($i = 0; $i < $maxAttempts; $i++) {
            $this->rateLimiter->hit($key1, $decayMinutes);
        }
        
        // key1 should be blocked
        $this->assertTrue($this->rateLimiter->tooManyAttempts($key1, $maxAttempts));
        
        // key2 should still be allowed
        $this->assertFalse($this->rateLimiter->tooManyAttempts($key2, $maxAttempts));
        $this->assertTrue($this->rateLimiter->attempt($key2, $maxAttempts, $decayMinutes));
    }

    /**
     * Property test: Different max attempts are respected.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_different_max_attempts_respected(): void
    {
        $testCases = [1, 2, 3, 5, 10, 20, 50];
        
        foreach ($testCases as $maxAttempts) {
            $key = "max_test_{$maxAttempts}";
            $decayMinutes = 5;
            
            // Should allow exactly maxAttempts
            for ($i = 0; $i < $maxAttempts; $i++) {
                $allowed = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
                $this->assertTrue($allowed, "Attempt {$i} should be allowed (max={$maxAttempts})");
            }
            
            // Next attempt should be blocked
            $blocked = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
            $this->assertFalse($blocked, "Attempt beyond max={$maxAttempts} should be blocked");
        }
    }

    /**
     * Property test: Rate limit resets after decay period.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_rate_limit_resets_after_decay(): void
    {
        $maxAttempts = 2;
        $decayMinutes = 1; // 1 minute = 60 seconds
        
        for ($i = 0; $i < 3; $i++) {
            $key = "decay_test_{$i}";
            
            // Exhaust the limit
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                $this->rateLimiter->hit($key, $decayMinutes);
            }
            
            // Should be blocked
            $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
            
            // Wait for decay (61 seconds to be safe)
            sleep(61);
            
            // Should be reset
            $this->assertFalse(
                $this->rateLimiter->tooManyAttempts($key, $maxAttempts),
                "Rate limit should reset after decay period"
            );
            
            // Should be able to make requests again
            $allowed = $this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes);
            $this->assertTrue($allowed, "Requests should be allowed after decay");
        }
    }

    /**
     * Property test: Helper methods generate correct keys.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_helper_methods_generate_correct_keys(): void
    {
        $emails = ['user@example.com', 'TEST@EXAMPLE.COM', 'User@Example.Com'];
        $userIds = [1, 100, 999, 12345];
        
        // Test OTP keys
        foreach ($emails as $email) {
            $key = $this->rateLimiter->getOTPKey($email);
            $this->assertStringContainsString('otp:', $key);
            $this->assertStringContainsString(strtolower($email), $key);
        }
        
        // Test verification keys
        foreach ($userIds as $userId) {
            $key = $this->rateLimiter->getVerificationKey($userId);
            $this->assertStringContainsString('verification:', $key);
            $this->assertStringContainsString((string) $userId, $key);
        }
        
        // Test magic link keys
        foreach ($emails as $email) {
            $key = $this->rateLimiter->getMagicLinkKey($email);
            $this->assertStringContainsString('magic_link:', $key);
            $this->assertStringContainsString(strtolower($email), $key);
        }
        
        // Test validation attempts keys
        $types = ['otp', 'verification', 'magic_link'];
        foreach ($types as $type) {
            $key = $this->rateLimiter->getValidationAttemptsKey($type, 'test@example.com');
            $this->assertStringContainsString('attempts:', $key);
            $this->assertStringContainsString($type, $key);
        }
    }
}
