<?php

namespace App\Services\EmailAuth;

use Illuminate\Contracts\Cache\Repository as CacheInterface;

class TokenManager
{
    public function __construct(
        private CacheInterface $cache
    ) {}

    /**
     * Generate a random 6-digit OTP code.
     *
     * @return string
     */
    public function generateOTPCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate a cryptographically secure random token.
     *
     * @param int $length Length of the token in bytes (will be hex encoded, so actual string length will be double)
     * @return string
     */
    public function generateToken(int $length = 32): string
    {
        return bin2hex(random_bytes($length));
    }

    /**
     * Hash a token using SHA-256.
     *
     * @param string $token
     * @return string
     */
    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Perform a timing-safe comparison of two strings.
     *
     * @param string $known The known string
     * @param string $user The user-provided string
     * @return bool
     */
    public function timingSafeCompare(string $known, string $user): bool
    {
        return hash_equals($known, $user);
    }

    /**
     * Store an OTP code in cache with TTL.
     *
     * @param string $email
     * @param string $code
     * @param int $ttl Time to live in seconds
     * @return void
     */
    public function storeOTP(string $email, string $code, int $ttl): void
    {
        $key = $this->getOTPKey($email);
        $hashedCode = $this->hashToken($code);
        
        $this->cache->put($key, $hashedCode, $ttl);
    }

    /**
     * Store a token in cache with TTL.
     *
     * @param string $key Cache key
     * @param string $token
     * @param int $ttl Time to live in seconds
     * @return void
     */
    public function storeToken(string $key, string $token, int $ttl): void
    {
        $hashedToken = $this->hashToken($token);
        
        $this->cache->put($key, $hashedToken, $ttl);
    }

    /**
     * Validate an OTP code.
     *
     * @param string $email
     * @param string $code
     * @return bool
     */
    public function validateOTP(string $email, string $code): bool
    {
        $key = $this->getOTPKey($email);
        $storedHash = $this->cache->get($key);
        
        if ($storedHash === null) {
            return false;
        }
        
        $providedHash = $this->hashToken($code);
        
        return $this->timingSafeCompare($storedHash, $providedHash);
    }

    /**
     * Validate a token.
     *
     * @param string $key Cache key
     * @param string $token
     * @return bool
     */
    public function validateToken(string $key, string $token): bool
    {
        $storedHash = $this->cache->get($key);
        
        if ($storedHash === null) {
            return false;
        }
        
        $providedHash = $this->hashToken($token);
        
        return $this->timingSafeCompare($storedHash, $providedHash);
    }

    /**
     * Invalidate an OTP code.
     *
     * @param string $email
     * @return void
     */
    public function invalidateOTP(string $email): void
    {
        $key = $this->getOTPKey($email);
        $this->cache->forget($key);
    }

    /**
     * Invalidate a token.
     *
     * @param string $key Cache key
     * @return void
     */
    public function invalidateToken(string $key): void
    {
        $this->cache->forget($key);
    }

    /**
     * Get the cache key for an OTP code.
     *
     * @param string $email
     * @return string
     */
    private function getOTPKey(string $email): string
    {
        $prefix = config('email-auth.cache.prefix', 'email_auth');
        return "{$prefix}:otp:" . strtolower($email);
    }

    /**
     * Get the cache key for a verification token.
     *
     * @param int $userId
     * @return string
     */
    public function getVerificationKey(int $userId): string
    {
        $prefix = config('email-auth.cache.prefix', 'email_auth');
        return "{$prefix}:verification:{$userId}";
    }

    /**
     * Get the cache key for a magic link token.
     *
     * @param string $email
     * @return string
     */
    public function getMagicLinkKey(string $email): string
    {
        $prefix = config('email-auth.cache.prefix', 'email_auth');
        return "{$prefix}:magic_link:" . strtolower($email);
    }
}
