<?php

namespace Database\Factories;

use App\Models\PrestationType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PrestationType>
 */
class PrestationTypeFactory extends Factory
{
    protected $model = PrestationType::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->randomElement([
            'Photographe',
            'Vidéaste',
            'Traiteur',
            'DJ',
            'Décorateur',
            'Fleuriste',
            'Pâtissier',
            'Animateur',
            'Musicien',
            'Magicien',
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'icon' => fake()->randomElement(['camera', 'video', 'utensils', 'music', 'palette', 'flower', 'cake']),
            'is_active' => fake()->boolean(90), // 90% active
        ];
    }

    /**
     * Indicate that the prestation type is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the prestation type is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
