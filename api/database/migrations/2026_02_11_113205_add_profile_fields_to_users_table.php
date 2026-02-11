<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('postal_code', 10)->nullable()->after('city');
            $table->text('bio')->nullable()->after('postal_code');
            $table->string('website')->nullable()->after('bio');
            
            // Index pour recherche par ville
            $table->index('city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['city']);
            $table->dropColumn([
                'phone',
                'address',
                'city',
                'postal_code',
                'bio',
                'website',
            ]);
        });
    }
};
