<?php

namespace App\Services\EmailAuth;

use App\Models\User;
use App\Services\EmailAuth\Exceptions\EmailAuthErrorCode;
use App\Services\EmailAuth\Results\MagicLinkResult;
use App\Services\EmailAuth\Results\OTPResult;
use App\Services\EmailAuth\Results\ValidationResult;
use App\Services\EmailAuth\Results\VerificationResult;

class EmailAuthService
{
    public function __construct(
        private TokenManager $tokenManager,
        private EmailSender $emailSender,
        private RateLimiter $rateLimiter
    ) {}

    // ==================== OTP Login Methods ====================

    public function sendOTPCode(string $email): OTPResult
    {
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return OTPResult::failure('Invalid email format', EmailAuthErrorCode::INVALID_EMAIL);
        }

        // Check rate limiting
        $rateLimitKey = $this->rateLimiter->getOTPKey($email);
        $config = config('email-auth.otp');
        
        if (!$this->rateLimiter->attempt($rateLimitKey, $config['rate_limit']['max_requests'], $config['rate_limit']['decay_minutes'])) {
            return OTPResult::failure('Too many requests. Please try again later.', EmailAuthErrorCode::RATE_LIMIT_EXCEEDED);
        }

        // Invalidate any existing OTP
        $this->tokenManager->invalidateOTP($email);

        // Generate and store new OTP
        $code = $this->tokenManager->generateOTPCode();
        $this->tokenManager->storeOTP($email, $code, $config['ttl']);

        // Send email
        $sent = $this->emailSender->sendOTP($email, $code);
        
        if (!$sent) {
            return OTPResult::failure('Failed to send email', EmailAuthErrorCode::EMAIL_SEND_FAILED);
        }

