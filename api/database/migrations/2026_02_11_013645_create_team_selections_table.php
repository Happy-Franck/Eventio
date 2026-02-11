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
        Schema::create('team_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->onDelete('cascade');
            $table->foreignId('provider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('prestation_type_id')->constrained()->onDelete('cascade');
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes pour optimiser les requêtes
            $table->index('team_id');
            $table->index('provider_id');
            $table->index('prestation_type_id');
            $table->unique(['team_id', 'provider_id', 'prestation_type_id'], 'team_selections_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_selections');
    }
};
