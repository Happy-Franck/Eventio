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
        // Créer les rôles
        $this->call(RoleSeeder::class);

        // Créer les types de prestation
        $this->call(PrestationTypeSeeder::class);

        // Créer les catégories
        $this->call(CategorySeeder::class);

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

        // Créer des utilisateurs prestataires avec différents types
        $prestataire1 = User::factory()->create([
            'name' => 'Photographe Pro',
            'email' => 'photographe@example.com',
        ]);
        $prestataire1->assignRole('prestataire');
        $prestataire1->prestationTypes()->attach([1]); // Photographe

        $prestataire2 = User::factory()->create([
            'name' => 'Traiteur Deluxe',
            'email' => 'traiteur@example.com',
        ]);
        $prestataire2->assignRole('prestataire');
        $prestataire2->prestationTypes()->attach([2]); // Traiteur

        $prestataire3 = User::factory()->create([
            'name' => 'Multi Services',
            'email' => 'multi@example.com',
        ]);
        $prestataire3->assignRole('prestataire');
        $prestataire3->prestationTypes()->attach([1, 5]); // Photographe + Vidéaste
    }
}
