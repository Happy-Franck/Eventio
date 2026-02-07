<?php

namespace Database\Seeders;

use App\Models\PrestationType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PrestationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prestationTypes = [
            [
                'name' => 'Photographe',
                'slug' => 'photographe',
                'description' => 'Services de photographie professionnelle pour événements',
            ],
            [
                'name' => 'Traiteur',
                'slug' => 'traiteur',
                'description' => 'Services de restauration et traiteur pour événements',
            ],
            [
                'name' => 'Décoratrice',
                'slug' => 'decoratrice',
                'description' => 'Services de décoration et aménagement d\'événements',
            ],
            [
                'name' => 'DJ',
                'slug' => 'dj',
                'description' => 'Services d\'animation musicale et DJ',
            ],
            [
                'name' => 'Vidéaste',
                'slug' => 'videaste',
                'description' => 'Services de vidéographie et montage vidéo',
            ],
            [
                'name' => 'Fleuriste',
                'slug' => 'fleuriste',
                'description' => 'Services de composition florale pour événements',
            ],
            [
                'name' => 'Animateur',
                'slug' => 'animateur',
                'description' => 'Services d\'animation et divertissement',
            ],
            [
                'name' => 'Location de matériel',
                'slug' => 'location-materiel',
                'description' => 'Location de matériel pour événements (tables, chaises, tentes, etc.)',
            ],
        ];

        foreach ($prestationTypes as $type) {
            PrestationType::create($type);
        }
    }
}
