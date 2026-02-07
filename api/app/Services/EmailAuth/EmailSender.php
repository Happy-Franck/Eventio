<?php

namespace App\Services\EmailAuth;

use App\Models\User;
use App\Notifications\EmailAuth\MagicLinkNotification;
use App\Notifications\EmailAuth\OTPNotification;
use App\Notifications\EmailAuth\VerificationNotification;
use Illuminate\Contracts\Notifications\Dispatcher as NotificationDispatcher;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Log;
use Throwable;

class EmailSender
{
    public function __construct(
        private NotificationDispatcher $notificationDispatcher
    ) {}

    /**
     * Send an OTP code via email.
     *
     * @param string $email
     * @param string $code
     * @return bool
     */
    public function sendOTP(string $email, string $code): bool
    {
        try {
            $notifiable = $this->createAnonymousNotifiable($email);
            $notification = new OTPNotification($code);
            
            $this->send($notifiable, $notification);
            
            $this->logSuccess('OTP', $email);
            
            return true;
        } catch (Throwable $e) {
            $this->logError('OTP', $email, $e);
            return false;
        }
    }

    /**
     * Send a verification email.
     *
     * @param User $user
     * @param string $token
     * @return bool
     */
    public function sendVerification(User $user, string $token): bool
    {
        try {
            $notification = new VerificationNotification($token);
            
            $this->send($user, $notification);
            
            $this->logSuccess('Verification', $user->email);
            
            return true;
        } catch (Throwable $e) {
            $this->logError('Verification', $user->email, $e);
            return false;
        }
    }

    /**
     * Send a magic link for password reset.
     *
     * @param string $email
     * @param string $token
     * @return bool
     */
    public function sendMagicLink(string $email, string $token): bool
    {
        try {
            $notifiable = $this->createAnonymousNotifiable($email);
            $notification = new MagicLinkNotification($token);
            
            $this->send($notifiable, $notification);
            
            $this->logSuccess('MagicLink', $email);
            
            return true;
        } catch (Throwable $e) {
            $this->logError('MagicLink', $email, $e);
            return false;
        }
    }

    /**
     * Send a notification to a notifiable entity.
     *
     * @param mixed $notifiable
     * @param mixed $notification
     * @return void
     */
    private function send($notifiable, $notification): void
    {
        $this->notificationDispatcher->send($notifiable, $notification);
    }

    /**
     * Create an anonymous notifiable for email-only notifications.
     *
     * @param string $email
     * @return AnonymousNotifiable
     */
    private function createAnonymousNotifiable(string $email): AnonymousNotifiable
    {
        return (new AnonymousNotifiable)->route('mail', $email);
    }

    /**
     * Log successful email send.
     *
     * @param string $type
     * @param string $email
     * @return void
     */
    private function logSuccess(string $type, string $email): void
    {
        Log::info("Email sent successfully", [
            'type' => $type,
            'email' => $email,
            'timestamp' => now()->toIso8601String(),
            'status' => 'success'
        ]);
    }

    /**
     * Log email send error.
     *
     * @param string $type
     * @param string $email
     * @param Throwable $exception
     * @return void
     */
    private function logError(string $type, string $email, Throwable $exception): void
    {
        Log::error("Email send failed", [
            'type' => $type,
            'email' => $email,
            'timestamp' => now()->toIso8601String(),
            'status' => 'failed',
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
