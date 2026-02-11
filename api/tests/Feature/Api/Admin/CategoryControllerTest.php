<?php

namespace Tests\Feature\Api\Admin;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    /** @test */
    public function admin_can_list_categories()
    {
        Sanctum::actingAs($this->admin);

        Category::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'description', 'is_active', 'order']
                ]
            ]);
    }

    /** @test */
    public function admin_can_create_category()
    {
        Sanctum::actingAs($this->admin);

        $data = [
            'name' => 'Baptême',
            'slug' => 'bapteme',
            'description' => 'Événements de baptême',
            'is_active' => true,
            'order' => 7,
        ];

        $response = $this->postJson('/api/admin/categories', $data);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Catégorie créée avec succès.',
                'data' => [
                    'name' => 'Baptême',
                    'slug' => 'bapteme',
                ]
            ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Baptême',
            'slug' => 'bapteme',
        ]);
    }

    /** @test */
    public function slug_is_auto_generated_from_name()
    {
        Sanctum::actingAs($this->admin);

        $data = [
            'name' => 'Événement Corporate',
            'description' => 'Test',
        ];

        $response = $this->postJson('/api/admin/categories', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('categories', [
            'name' => 'Événement Corporate',
            'slug' => 'evenement-corporate',
        ]);
    }

    /** @test */
    public function admin_can_create_subcategory()
    {
        Sanctum::actingAs($this->admin);

        $parent = Category::factory()->create();

        $data = [
            'name' => 'Sous-catégorie',
            'parent_id' => $parent->id,
        ];

        $response = $this->postJson('/api/admin/categories', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('categories', [
            'name' => 'Sous-catégorie',
            'parent_id' => $parent->id,
        ]);
    }

    /** @test */
    public function admin_can_show_category()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::factory()->create();

        $response = $this->getJson("/api/admin/categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $category->id,
                    'name' => $category->name,
                ]
            ]);
    }

    /** @test */
    public function admin_can_update_category()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::factory()->create(['name' => 'Old Name']);

        $data = [
            'name' => 'New Name',
            'slug' => 'new-name',
            'is_active' => false,
        ];

        $response = $this->putJson("/api/admin/categories/{$category->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Catégorie mise à jour avec succès.',
            ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'New Name',
            'slug' => 'new-name',
        ]);
    }

    /** @test */
    public function admin_can_delete_category()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::factory()->create();

        $response = $this->deleteJson("/api/admin/categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Catégorie supprimée avec succès.',
            ]);

        $this->assertSoftDeleted('categories', [
            'id' => $category->id,
        ]);
    }

    /** @test */
    public function cannot_delete_category_with_children()
    {
        Sanctum::actingAs($this->admin);

        $parent = Category::factory()->create();
        Category::factory()->create(['parent_id' => $parent->id]);

        $response = $this->deleteJson("/api/admin/categories/{$parent->id}");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Impossible de supprimer une catégorie qui a des sous-catégories.',
            ]);
    }

    /** @test */
    public function admin_can_get_category_tree()
    {
        Sanctum::actingAs($this->admin);

        $parent = Category::factory()->create(['parent_id' => null]);
        Category::factory()->create(['parent_id' => $parent->id]);

        $response = $this->getJson('/api/admin/categories/tree');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'children'
                    ]
                ]
            ]);
    }

    /** @test */
    public function can_filter_categories_by_parent()
    {
        Sanctum::actingAs($this->admin);

        $parent = Category::factory()->create();
        Category::factory()->create(['parent_id' => $parent->id]);
        Category::factory()->create(['parent_id' => null]);

        $response = $this->getJson("/api/admin/categories?parent_id={$parent->id}");

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function can_search_categories()
    {
        Sanctum::actingAs($this->admin);

        Category::factory()->create(['name' => 'Mariage']);
        Category::factory()->create(['name' => 'Anniversaire']);

        $response = $this->getJson('/api/admin/categories?search=Mari');

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function validation_fails_for_duplicate_slug()
    {
        Sanctum::actingAs($this->admin);

        Category::factory()->create(['slug' => 'mariage']);

        $data = [
            'name' => 'Mariage 2',
            'slug' => 'mariage',
        ];

        $response = $this->postJson('/api/admin/categories', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    /** @test */
    public function non_admin_cannot_access_categories()
    {
        $client = User::factory()->create();
        $client->assignRole('client');
        Sanctum::actingAs($client);

        $response = $this->getJson('/api/admin/categories');

        $response->assertStatus(403);
    }
}
