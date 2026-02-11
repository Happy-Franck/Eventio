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
            // Champs communs
            $table->string('username')->nullable()->unique()->after('name'); // Nom d'utilisateur (affiché sur la plateforme)
            $table->string('first_name')->nullable()->after('username'); // Prénom
            $table->string('last_name')->nullable()->after('first_name'); // Nom de famille
            
            // Champs pour prestataires
            $table->enum('business_type', ['individual', 'company'])->nullable()->after('website'); // Type d'activité
            $table->string('company_name')->nullable()->after('business_type'); // Nom de l'entreprise
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username',
                'first_name',
                'last_name',
                'business_type',
                'company_name',
            ]);
        });
    }
};
