<?php

namespace App\Services\EmailAuth\Exceptions;

class EmailAuthErrorCode
{
    public const INVALID_TOKEN = 'INVALID_TOKEN';
    public const EXPIRED_TOKEN = 'EXPIRED_TOKEN';
    public const INVALID_CODE = 'INVALID_CODE';
    public const EXPIRED_CODE = 'EXPIRED_CODE';
    public const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED';
    public const INVALID_EMAIL = 'INVALID_EMAIL';
    public const EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED';
    public const USER_NOT_FOUND = 'USER_NOT_FOUND';
    public const VALIDATION_ATTEMPTS_EXCEEDED = 'VALIDATION_ATTEMPTS_EXCEEDED';
    public const CONFIGURATION_ERROR = 'CONFIGURATION_ERROR';
}
