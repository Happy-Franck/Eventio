<?php

namespace Tests\Feature\Api\Admin;

use App\Models\PrestationType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProviderControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PrestationTypeSeeder']);

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    /** @test */
    public function admin_can_list_providers()
    {
        Sanctum::actingAs($this->admin);

        $provider1 = User::factory()->create();
        $provider1->assignRole('prestataire');

        $provider2 = User::factory()->create();
        $provider2->assignRole('prestataire');

        $response = $this->getJson('/api/admin/providers');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'roles']
                ]
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function admin_can_show_provider()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create();
        $provider->assignRole('prestataire');

        $response = $this->getJson("/api/admin/providers/{$provider->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $provider->id,
                    'name' => $provider->name,
                    'email' => $provider->email,
                ]
            ]);
    }

    /** @test */
    public function admin_can_update_provider()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create(['name' => 'Old Name']);
        $provider->assignRole('prestataire');

        $prestationType = PrestationType::first();

        $data = [
            'name' => 'New Name',
            'prestation_type_ids' => [$prestationType->id],
        ];

        $response = $this->putJson("/api/admin/providers/{$provider->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prestataire mis à jour avec succès.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $provider->id,
            'name' => 'New Name',
        ]);

        $this->assertDatabaseHas('user_prestation_types', [
            'user_id' => $provider->id,
            'prestation_type_id' => $prestationType->id,
        ]);
    }

    /** @test */
    public function admin_can_delete_provider()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create();
        $provider->assignRole('prestataire');

        $response = $this->deleteJson("/api/admin/providers/{$provider->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prestataire supprimé avec succès.',
            ]);

        $this->assertDatabaseMissing('users', [
            'id' => $provider->id,
        ]);
    }

    /** @test */
    public function admin_can_approve_provider()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create();
        $provider->assignRole('prestataire');

        $response = $this->postJson("/api/admin/providers/{$provider->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prestataire approuvé avec succès.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $provider->id,
            'is_approved' => true,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function admin_can_reject_provider()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create();
        $provider->assignRole('prestataire');

        $response = $this->postJson("/api/admin/providers/{$provider->id}/reject");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Prestataire rejeté avec succès.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $provider->id,
            'is_approved' => false,
            'is_active' => false,
        ]);
    }

    /** @test */
    public function admin_can_get_provider_services()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create();
        $provider->assignRole('prestataire');

        $response = $this->getJson("/api/admin/providers/{$provider->id}/services");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data'
            ]);
    }

    /** @test */
    public function can_filter_providers_by_prestation_type()
    {
        Sanctum::actingAs($this->admin);

        $prestationType = PrestationType::first();

        $provider1 = User::factory()->create();
        $provider1->assignRole('prestataire');
        $provider1->prestationTypes()->attach($prestationType->id);

        $provider2 = User::factory()->create();
        $provider2->assignRole('prestataire');

        $response = $this->getJson("/api/admin/providers?prestation_type_id={$prestationType->id}");

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function cannot_show_non_provider_user_as_provider()
    {
        Sanctum::actingAs($this->admin);

        $client = User::factory()->create();
        $client->assignRole('client');

        $response = $this->getJson("/api/admin/providers/{$client->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function non_admin_cannot_access_providers()
    {
        $client = User::factory()->create();
        $client->assignRole('client');
        Sanctum::actingAs($client);

        $response = $this->getJson('/api/admin/providers');

        $response->assertStatus(403);
    }
}
