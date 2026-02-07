<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocaleMiddlewareTest extends TestCase
{
    protected SetLocale $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new SetLocale();
    }

    /**
     * Test that middleware sets locale from Accept-Language header
     */
    public function test_sets_locale_from_accept_language_header(): void
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('Accept-Language', 'fr');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('fr', App::getLocale());
            return response('OK');
        });
    }

    /**
     * Test that middleware defaults to fallback locale when header is missing
     */
    public function test_defaults_to_fallback_locale_when_header_missing(): void
    {
        $request = Request::create('/test', 'GET');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('en', App::getLocale());
            return response('OK');
        });
    }

    /**
     * Test that middleware handles complex Accept-Language headers
     */
    public function test_handles_complex_accept_language_header(): void
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('Accept-Language', 'en-US,en;q=0.9,fr;q=0.8');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('en', App::getLocale());
            return response('OK');
        });
    }

    /**
     * Test that middleware ignores invalid locales
     */
    public function test_ignores_invalid_locales(): void
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('Accept-Language', 'de,es');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('en', App::getLocale());
            return response('OK');
        });
    }

    /**
     * Test that middleware respects quality values
     */
    public function test_respects_quality_values(): void
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('Accept-Language', 'en;q=0.5,fr;q=0.9');

        $this->middleware->handle($request, function ($req) {
            $this->assertEquals('fr', App::getLocale());
            return response('OK');
        });
    }
}
