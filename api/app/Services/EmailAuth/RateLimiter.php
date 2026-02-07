<?php

namespace App\Services\EmailAuth;

use Illuminate\Contracts\Cache\Repository as CacheInterface;

class RateLimiter
{
    public function __construct(
        private CacheInterface $cache,
        private array $config = []
    ) {}

    /**
     * Attempt to execute an action within rate limits.
     * Returns true if the action is allowed, false if rate limit exceeded.
     *
     * @param string $key Unique identifier for the rate limit
     * @param int $maxAttempts Maximum number of attempts allowed
     * @param int $decayMinutes Time window in minutes
     * @return bool
     */
    public function attempt(string $key, int $maxAttempts, int $decayMinutes): bool
    {
        if ($this->tooManyAttempts($key, $maxAttempts)) {
            return false;
        }

        $this->hit($key, $decayMinutes);

        return true;
    }

    /**
     * Check if too many attempts have been made.
     *
     * @param string $key
     * @param int $maxAttempts
     * @return bool
     */
    public function tooManyAttempts(string $key, int $maxAttempts): bool
    {
        $attempts = $this->attempts($key);

        return $attempts >= $maxAttempts;
    }

    /**
     * Increment the counter for a given key.
     *
     * @param string $key
     * @param int $decayMinutes
     * @return int The new number of attempts
     */
    public function hit(string $key, int $decayMinutes = 1): int
    {
        $cacheKey = $this->getCacheKey($key);
        $decaySeconds = $decayMinutes * 60;

        $attempts = $this->cache->get($cacheKey, 0);
        $attempts++;

        $this->cache->put($cacheKey, $attempts, $decaySeconds);

        return $attempts;
    }

    /**
     * Get the number of attempts for a given key.
     *
     * @param string $key
     * @return int
     */
    public function attempts(string $key): int
    {
        $cacheKey = $this->getCacheKey($key);

        return (int) $this->cache->get($cacheKey, 0);
    }

    /**
     * Clear the rate limiter for a given key.
     *
     * @param string $key
     * @return void
     */
    public function clear(string $key): void
    {
        $cacheKey = $this->getCacheKey($key);
        $this->cache->forget($cacheKey);
    }

    /**
     * Get the number of seconds until the rate limit resets.
     *
     * @param string $key
     * @return int Seconds until available, or 0 if available now
     */
    public function availableIn(string $key): int
    {
        $cacheKey = $this->getCacheKey($key);
        
        // Check if key exists in cache
        if (!$this->cache->has($cacheKey)) {
            return 0;
        }

        // For array cache driver, we can't get TTL directly
        // So we store a timestamp alongside the counter
        $timestampKey = $cacheKey . ':timestamp';
        $decayKey = $cacheKey . ':decay';
        
        $timestamp = $this->cache->get($timestampKey);
        $decayMinutes = $this->cache->get($decayKey, 1);
        
        if ($timestamp === null) {
            return 0;
        }

        $expiresAt = $timestamp + ($decayMinutes * 60);
        $now = time();

        return max(0, $expiresAt - $now);
    }

    /**
     * Reset the rate limiter and store metadata for availableIn calculation.
     *
     * @param string $key
     * @param int $decayMinutes
     * @return void
     */
    public function resetWithMetadata(string $key, int $decayMinutes): void
    {
        $cacheKey = $this->getCacheKey($key);
        $timestampKey = $cacheKey . ':timestamp';
        $decayKey = $cacheKey . ':decay';
        $decaySeconds = $decayMinutes * 60;

        $this->cache->put($timestampKey, time(), $decaySeconds);
        $this->cache->put($decayKey, $decayMinutes, $decaySeconds);
    }

    /**
     * Enhanced hit method that stores metadata for availableIn.
     *
     * @param string $key
     * @param int $decayMinutes
     * @return int
     */
    public function hitWithMetadata(string $key, int $decayMinutes = 1): int
    {
        $cacheKey = $this->getCacheKey($key);
        $timestampKey = $cacheKey . ':timestamp';
        $decayKey = $cacheKey . ':decay';
        $decaySeconds = $decayMinutes * 60;

        // Get or initialize attempts
        $attempts = $this->cache->get($cacheKey, 0);
        
        // If this is the first attempt, store the timestamp
        if ($attempts === 0) {
            $this->cache->put($timestampKey, time(), $decaySeconds);
            $this->cache->put($decayKey, $decayMinutes, $decaySeconds);
        }

        $attempts++;
        $this->cache->put($cacheKey, $attempts, $decaySeconds);

        return $attempts;
    }

    /**
     * Get the cache key with prefix.
     *
     * @param string $key
     * @return string
     */
    private function getCacheKey(string $key): string
    {
        $prefix = config('email-auth.cache.prefix', 'email_auth');
        return "{$prefix}:rate_limit:{$key}";
    }

    /**
     * Get rate limit key for OTP requests.
     *
     * @param string $email
     * @return string
     */
    public function getOTPKey(string $email): string
    {
        return 'otp:' . strtolower($email);
    }

    /**
     * Get rate limit key for verification requests.
     *
     * @param int $userId
     * @return string
     */
    public function getVerificationKey(int $userId): string
    {
        return "verification:{$userId}";
    }

    /**
     * Get rate limit key for magic link requests.
     *
     * @param string $email
     * @return string
     */
    public function getMagicLinkKey(string $email): string
    {
        return 'magic_link:' . strtolower($email);
    }

    /**
     * Get rate limit key for validation attempts.
     *
     * @param string $type Type of validation (otp, verification, magic_link)
     * @param string $identifier Email or user ID
     * @return string
     */
    public function getValidationAttemptsKey(string $type, string $identifier): string
    {
        return "attempts:{$type}:" . strtolower($identifier);
    }
}
