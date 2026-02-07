<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer les 3 rôles (ou les récupérer s'ils existent déjà)
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'client']);
        Role::firstOrCreate(['name' => 'prestataire']);
    }
}
