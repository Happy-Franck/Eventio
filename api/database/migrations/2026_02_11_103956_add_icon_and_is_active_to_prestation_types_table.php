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
        Schema::table('prestation_types', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('description');
            $table->boolean('is_active')->default(true)->after('icon');
            
            // Index pour optimiser les requêtes
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prestation_types', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropColumn(['icon', 'is_active']);
        });
    }
};
