<?php

namespace Tests\Unit;

use Tests\TestCase;

class LocaleConfigTest extends TestCase
{
    /**
     * Test that locale configuration loads correctly
     */
    public function test_locale_configuration_loads_correctly(): void
    {
        $config = require base_path('config/locales.php');
        
        $this->assertIsArray($config);
        $this->assertArrayHasKey('available', $config);
        $this->assertArrayHasKey('fallback', $config);
        $this->assertArrayHasKey('detection', $config);
    }

    /**
     * Test that available locales have required fields
     */
    public function test_available_locales_have_required_fields(): void
    {
        $config = require base_path('config/locales.php');
        $available = $config['available'];
        
        $this->assertNotEmpty($available);
        
        foreach ($available as $code => $locale) {
            $this->assertIsString($code);
            $this->assertArrayHasKey('name', $locale);
            $this->assertArrayHasKey('native', $locale);
            $this->assertArrayHasKey('rtl', $locale);
            $this->assertIsBool($locale['rtl']);
        }
    }

    /**
     * Test that RTL locales are properly identified
     */
    public function test_rtl_locales_are_properly_identified(): void
    {
        $config = require base_path('config/locales.php');
        $available = $config['available'];
        
        // Test that English and French are LTR
        $this->assertFalse($available['en']['rtl']);
        $this->assertFalse($available['fr']['rtl']);
        
        // If we add RTL locales in the future, they should be marked as RTL
        foreach ($available as $code => $locale) {
            if (in_array($code, ['ar', 'he', 'fa', 'ur'])) {
                $this->assertTrue($locale['rtl'], "Locale {$code} should be marked as RTL");
            }
        }
    }

    /**
     * Test that fallback locale is valid
     */
    public function test_fallback_locale_is_valid(): void
    {
        $config = require base_path('config/locales.php');
        
        $this->assertArrayHasKey($config['fallback'], $config['available']);
    }

    /**
     * Test that detection configuration is valid
     */
    public function test_detection_configuration_is_valid(): void
    {
        $config = require base_path('config/locales.php');
        $detection = $config['detection'];
        
        $this->assertArrayHasKey('enabled', $detection);
        $this->assertIsBool($detection['enabled']);
        $this->assertArrayHasKey('sources', $detection);
        $this->assertIsArray($detection['sources']);
    }

    /**
     * Test that English locale exists
     */
    public function test_english_locale_exists(): void
    {
        $config = require base_path('config/locales.php');
        
        $this->assertArrayHasKey('en', $config['available']);
        $this->assertEquals('English', $config['available']['en']['name']);
        $this->assertEquals('English', $config['available']['en']['native']);
    }

    /**
     * Test that French locale exists
     */
    public function test_french_locale_exists(): void
    {
        $config = require base_path('config/locales.php');
        
        $this->assertArrayHasKey('fr', $config['available']);
        $this->assertEquals('French', $config['available']['fr']['name']);
        $this->assertEquals('Français', $config['available']['fr']['native']);
    }
}
