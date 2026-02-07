<?php

namespace App\Providers;

use App\Services\EmailAuth\EmailAuthService;
use App\Services\EmailAuth\EmailSender;
use App\Services\EmailAuth\RateLimiter;
use App\Services\EmailAuth\TokenManager;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;

class EmailAuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register TokenManager as singleton
        $this->app->singleton(TokenManager::class, function ($app) {
            $cacheDriver = config('email-auth.cache.driver', 'redis');
            return new TokenManager(Cache::store($cacheDriver));
        });

        // Register RateLimiter as singleton
        $this->app->singleton(RateLimiter::class, function ($app) {
            $cacheDriver = config('email-auth.cache.driver', 'redis');
            $config = config('email-auth');
            return new RateLimiter(Cache::store($cacheDriver), $config);
        });

        // Register EmailSender as singleton
        $this->app->singleton(EmailSender::class, function ($app) {
            return new EmailSender($app->make(\Illuminate\Contracts\Notifications\Dispatcher::class));
        });

        // Register EmailAuthService as singleton
        $this->app->singleton(EmailAuthService::class, function ($app) {
            return new EmailAuthService(
                $app->make(TokenManager::class),
                $app->make(EmailSender::class),
                $app->make(RateLimiter::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Load configuration
        $this->mergeConfigFrom(
            __DIR__.'/../../config/email-auth.php', 'email-auth'
        );
    }
}
