<?php

namespace App\Services\EmailAuth\Results;

class ValidationResult
{
    public function __construct(
        public readonly bool $valid,
        public readonly ?string $email = null,
        public readonly ?string $message = null,
        public readonly ?string $errorCode = null
    ) {}

    public static function success(?string $email = null, string $message = 'Validation successful'): self
    {
        return new self(true, $email, $message);
    }

    public static function failure(string $message, string $errorCode): self
    {
        return new self(false, null, $message, $errorCode);
    }
}
