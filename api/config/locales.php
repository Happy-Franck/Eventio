<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Available Locales
    |--------------------------------------------------------------------------
    |
    | List of all supported locales with their metadata including native names
    | and RTL (right-to-left) direction flags.
    |
    */
    'available' => [
        'en' => [
            'name' => 'English',
            'native' => 'English',
            'rtl' => false,
        ],
        'fr' => [
            'name' => 'French',
            'native' => 'Français',
            'rtl' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Fallback Locale
    |--------------------------------------------------------------------------
    |
    | The fallback locale determines the locale to use when the requested
    | locale is not available or when a translation is missing.
    |
    */
    'fallback' => 'en',

    /*
    |--------------------------------------------------------------------------
    | Locale Detection
    |--------------------------------------------------------------------------
    |
    | Configuration for automatic locale detection from various sources.
    |
    */
    'detection' => [
        'enabled' => true,
        'sources' => ['header', 'cookie', 'query'],
    ],
];
