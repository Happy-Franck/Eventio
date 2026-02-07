<?php

namespace App\Notifications\EmailAuth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerificationNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $token
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @param mixed $notifiable
     * @return array
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param mixed $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $frontendUrl = config('email-auth.frontend_url');
        $verificationUrl = "{$frontendUrl}/verify-email?token={$this->token}&email={$notifiable->email}";

        return (new MailMessage)
            ->subject('Verify Your Email Address')
            ->greeting('Welcome!')
            ->line('Thank you for registering. Please verify your email address by clicking the button below.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('This verification link will expire in 24 hours.')
            ->line('If you did not create an account, no further action is required.');
    }

    /**
     * Get the token (for testing purposes).
     *
     * @return string
     */
    public function getToken(): string
    {
        return $this->token;
    }
}
