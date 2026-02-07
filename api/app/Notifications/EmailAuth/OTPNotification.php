<?php

namespace App\Notifications\EmailAuth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OTPNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $code
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
        return (new MailMessage)
            ->subject('Your Login Code')
            ->greeting('Hello!')
            ->line('You requested a login code for your account.')
            ->line("Your verification code is: **{$this->code}**")
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not request this code, please ignore this email.');
    }

    /**
     * Get the code (for testing purposes).
     *
     * @return string
     */
    public function getCode(): string
    {
        return $this->code;
    }
}
