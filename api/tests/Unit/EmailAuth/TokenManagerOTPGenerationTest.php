<?php

namespace Tests\Unit\EmailAuth;

use App\Services\EmailAuth\TokenManager;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Property-Based Tests for TokenManager OTP Generation
 * 
 * Feature: email-authentication-service
 * Property 1: OTP Code Format
 * Validates: Requirements 1.1
 */
class TokenManagerOTPGenerationTest extends TestCase
{
    private TokenManager $tokenManager;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tokenManager = new TokenManager(Cache::store('array'));
    }

    /**
     * Property 1: OTP Code Format
     * For all generated OTP codes, the code must be a numeric string of exactly 6 digits.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_otp_code_format_is_always_six_digits(): void
    {
        // Run 100 iterations to verify the property holds across many generations
        for ($i = 0; $i < 100; $i++) {
            $code = $this->tokenManager->generateOTPCode();
            
            // Assert: Code is exactly 6 characters long
            $this->assertSame(6, strlen($code), "OTP code must be exactly 6 characters (iteration {$i})");
            
            // Assert: Code contains only digits
            $this->assertMatchesRegularExpression('/^\d{6}$/', $code, "OTP code must contain only digits (iteration {$i})");
            
            // Assert: Code is numeric
            $this->assertTrue(is_numeric($code), "OTP code must be numeric (iteration {$i})");
            
            // Assert: Code is within valid range (000000 to 999999)
            $numericValue = (int) $code;
            $this->assertGreaterThanOrEqual(0, $numericValue, "OTP code must be >= 0 (iteration {$i})");
            $this->assertLessThanOrEqual(999999, $numericValue, "OTP code must be <= 999999 (iteration {$i})");
        }
    }

    /**
     * Additional property test: OTP codes should have proper zero-padding.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_otp_codes_are_properly_zero_padded(): void
    {
        $foundLeadingZero = false;
        
        // Generate many codes to find at least one with leading zeros
        for ($i = 0; $i < 1000; $i++) {
            $code = $this->tokenManager->generateOTPCode();
            
            if (str_starts_with($code, '0')) {
                $foundLeadingZero = true;
                
                // Verify it's still 6 digits
                $this->assertSame(6, strlen($code));
                $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
                
                break;
            }
        }
        
        // We should statistically find at least one code starting with 0 in 1000 attempts
        // (probability is ~10% per attempt, so 1000 attempts should virtually guarantee it)
        $this->assertTrue($foundLeadingZero, 'Should generate codes with leading zeros (proper padding)');
    }

    /**
     * Property test: Generated OTP codes should have reasonable distribution.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_otp_codes_have_reasonable_distribution(): void
    {
        $codes = [];
        $iterations = 100;
        
        for ($i = 0; $i < $iterations; $i++) {
            $codes[] = $this->tokenManager->generateOTPCode();
        }
        
        // Check that we have some variety (not all the same code)
        $uniqueCodes = array_unique($codes);
        $this->assertGreaterThan(1, count($uniqueCodes), 'Generated codes should have variety');
        
        // With 100 iterations and 1,000,000 possible codes, we expect high uniqueness
        // Let's check that at least 90% are unique (allowing for some collisions)
        $uniquenessRatio = count($uniqueCodes) / $iterations;
        $this->assertGreaterThan(0.9, $uniquenessRatio, 'At least 90% of codes should be unique');
    }
}
