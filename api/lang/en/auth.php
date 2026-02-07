<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user.
    |
    */

    'failed' => 'These credentials do not match our records.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',
    
    'magic_link' => [
        'sent' => 'Magic link sent to your email.',
        'invalid' => 'Invalid or expired magic link.',
        'success' => 'Successfully authenticated.',
    ],
    
    'otp' => [
        'sent' => 'OTP sent to your email.',
        'invalid' => 'Invalid or expired OTP.',
        'success' => 'OTP verified successfully.',
    ],
    
    'verification' => [
        'sent' => 'Verification email sent.',
        'success' => 'Email verified successfully.',
        'invalid' => 'Invalid or expired verification link.',
        'already_verified' => 'Email already verified.',
    ],
    
    'register' => [
        'success' => 'Registration successful.',
        'failed' => 'Registration failed. Please try again.',
    ],
    
    'login' => [
        'success' => 'Login successful.',
        'failed' => 'Login failed. Please check your credentials.',
    ],
    
    'logout' => [
        'success' => 'Logged out successfully.',
    ],
    
    'password_reset' => [
        'sent' => 'Password reset link sent to your email.',
        'success' => 'Password reset successfully.',
        'invalid' => 'Invalid or expired password reset token.',
    ],
];
