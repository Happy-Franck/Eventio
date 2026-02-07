<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OTP Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for One-Time Password (OTP) login codes.
    |
    */
    'otp' => [
        'length' => env('EMAIL_AUTH_OTP_LENGTH', 6),
        'ttl' => env('EMAIL_AUTH_OTP_TTL', 600), // 10 minutes in seconds
        'max_attempts' => env('EMAIL_AUTH_OTP_MAX_ATTEMPTS', 5),
        'rate_limit' => [
            'max_requests' => env('EMAIL_AUTH_OTP_RATE_LIMIT_MAX', 3),
            'decay_minutes' => env('EMAIL_AUTH_OTP_RATE_LIMIT_DECAY', 5),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Verification Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for email verification tokens sent during registration.
    |
    */
    'verification' => [
        'token_length' => env('EMAIL_AUTH_VERIFICATION_TOKEN_LENGTH', 64),
        'ttl' => env('EMAIL_AUTH_VERIFICATION_TTL', 86400), // 24 hours in seconds
        'rate_limit' => [
            'max_requests' => env('EMAIL_AUTH_VERIFICATION_RATE_LIMIT_MAX', 5),
            'decay_minutes' => env('EMAIL_AUTH_VERIFICATION_RATE_LIMIT_DECAY', 60),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Magic Link Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for password reset magic links.
    |
    */
    'magic_link' => [
        'token_length' => env('EMAIL_AUTH_MAGIC_LINK_TOKEN_LENGTH', 64),
        'ttl' => env('EMAIL_AUTH_MAGIC_LINK_TTL', 3600), // 1 hour in seconds
        'rate_limit' => [
            'max_requests' => env('EMAIL_AUTH_MAGIC_LINK_RATE_LIMIT_MAX', 3),
            'decay_minutes' => env('EMAIL_AUTH_MAGIC_LINK_RATE_LIMIT_DECAY', 15),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Frontend URL
    |--------------------------------------------------------------------------
    |
    | The base URL of your frontend application. Used to generate links
    | in email notifications.
    |
    */
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    /*
    |--------------------------------------------------------------------------
    | Cache Configuration
    |--------------------------------------------------------------------------
    |
    | Cache driver and prefix for storing tokens and rate limit data.
    |
    */
    'cache' => [
        'driver' => env('EMAIL_AUTH_CACHE_DRIVER', env('CACHE_DRIVER', 'database')),
        'prefix' => env('EMAIL_AUTH_CACHE_PREFIX', 'email_auth'),
    ],
];
