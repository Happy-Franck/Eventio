<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
<<<<<<< HEAD
        // Add SetLocale middleware to API routes
        $middleware->api(append: [
            \App\Http\Middleware\SetLocale::class,
=======
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
>>>>>>> 03a691a2d43bfe6c06cd45f5b7170db722d7ac84
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
