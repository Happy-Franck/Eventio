<?php

namespace Tests\Unit\EmailAuth;

use App\Models\User;
use App\Notifications\EmailAuth\MagicLinkNotification;
use App\Notifications\EmailAuth\OTPNotification;
use App\Notifications\EmailAuth\VerificationNotification;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Unit Tests for Email Authentication Notifications
 * 
 * Feature: email-authentication-service
 * Validates: Requirements 1.3, 2.3, 3.3
 */
class NotificationsTest extends TestCase
{
    /**
     * Test OTPNotification contains the code.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_otp_notification_contains_code(): void
    {
        $code = '123456';
        $notification = new OTPNotification($code);
        
        // Test via() method
        $this->assertSame(['mail'], $notification->via(null));
        
        // Test getCode() method
        $this->assertSame($code, $notification->getCode());
        
        // Test mail message
        $user = new User(['email' => 'test@example.com', 'name' => 'Test User']);
        $mailMessage = $notification->toMail($user);
        
        $this->assertStringContainsString('Login Code', $mailMessage->subject);
        
        // Check that code appears in the message
        $renderedMessage = $this->renderMailMessage($mailMessage);
        $this->assertStringContainsString($code, $renderedMessage);
    }

    /**
     * Test OTPNotification format and structure.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_otp_notification_format(): void
    {
        $code = '654321';
        $notification = new OTPNotification($code);
        $user = new User(['email' => 'test@example.com', 'name' => 'Test User']);
        
        $mailMessage = $notification->toMail($user);
        
        // Check subject
        $this->assertNotEmpty($mailMessage->subject);
        
        // Check that important information is present
        $renderedMessage = $this->renderMailMessage($mailMessage);
        $this->assertStringContainsString($code, $renderedMessage);
        $this->assertStringContainsString('10 minutes', $renderedMessage);
    }

    /**
     * Test VerificationNotification contains the token and link.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_verification_notification_contains_token_and_link(): void
    {
        $token = 'test_verification_token_123';
        $notification = new VerificationNotification($token);
        
        // Test via() method
        $this->assertSame(['mail'], $notification->via(null));
        
        // Test getToken() method
        $this->assertSame($token, $notification->getToken());
        
        // Test mail message
        $user = new User(['email' => 'test@example.com', 'name' => 'Test User']);
        $mailMessage = $notification->toMail($user);
        
        $this->assertStringContainsString('Verify', $mailMessage->subject);
        
        // Check that token and email appear in the action URL
        $this->assertNotEmpty($mailMessage->actionUrl);
        $this->assertStringContainsString($token, $mailMessage->actionUrl);
        $this->assertStringContainsString($user->email, $mailMessage->actionUrl);
    }

    /**
     * Test VerificationNotification format and structure.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_verification_notification_format(): void
    {
        $token = 'verification_token_456';
        $notification = new VerificationNotification($token);
        $user = new User(['email' => 'user@example.com', 'name' => 'Test User']);
        
        $mailMessage = $notification->toMail($user);
        
        // Check subject
        $this->assertNotEmpty($mailMessage->subject);
        
        // Check action button
        $this->assertNotEmpty($mailMessage->actionText);
        $this->assertNotEmpty($mailMessage->actionUrl);
        
        // Check that important information is present
        $renderedMessage = $this->renderMailMessage($mailMessage);
        $this->assertStringContainsString('24 hours', $renderedMessage);
    }

    /**
     * Test MagicLinkNotification contains the token and link.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_magic_link_notification_contains_token_and_link(): void
    {
        $token = 'test_magic_link_token_789';
        $notification = new MagicLinkNotification($token);
        
        // Test via() method
        $this->assertSame(['mail'], $notification->via(null));
        
        // Test getToken() method
        $this->assertSame($token, $notification->getToken());
        
        // Test mail message
        $user = new User(['email' => 'test@example.com', 'name' => 'Test User']);
        $mailMessage = $notification->toMail($user);
        
        $this->assertStringContainsString('Password', $mailMessage->subject);
        
        // Check that token and email appear in the action URL
        $this->assertNotEmpty($mailMessage->actionUrl);
        $this->assertStringContainsString($token, $mailMessage->actionUrl);
        $this->assertStringContainsString($user->email, $mailMessage->actionUrl);
    }

    /**
     * Test MagicLinkNotification format and structure.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_magic_link_notification_format(): void
    {
        $token = 'magic_link_token_999';
        $notification = new MagicLinkNotification($token);
        $user = new User(['email' => 'user@example.com', 'name' => 'Test User']);
        
        $mailMessage = $notification->toMail($user);
        
        // Check subject
        $this->assertNotEmpty($mailMessage->subject);
        
        // Check action button
        $this->assertNotEmpty($mailMessage->actionText);
        $this->assertNotEmpty($mailMessage->actionUrl);
        
        // Check that important information is present
        $renderedMessage = $this->renderMailMessage($mailMessage);
        $this->assertStringContainsString('1 hour', $renderedMessage);
    }

    /**
     * Test that all notifications use mail channel.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_all_notifications_use_mail_channel(): void
    {
        $otpNotification = new OTPNotification('123456');
        $verificationNotification = new VerificationNotification('token123');
        $magicLinkNotification = new MagicLinkNotification('token456');
        
        $this->assertSame(['mail'], $otpNotification->via(null));
        $this->assertSame(['mail'], $verificationNotification->via(null));
        $this->assertSame(['mail'], $magicLinkNotification->via(null));
    }

    /**
     * Test that verification and magic link URLs use configured frontend URL.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_notifications_use_configured_frontend_url(): void
    {
        $frontendUrl = config('email-auth.frontend_url');
        
        $verificationNotification = new VerificationNotification('token123');
        $magicLinkNotification = new MagicLinkNotification('token456');
        
        $user = new User(['email' => 'test@example.com', 'name' => 'Test User']);
        
        $verificationMail = $verificationNotification->toMail($user);
        $magicLinkMail = $magicLinkNotification->toMail($user);
        
        $this->assertStringStartsWith($frontendUrl, $verificationMail->actionUrl);
        $this->assertStringStartsWith($frontendUrl, $magicLinkMail->actionUrl);
    }

    /**
     * Test OTP notification with different code formats.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_otp_notification_with_various_codes(): void
    {
        $codes = ['000000', '123456', '999999', '000001', '100000'];
        
        foreach ($codes as $code) {
            $notification = new OTPNotification($code);
            $user = new User(['email' => 'test@example.com', 'name' => 'Test User']);
            
            $mailMessage = $notification->toMail($user);
            $renderedMessage = $this->renderMailMessage($mailMessage);
            
            $this->assertStringContainsString($code, $renderedMessage);
            $this->assertSame($code, $notification->getCode());
        }
    }

    /**
     * Helper method to render mail message lines into a string.
     */
    private function renderMailMessage($mailMessage): string
    {
        $content = '';
        
        if (isset($mailMessage->subject)) {
            $content .= $mailMessage->subject . ' ';
        }
        
        if (isset($mailMessage->greeting)) {
            $content .= $mailMessage->greeting . ' ';
        }
        
        foreach ($mailMessage->introLines as $line) {
            $content .= $line . ' ';
        }
        
        if (isset($mailMessage->actionText)) {
            $content .= $mailMessage->actionText . ' ';
        }
        
        if (isset($mailMessage->actionUrl)) {
            $content .= $mailMessage->actionUrl . ' ';
        }
        
        foreach ($mailMessage->outroLines as $line) {
            $content .= $line . ' ';
        }
        
        return $content;
    }
}
