<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\RateLimiter;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Unit Tests for RateLimiter Edge Cases
 * 
 * Feature: email-authentication-service
 * Validates: Requirements 4.5, 4.6
 */
class RateLimiterEdgeCasesTest extends TestCase
{
    private RateLimiter $rateLimiter;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->rateLimiter = new RateLimiter(Cache::store('array'));
    }

    /**
     * Test behavior at exact limit boundary.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_exact_limit_boundary(): void
    {
        $key = 'boundary_test';
        $maxAttempts = 5;
        $decayMinutes = 10;
        
        // Make exactly maxAttempts - 1 attempts
        for ($i = 0; $i < $maxAttempts - 1; $i++) {
            $this->rateLimiter->hit($key, $decayMinutes);
        }
        
        // Should not be blocked yet
        $this->assertFalse($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
        
        // One more hit should reach the limit
        $this->rateLimiter->hit($key, $decayMinutes);
        
        // Now should be at the limit (but attempt() should still allow this one)
        $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
        
        // Next attempt should be blocked
        $this->assertFalse($this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes));
    }

    /**
     * Test with maxAttempts = 1 (strictest limit).
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_single_attempt_limit(): void
    {
        $key = 'single_attempt';
        $maxAttempts = 1;
        $decayMinutes = 5;
        
        // First attempt should succeed
        $this->assertTrue($this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes));
        
        // Second attempt should fail
        $this->assertFalse($this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes));
        
        // Verify counter
        $this->assertSame(1, $this->rateLimiter->attempts($key));
    }

    /**
     * Test with very high maxAttempts.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_very_high_limit(): void
    {
        $key = 'high_limit';
        $maxAttempts = 1000;
        $decayMinutes = 10;
        
        // Make 999 attempts
        for ($i = 0; $i < 999; $i++) {
            $this->rateLimiter->hit($key, $decayMinutes);
        }
        
        // Should not be blocked
        $this->assertFalse($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
        
        // One more to reach limit
        $this->rateLimiter->hit($key, $decayMinutes);
        
        // Now should be blocked
        $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
    }

    /**
     * Test reset after decay period with precise timing.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_reset_after_decay_period(): void
    {
        $key = 'decay_test';
        $maxAttempts = 2;
        $decayMinutes = 1; // 60 seconds
        
        // Exhaust limit
        $this->rateLimiter->hit($key, $decayMinutes);
        $this->rateLimiter->hit($key, $decayMinutes);
        
        // Should be blocked
        $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
        $this->assertSame(2, $this->rateLimiter->attempts($key));
        
        // Wait for decay + buffer
        sleep(61);
        
        // Should be reset (cache expired)
        $this->assertSame(0, $this->rateLimiter->attempts($key));
        $this->assertFalse($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
        
        // Should be able to make new attempts
        $this->assertTrue($this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes));
    }

    /**
     * Test behavior with zero maxAttempts (should always block).
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_zero_max_attempts(): void
    {
        $key = 'zero_limit';
        $maxAttempts = 0;
        $decayMinutes = 5;
        
        // Even first attempt should be blocked
        $this->assertFalse($this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes));
        
        // tooManyAttempts should return true immediately
        $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
    }

    /**
     * Test multiple clears in succession.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_multiple_clears(): void
    {
        $key = 'multi_clear';
        $maxAttempts = 3;
        $decayMinutes = 5;
        
        // Hit limit
        for ($i = 0; $i < $maxAttempts; $i++) {
            $this->rateLimiter->hit($key, $decayMinutes);
        }
        
        // Clear multiple times
        $this->rateLimiter->clear($key);
        $this->rateLimiter->clear($key);
        $this->rateLimiter->clear($key);
        
        // Should still be reset
        $this->assertSame(0, $this->rateLimiter->attempts($key));
        $this->assertTrue($this->rateLimiter->attempt($key, $maxAttempts, $decayMinutes));
    }

    /**
     * Test clearing a key that was never used.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_clear_unused_key(): void
    {
        $key = 'unused_key';
        
        // Clear a key that was never used (should not error)
        $this->rateLimiter->clear($key);
        
        // Should still be at 0
        $this->assertSame(0, $this->rateLimiter->attempts($key));
    }

    /**
     * Test concurrent-like behavior (rapid successive hits).
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_rapid_successive_hits(): void
    {
        $key = 'rapid_hits';
        $decayMinutes = 10;
        
        // Hit 100 times rapidly
        for ($i = 0; $i < 100; $i++) {
            $this->rateLimiter->hit($key, $decayMinutes);
        }
        
        // Counter should be exactly 100
        $this->assertSame(100, $this->rateLimiter->attempts($key));
    }

    /**
     * Test with very short decay period.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_very_short_decay_period(): void
    {
        $key = 'short_decay';
        $maxAttempts = 2;
        $decayMinutes = 1; // 1 minute
        
        // Hit limit
        $this->rateLimiter->hit($key, $decayMinutes);
        $this->rateLimiter->hit($key, $decayMinutes);
        
        $this->assertTrue($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
        
        // Wait for decay
        sleep(61);
        
        // Should be reset
        $this->assertFalse($this->rateLimiter->tooManyAttempts($key, $maxAttempts));
    }

    /**
     * Test attempts() on non-existent key returns 0.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_attempts_on_nonexistent_key(): void
    {
        $key = 'nonexistent';
        
        $attempts = $this->rateLimiter->attempts($key);
        
        $this->assertSame(0, $attempts);
    }

    /**
     * Test tooManyAttempts on non-existent key returns false.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_too_many_attempts_on_nonexistent_key(): void
    {
        $key = 'nonexistent';
        $maxAttempts = 5;
        
        $tooMany = $this->rateLimiter->tooManyAttempts($key, $maxAttempts);
        
        $this->assertFalse($tooMany);
    }

    /**
     * Test that different decay periods don't interfere.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_different_decay_periods_isolated(): void
    {
        $key1 = 'decay_1min';
        $key2 = 'decay_5min';
        
        // Hit both with different decay periods
        $this->rateLimiter->hit($key1, 1);
        $this->rateLimiter->hit($key2, 5);
        
        // Both should have 1 attempt
        $this->assertSame(1, $this->rateLimiter->attempts($key1));
        $this->assertSame(1, $this->rateLimiter->attempts($key2));
        
        // Wait for first to decay
        sleep(61);
        
        // First should be reset, second should still have count
        $this->assertSame(0, $this->rateLimiter->attempts($key1));
        $this->assertSame(1, $this->rateLimiter->attempts($key2));
    }
}
