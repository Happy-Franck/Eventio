<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).


## Email Authentication Service

This application includes a comprehensive Email Authentication Service that provides three authentication methods:

### Features

- **OTP Login**: One-time password codes sent via email (6-digit codes, 10-minute expiration)
- **Email Verification**: Verify email addresses during registration (24-hour token expiration)
- **Magic Links**: Password reset via secure email links (1-hour expiration)

### Security Features

- All tokens are hashed with SHA-256 before storage
- Timing-safe comparison for token validation
- Rate limiting on all endpoints to prevent abuse
- Automatic token invalidation after use
- Configurable expiration times for all token types

### Configuration

Configure the service via environment variables in your `.env` file:

```env
# Frontend URL for email links
FRONTEND_URL=http://localhost:3000

# Cache driver (redis recommended for production)
EMAIL_AUTH_CACHE_DRIVER=redis

# OTP Configuration
EMAIL_AUTH_OTP_TTL=600                    # 10 minutes
EMAIL_AUTH_OTP_RATE_LIMIT_MAX=3           # 3 requests
EMAIL_AUTH_OTP_RATE_LIMIT_DECAY=5         # per 5 minutes

# Email Verification Configuration
EMAIL_AUTH_VERIFICATION_TTL=86400         # 24 hours
EMAIL_AUTH_VERIFICATION_RATE_LIMIT_MAX=5  # 5 requests
EMAIL_AUTH_VERIFICATION_RATE_LIMIT_DECAY=60 # per 60 minutes

# Magic Link Configuration
EMAIL_AUTH_MAGIC_LINK_TTL=3600            # 1 hour
EMAIL_AUTH_MAGIC_LINK_RATE_LIMIT_MAX=3    # 3 requests
EMAIL_AUTH_MAGIC_LINK_RATE_LIMIT_DECAY=15 # per 15 minutes
```

### API Endpoints

#### OTP Login
- `POST /api/auth/otp/send` - Send OTP code
- `POST /api/auth/otp/verify` - Verify OTP code
- `POST /api/auth/otp/resend` - Resend OTP code

#### Email Verification
- `POST /api/auth/email/verify` - Verify email with token
- `POST /api/auth/email/resend` - Resend verification email (requires auth)

#### Magic Links
- `POST /api/auth/magic-link/send` - Send magic link
- `POST /api/auth/magic-link/verify` - Verify magic link
- `POST /api/auth/magic-link/resend` - Resend magic link

### Documentation

For detailed API documentation including request/response examples and error codes, see [EMAIL_AUTH_API.md](EMAIL_AUTH_API.md).

### Testing

The service includes comprehensive test coverage:

```bash
# Run all tests
php artisan test

# Run only email auth tests
php artisan test tests/Unit/EmailAuth/
```

Test coverage includes:
- Property-based tests for token generation and validation
- Rate limiting enforcement tests
- Email sending verification tests
- TTL and expiration tests
- Security and hashing tests

### Usage Example

```php
use App\Services\EmailAuth\EmailAuthService;

// Inject the service
public function __construct(
    private EmailAuthService $emailAuthService
) {}

// Send OTP
$result = $this->emailAuthService->sendOTPCode('user@example.com');

// Verify OTP
$validation = $this->emailAuthService->verifyOTPCode('user@example.com', '123456');

if ($validation->valid) {
    // OTP is valid, proceed with authentication
}
```
