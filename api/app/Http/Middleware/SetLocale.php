<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->detectLocale($request);
        
        // Set the application locale
        App::setLocale($locale);
        
        return $next($request);
    }

    /**
     * Detect the locale from the request
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    protected function detectLocale(Request $request): string
    {
        // Get available locales from config
        $availableLocales = array_keys(config('locales.available', ['en' => []]));
        $fallbackLocale = config('locales.fallback', 'en');

        // Try to get locale from Accept-Language header
        $acceptLanguage = $request->header('Accept-Language');
        
        if ($acceptLanguage) {
            $locale = $this->parseAcceptLanguageHeader($acceptLanguage, $availableLocales);
            if ($locale) {
                return $locale;
            }
        }

        // Try to get from query parameter (optional)
        if ($request->has('locale')) {
            $queryLocale = $request->query('locale');
            if (in_array($queryLocale, $availableLocales)) {
                return $queryLocale;
            }
        }

        // Try to get from cookie (optional)
        if ($request->hasCookie('locale')) {
            $cookieLocale = $request->cookie('locale');
            if (in_array($cookieLocale, $availableLocales)) {
                return $cookieLocale;
            }
        }

        // Default to fallback locale
        return $fallbackLocale;
    }

    /**
     * Parse Accept-Language header and return the best matching locale
     *
     * @param  string  $acceptLanguage
     * @param  array  $availableLocales
     * @return string|null
     */
    protected function parseAcceptLanguageHeader(string $acceptLanguage, array $availableLocales): ?string
    {
        // Parse the Accept-Language header
        // Format: "en-US,en;q=0.9,fr;q=0.8"
        $languages = [];
        
        foreach (explode(',', $acceptLanguage) as $lang) {
            $parts = explode(';', trim($lang));
            $code = strtolower(trim($parts[0]));
            
            // Extract language code (remove region if present)
            if (strpos($code, '-') !== false) {
                $code = explode('-', $code)[0];
            }
            
            // Extract quality value (default to 1.0)
            $quality = 1.0;
            if (isset($parts[1]) && strpos($parts[1], 'q=') === 0) {
                $quality = (float) substr($parts[1], 2);
            }
            
            $languages[$code] = $quality;
        }
        
        // Sort by quality (highest first)
        arsort($languages);
        
        // Find the first matching available locale
        foreach (array_keys($languages) as $lang) {
            if (in_array($lang, $availableLocales)) {
                return $lang;
            }
        }
        
        return null;
    }
}
