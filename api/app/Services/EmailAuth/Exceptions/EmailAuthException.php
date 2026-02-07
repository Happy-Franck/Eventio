<?php

namespace App\Services\EmailAuth\Exceptions;

use Exception;
use Throwable;

class EmailAuthException extends Exception
{
    public function __construct(
        string $message,
        public readonly string $errorCode,
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
