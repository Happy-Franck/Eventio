<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Créer les rôles et permissions
        $this->call(RoleSeeder::class);

        // User::factory(10)->create();

        // Créer un utilisateur admin
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');

        // Créer un utilisateur client
        $client = User::factory()->create([
            'name' => 'Client User',
            'email' => 'client@example.com',
        ]);
        $client->assignRole('client');

        // Créer un utilisateur prestataire
        $prestataire = User::factory()->create([
            'name' => 'Prestataire User',
            'email' => 'prestataire@example.com',
        ]);
        $prestataire->assignRole('prestataire');
    }
}
