<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ShowLastEmail extends Command
{
    protected $signature = 'email:show-last {--type=verification : Type of email (verification, otp, magic-link, reset)}';
    
    protected $description = 'Show the last email sent (from logs)';

    public function handle()
    {
        $logFile = storage_path('logs/laravel.log');
        
        if (!File::exists($logFile)) {
            $this->error('Log file not found!');
            return 1;
        }

        $content = File::get($logFile);
        $type = $this->option('type');
        
        // Extract email content based on type
        switch ($type) {
            case 'verification':
                $this->showVerificationEmail($content);
                break;
            case 'otp':
                $this->showOTPEmail($content);
                break;
            case 'magic-link':
                $this->showMagicLinkEmail($content);
                break;
            case 'reset':
                $this->showResetEmail($content);
                break;
            default:
                $this->showLastEmail($content);
        }

        return 0;
    }

    private function showVerificationEmail($content)
    {
        // Find verification URLs
        preg_match_all('/verify-email\?token=([^&\s]+)&email=([^\s\]]+)/', $content, $matches);
        
        if (empty($matches[0])) {
            $this->warn('No verification emails found in logs.');
            return;
        }

        $lastMatch = end($matches[0]);
        $token = end($matches[1]);
        $email = end($matches[2]);
        
        $this->info('📧 Last Verification Email');
        $this->line('');
        $this->line('Email: ' . $email);
        $this->line('Token: ' . $token);
        $this->line('');
        $this->line('🔗 Verification Link:');
        $this->line(config('email-auth.frontend_url') . '/verify-email?token=' . $token . '&email=' . $email);
    }

    private function showOTPEmail($content)
    {
        // Find OTP codes (6 digits)
        preg_match_all('/Your verification code is:\s*(\d{6})/', $content, $matches);
        
        if (empty($matches[0])) {
            $this->warn('No OTP emails found in logs.');
            return;
        }

        $lastCode = end($matches[1]);
        
        $this->info('📧 Last OTP Email');
        $this->line('');
        $this->line('🔢 OTP Code: ' . $lastCode);
    }

    private function showMagicLinkEmail($content)
    {
        // Find magic link URLs
        preg_match_all('/magic-link\?token=([^\s\]]+)/', $content, $matches);
        
        if (empty($matches[0])) {
            $this->warn('No magic link emails found in logs.');
            return;
        }

        $lastMatch = end($matches[0]);
        $token = end($matches[1]);
        
        $this->info('📧 Last Magic Link Email');
        $this->line('');
        $this->line('Token: ' . $token);
        $this->line('');
        $this->line('🔗 Magic Link:');
        $this->line(config('email-auth.frontend_url') . '/magic-link?token=' . $token);
    }

    private function showResetEmail($content)
    {
        // Find reset password URLs
        preg_match_all('/reset-password\?token=([^&\s]+)&email=([^\s\]]+)/', $content, $matches);
        
        if (empty($matches[0])) {
            $this->warn('No password reset emails found in logs.');
            return;
        }

        $lastMatch = end($matches[0]);
        $token = end($matches[1]);
        $email = end($matches[2]);
        
        $this->info('📧 Last Password Reset Email');
        $this->line('');
        $this->line('Email: ' . $email);
        $this->line('Token: ' . $token);
        $this->line('');
        $this->line('🔗 Reset Link:');
        $this->line(config('email-auth.frontend_url') . '/reset-password?token=' . $token . '&email=' . $email);
    }

    private function showLastEmail($content)
    {
        $this->info('📧 Searching for all email types...');
        $this->line('');
        
        // Try all types
        $this->showVerificationEmail($content);
        $this->line('');
        $this->showOTPEmail($content);
        $this->line('');
        $this->showMagicLinkEmail($content);
        $this->line('');
        $this->showResetEmail($content);
    }
}
