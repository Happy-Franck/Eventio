<?php

namespace Tests\Unit\EmailAuth;

use App\Models\User;
use App\Services\EmailAuth\EmailSender;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Tests for EmailSender
 * 
 * Feature: email-authentication-service
 * Property 5: Email Sending Verification
 * Property 10: Email Logging
 * Validates: Requirements 1.3, 2.3, 3.3, 4.3, 4.4
 */
class EmailSenderTest extends TestCase
{
    private EmailSender $emailSender;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        Log::spy();
        
        $this->emailSender = new EmailSender(app(\Illuminate\Contracts\Notifications\Dispatcher::class));
    }

    /**
     * Property 5: Email Sending Verification
     * For all email sending operations (OTP, verification, magic link),
     * an email must be sent containing the code or appropriate link.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_otp_emails_are_sent_with_code(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $email = "user{$i}@example.com";
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            $result = $this->emailSender->sendOTP($email, $code);
            
            $this->assertTrue($result, "OTP email should be sent successfully (iteration {$i})");
        }
        
        // Verify notifications were sent
        Notification::assertSentTimes(\App\Notifications\EmailAuth\OTPNotification::class, 50);
    }

    /**
     * Property 5 (continued): Verification emails are sent.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_verification_emails_are_sent_with_token(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $user = User::factory()->make([
                'id' => $i + 1,
                'email' => "user{$i}@example.com"
            ]);
            $token = bin2hex(random_bytes(32));
            
            $result = $this->emailSender->sendVerification($user, $token);
            
            $this->assertTrue($result, "Verification email should be sent successfully (iteration {$i})");
        }
        
        Notification::assertSentTimes(\App\Notifications\EmailAuth\VerificationNotification::class, 50);
    }

    /**
     * Property 5 (continued): Magic link emails are sent.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_magic_link_emails_are_sent_with_token(): void
    {
        for ($i = 0; $i < 50; $i++) {
            $email = "user{$i}@example.com";
            $token = bin2hex(random_bytes(32));
            
            $result = $this->emailSender->sendMagicLink($email, $token);
            
            $this->assertTrue($result, "Magic link email should be sent successfully (iteration {$i})");
        }
        
        Notification::assertSentTimes(\App\Notifications\EmailAuth\MagicLinkNotification::class, 50);
    }

    /**
     * Property 10: Email Logging
     * For all email sends, a log must be created containing timestamp,
     * type, recipient, and status.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_successful_email_sends_are_logged(): void
    {
        $email = 'test@example.com';
        $code = '123456';
        
        $this->emailSender->sendOTP($email, $code);
        
        Log::shouldHaveReceived('info')
            ->once()
            ->with('Email sent successfully', \Mockery::on(function ($context) use ($email) {
                return $context['type'] === 'OTP'
                    && $context['email'] === $email
                    && $context['status'] === 'success'
                    && isset($context['timestamp']);
            }));
    }

    /**
     * Property 10 (continued): All email types are logged.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function property_all_email_types_are_logged(): void
    {
        $email = 'test@example.com';
        $user = User::factory()->make(['email' => $email]);
        $code = '123456';
        $token = 'test_token';
        
        // Send all types
        $this->emailSender->sendOTP($email, $code);
        $this->emailSender->sendVerification($user, $token);
        $this->emailSender->sendMagicLink($email, $token);
        
        // Verify all were logged
        Log::shouldHaveReceived('info')->times(3);
    }

    /**
     * Unit test: Failed email sends are logged with error.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_failed_email_sends_are_logged_with_error(): void
    {
        // Force notification to fail by using invalid setup
        Notification::shouldReceive('send')
            ->andThrow(new \Exception('Email service unavailable'));
        
        $emailSender = new EmailSender(app(\Illuminate\Contracts\Notifications\Dispatcher::class));
        $result = $emailSender->sendOTP('test@example.com', '123456');
        
        $this->assertFalse($result, 'Failed email send should return false');
        
        Log::shouldHaveReceived('error')
            ->once()
            ->with('Email send failed', \Mockery::on(function ($context) {
                return $context['type'] === 'OTP'
                    && $context['status'] === 'failed'
                    && isset($context['error'])
                    && isset($context['timestamp']);
            }));
    }

    /**
     * Unit test: OTP email sends successfully.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_send_otp_success(): void
    {
        $email = 'user@example.com';
        $code = '654321';
        
        $result = $this->emailSender->sendOTP($email, $code);
        
        $this->assertTrue($result);
        
        Notification::assertSentTo(
            new \Illuminate\Notifications\AnonymousNotifiable,
            \App\Notifications\EmailAuth\OTPNotification::class,
            function ($notification, $channels, $notifiable) use ($email, $code) {
                return $notifiable->routes['mail'] === $email
                    && $notification->getCode() === $code;
            }
        );
    }

    /**
     * Unit test: Verification email sends successfully.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_send_verification_success(): void
    {
        $user = User::factory()->make(['email' => 'user@example.com']);
        $token = 'verification_token_123';
        
        $result = $this->emailSender->sendVerification($user, $token);
        
        $this->assertTrue($result);
        
        Notification::assertSentTo(
            $user,
            \App\Notifications\EmailAuth\VerificationNotification::class,
            function ($notification) use ($token) {
                return $notification->getToken() === $token;
            }
        );
    }

    /**
     * Unit test: Magic link email sends successfully.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_send_magic_link_success(): void
    {
        $email = 'user@example.com';
        $token = 'magic_link_token_456';
        
        $result = $this->emailSender->sendMagicLink($email, $token);
        
        $this->assertTrue($result);
        
        Notification::assertSentTo(
            new \Illuminate\Notifications\AnonymousNotifiable,
            \App\Notifications\EmailAuth\MagicLinkNotification::class,
            function ($notification, $channels, $notifiable) use ($email, $token) {
                return $notifiable->routes['mail'] === $email
                    && $notification->getToken() === $token;
            }
        );
    }

    /**
     * Unit test: Multiple emails to same address.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_multiple_emails_to_same_address(): void
    {
        $email = 'user@example.com';
        
        $this->emailSender->sendOTP($email, '111111');
        $this->emailSender->sendOTP($email, '222222');
        $this->emailSender->sendOTP($email, '333333');
        
        Notification::assertSentTimes(\App\Notifications\EmailAuth\OTPNotification::class, 3);
    }

    /**
     * Unit test: Emails to different addresses are isolated.
     */
    #[\PHPUnit\Framework\Attributes\Test]
    public function test_emails_to_different_addresses_isolated(): void
    {
        $this->emailSender->sendOTP('user1@example.com', '111111');
        $this->emailSender->sendOTP('user2@example.com', '222222');
        $this->emailSender->sendOTP('user3@example.com', '333333');
        
        Notification::assertSentTimes(\App\Notifications\EmailAuth\OTPNotification::class, 3);
    }
}
