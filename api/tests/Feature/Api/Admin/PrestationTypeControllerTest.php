<?php

namespace Tests\Feature\Api\Admin;

use App\Models\PrestationType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrestationTypeControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);

        // Create admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    /** @test */
    public function admin_can_list_prestation_types()
    {
        Sanctum::actingAs($this->admin);

        PrestationType::factory()->count(3)->create();

        $response = $this->getJson('/api/admin/prestation-types');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'description', 'icon', 'is_active', 'created_at']
                ]
            ]);
    }

    /** @test */
    public function admin_can_create_prestation_type()
    {
        Sanctum::actingAs($this->admin);

        $data = [
            'name' => 'DJ',
            'description' => 'Animation musicale',
            'icon' => 'music',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/admin/prestation-types', $data);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Type de prestation créé avec succès.',
                'data' => [
                    'name' => 'DJ',
                    'description' => 'Animation musicale',
                ]
            ]);

        $this->assertDatabaseHas('prestation_types', [
            'name' => 'DJ',
            'slug' => 'dj',
        ]);
    }

    /** @test */
    public function admin_can_show_prestation_type()
    {
        Sanctum::actingAs($this->admin);

        $prestationType = PrestationType::factory()->create();

        $response = $this->getJson("/api/admin/prestation-types/{$prestationType->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $prestationType->id,
                    'name' => $prestationType->name,
                ]
            ]);
    }

    /** @test */
    public function admin_can_update_prestation_type()
    {
        Sanctum::actingAs($this->admin);

        $prestationType = PrestationType::factory()->create(['name' => 'Old Name']);

        $data = [
            'name' => 'New Name',
            'is_active' => false,
        ];

        $response = $this->putJson("/api/admin/prestation-types/{$prestationType->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Type de prestation mis à jour avec succès.',
                'data' => [
                    'name' => 'New Name',
                    'is_active' => false,
                ]
            ]);

        $this->assertDatabaseHas('prestation_types', [
            'id' => $prestationType->id,
            'name' => 'New Name',
            'is_active' => false,
        ]);
    }

    /** @test */
    public function admin_can_delete_prestation_type()
    {
        Sanctum::actingAs($this->admin);

        $prestationType = PrestationType::factory()->create();

        $response = $this->deleteJson("/api/admin/prestation-types/{$prestationType->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Type de prestation supprimé avec succès.',
            ]);

        $this->assertDatabaseMissing('prestation_types', [
            'id' => $prestationType->id,
        ]);
    }

    /** @test */
    public function cannot_delete_prestation_type_with_providers()
    {
        Sanctum::actingAs($this->admin);

        $prestationType = PrestationType::factory()->create();
        $provider = User::factory()->create();
        $provider->assignRole('prestataire');
        $provider->prestationTypes()->attach($prestationType->id);

        $response = $this->deleteJson("/api/admin/prestation-types/{$prestationType->id}");

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Impossible de supprimer un type de prestation utilisé par des prestataires.',
            ]);

        $this->assertDatabaseHas('prestation_types', [
            'id' => $prestationType->id,
        ]);
    }

    /** @test */
    public function non_admin_cannot_access_prestation_types()
    {
        $client = User::factory()->create();
        $client->assignRole('client');
        Sanctum::actingAs($client);

        $response = $this->getJson('/api/admin/prestation-types');

        $response->assertStatus(403);
    }

    /** @test */
    public function guest_cannot_access_prestation_types()
    {
        $response = $this->getJson('/api/admin/prestation-types');

        $response->assertStatus(401);
    }

    /** @test */
    public function validation_fails_for_duplicate_name()
    {
        Sanctum::actingAs($this->admin);

        PrestationType::factory()->create(['name' => 'Photographe']);

        $data = [
            'name' => 'Photographe',
            'description' => 'Test',
        ];

        $response = $this->postJson('/api/admin/prestation-types', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function can_filter_prestation_types_by_active_status()
    {
        Sanctum::actingAs($this->admin);

        PrestationType::factory()->create(['is_active' => true]);
        PrestationType::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/admin/prestation-types?is_active=1');

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function can_search_prestation_types()
    {
        Sanctum::actingAs($this->admin);

        PrestationType::factory()->create(['name' => 'Photographe']);
        PrestationType::factory()->create(['name' => 'Traiteur']);

        $response = $this->getJson('/api/admin/prestation-types?search=Photo');

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }
}