        return OTPResult::success();
    }

    public function verifyOTPCode(string $email, string $code): ValidationResult
    {
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ValidationResult::failure('Invalid email format', EmailAuthErrorCode::INVALID_EMAIL);
        }

        // Check validation attempts rate limiting
        $attemptsKey = $this->rateLimiter->getValidationAttemptsKey('otp', $email);
        $config = config('email-auth.otp');
        
        if ($this->rateLimiter->tooManyAttempts($attemptsKey, $config['max_attempts'])) {
            return ValidationResult::failure('Too many validation attempts', EmailAuthErrorCode::VALIDATION_ATTEMPTS_EXCEEDED);
        }

        // Increment attempts
        $this->rateLimiter->hit($attemptsKey, $config['rate_limit']['decay_minutes']);

        // Validate OTP
        $isValid = $this->tokenManager->validateOTP($email, $code);
        
        if (!$isValid) {
            return ValidationResult::failure('Invalid or expired code', EmailAuthErrorCode::INVALID_CODE);
        }

        // Invalidate the code after successful validation
        $this->tokenManager->invalidateOTP($email);
        
        // Clear validation attempts
        $this->rateLimiter->clear($attemptsKey);

        return ValidationResult::success($email, 'OTP verified successfully');
    }

    public function resendOTP(string $email): OTPResult
    {
        return $this->sendOTPCode($email);
    }

    // ==================== Email Verification Methods ====================

    public function sendVerificationEmail(User $user): VerificationResult
    {
        // Check rate limiting
        $rateLimitKey = $this->rateLimiter->getVerificationKey($user->id);
        $config = config('email-auth.verification');
        
        if (!$this->rateLimiter->attempt($rateLimitKey, $config['rate_limit']['max_requests'], $config['rate_limit']['decay_minutes'])) {
            return VerificationResult::failure('Too many requests. Please try again later.', EmailAuthErrorCode::RATE_LIMIT_EXCEEDED);
        }

        // Invalidate any existing token
        $tokenKey = $this->tokenManager->getVerificationKey($user->id);
        $this->tokenManager->invalidateToken($tokenKey);

        // Generate and store new token
        $token = $this->tokenManager->generateToken($config['token_length'] / 2); // Divide by 2 because hex encoding doubles length
        $this->tokenManager->storeToken($tokenKey, $token, $config['ttl']);

        // Send email
        $sent = $this->emailSender->sendVerification($user, $token);
        
        if (!$sent) {
            return VerificationResult::failure('Failed to send email', EmailAuthErrorCode::EMAIL_SEND_FAILED);
        }

        return VerificationResult::success();
    }

    public function verifyEmail(string $token): ValidationResult
    {
        // Find user by checking all possible verification keys
        // In a real implementation, we'd store a mapping or pass user ID
        // For now, we'll need to modify this to accept user ID or email
        
        return ValidationResult::failure('Not implemented - requires user context', EmailAuthErrorCode::INVALID_TOKEN);
    }

    public function verifyEmailWithUserId(int $userId, string $token): ValidationResult
    {
        $tokenKey = $this->tokenManager->getVerificationKey($userId);
        
        // Validate token
        $isValid = $this->tokenManager->validateToken($tokenKey, $token);
        
        if (!$isValid) {
            return ValidationResult::failure('Invalid or expired token', EmailAuthErrorCode::INVALID_TOKEN);
        }

        // Mark email as verified
        $user = User::find($userId);
        if (!$user) {
            return ValidationResult::failure('User not found', EmailAuthErrorCode::USER_NOT_FOUND);
        }

        $user->email_verified_at = now();
        $user->save();

        // Invalidate the token
        $this->tokenManager->invalidateToken($tokenKey);

        return ValidationResult::success($user->email, 'Email verified successfully');
    }

    public function resendVerification(User $user): VerificationResult
    {
        return $this->sendVerificationEmail($user);
    }

    // ==================== Magic Link Methods ====================

    public function sendMagicLink(string $email): MagicLinkResult
    {
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return MagicLinkResult::failure('Invalid email format', EmailAuthErrorCode::INVALID_EMAIL);
        }

        // Check if user exists
        $user = User::where('email', $email)->first();
        if (!$user) {
            return MagicLinkResult::failure('User not found', EmailAuthErrorCode::USER_NOT_FOUND);
        }

        // Check rate limiting
        $rateLimitKey = $this->rateLimiter->getMagicLinkKey($email);
        $config = config('email-auth.magic_link');
        
        if (!$this->rateLimiter->attempt($rateLimitKey, $config['rate_limit']['max_requests'], $config['rate_limit']['decay_minutes'])) {
            return MagicLinkResult::failure('Too many requests. Please try again later.', EmailAuthErrorCode::RATE_LIMIT_EXCEEDED);
        }

        // Invalidate any existing token
        $tokenKey = $this->tokenManager->getMagicLinkKey($email);
        $this->tokenManager->invalidateToken($tokenKey);

        // Generate and store new token
        $token = $this->tokenManager->generateToken($config['token_length'] / 2);
        $this->tokenManager->storeToken($tokenKey, $token, $config['ttl']);

        // Send email
        $sent = $this->emailSender->sendMagicLink($email, $token);
        
        if (!$sent) {
            return MagicLinkResult::failure('Failed to send email', EmailAuthErrorCode::EMAIL_SEND_FAILED);
        }

        return MagicLinkResult::success();
    }

    public function verifyMagicLink(string $token, string $email): ValidationResult
    {
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ValidationResult::failure('Invalid email format', EmailAuthErrorCode::INVALID_EMAIL);
        }

        $tokenKey = $this->tokenManager->getMagicLinkKey($email);
        
        // Validate token
        $isValid = $this->tokenManager->validateToken($tokenKey, $token);
        
        if (!$isValid) {
            return ValidationResult::failure('Invalid or expired token', EmailAuthErrorCode::INVALID_TOKEN);
        }

        // Invalidate the token
        $this->tokenManager->invalidateToken($tokenKey);

        return ValidationResult::success($email, 'Magic link verified successfully');
    }

    public function resendMagicLink(string $email): MagicLinkResult
    {
        return $this->sendMagicLink($email);
    }
}
