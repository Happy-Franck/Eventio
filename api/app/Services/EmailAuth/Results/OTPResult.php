<?php

namespace App\Services\EmailAuth\Results;

class OTPResult
{
    public function __construct(
        public readonly bool $success,
        public readonly ?string $message = null,
        public readonly ?string $errorCode = null
    ) {}

    public static function success(string $message = 'OTP code sent successfully'): self
    {
        return new self(true, $message);
    }

    public static function failure(string $message, string $errorCode): self
    {
        return new self(false, $message, $errorCode);
    }
}
