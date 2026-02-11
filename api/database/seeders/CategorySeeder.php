<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Mariage',
                'slug' => 'mariage',
                'description' => 'Tout pour organiser votre mariage de rêve',
                'is_active' => true,
                'order' => 1,
                'children' => [
                    [
                        'name' => 'Cérémonie',
                        'slug' => 'mariage-ceremonie',
                        'description' => 'Services pour la cérémonie de mariage',
                        'is_active' => true,
                        'order' => 1,
                    ],
                    [
                        'name' => 'Réception',
                        'slug' => 'mariage-reception',
                        'description' => 'Services pour la réception de mariage',
                        'is_active' => true,
                        'order' => 2,
                    ],
                ],
            ],
            [
                'name' => 'Anniversaire',
                'slug' => 'anniversaire',
                'description' => 'Organisez des anniversaires mémorables',
                'is_active' => true,
                'order' => 2,
                'children' => [
                    [
                        'name' => 'Enfants',
                        'slug' => 'anniversaire-enfants',
                        'description' => 'Anniversaires pour enfants',
                        'is_active' => true,
                        'order' => 1,
                    ],
                    [
                        'name' => 'Adultes',
                        'slug' => 'anniversaire-adultes',
                        'description' => 'Anniversaires pour adultes',
                        'is_active' => true,
                        'order' => 2,
                    ],
                ],
            ],
            [
                'name' => 'Événement Corporate',
                'slug' => 'evenement-corporate',
                'description' => 'Événements professionnels et d\'entreprise',
                'is_active' => true,
                'order' => 3,
                'children' => [
                    [
                        'name' => 'Séminaire',
                        'slug' => 'corporate-seminaire',
                        'description' => 'Organisation de séminaires',
                        'is_active' => true,
                        'order' => 1,
                    ],
                    [
                        'name' => 'Team Building',
                        'slug' => 'corporate-team-building',
                        'description' => 'Activités de team building',
                        'is_active' => true,
                        'order' => 2,
                    ],
                    [
                        'name' => 'Lancement de Produit',
                        'slug' => 'corporate-lancement-produit',
                        'description' => 'Événements de lancement de produit',
                        'is_active' => true,
                        'order' => 3,
                    ],
                ],
            ],
            [
                'name' => 'Conférence',
                'slug' => 'conference',
                'description' => 'Organisation de conférences et forums',
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'Festival',
                'slug' => 'festival',
                'description' => 'Festivals et événements culturels',
                'is_active' => true,
                'order' => 5,
            ],
            [
                'name' => 'Soirée Privée',
                'slug' => 'soiree-privee',
                'description' => 'Soirées et réceptions privées',
                'is_active' => true,
                'order' => 6,
            ],
        ];

        foreach ($categories as $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::create($categoryData);

            // Créer les sous-catégories
            foreach ($children as $childData) {
                $childData['parent_id'] = $category->id;
                Category::create($childData);
            }
        }
    }
}
