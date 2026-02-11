<?php

namespace Tests\Feature\Api\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClientControllerTest extends TestCase
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
    public function admin_can_list_clients()
    {
        Sanctum::actingAs($this->admin);

        $client1 = User::factory()->create();
        $client1->assignRole('client');

        $client2 = User::factory()->create();
        $client2->assignRole('client');

        $response = $this->getJson('/api/admin/clients');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'roles']
                ]
            ]);

        $this->assertCount(2, $response->json('data'));
    }

    /** @test */
    public function admin_can_show_client()
    {
        Sanctum::actingAs($this->admin);

        $client = User::factory()->create();
        $client->assignRole('client');

        $response = $this->getJson("/api/admin/clients/{$client->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $client->id,
                    'name' => $client->name,
                    'email' => $client->email,
                ]
            ]);
    }

    /** @test */
    public function admin_can_update_client()
    {
        Sanctum::actingAs($this->admin);

        $client = User::factory()->create(['name' => 'Old Name']);
        $client->assignRole('client');

        $data = [
            'name' => 'New Name',
            'email' => 'newemail@example.com',
        ];

        $response = $this->putJson("/api/admin/clients/{$client->id}", $data);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Client mis à jour avec succès.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'name' => 'New Name',
            'email' => 'newemail@example.com',
        ]);
    }

    /** @test */
    public function admin_can_delete_client()
    {
        Sanctum::actingAs($this->admin);

        $client = User::factory()->create();
        $client->assignRole('client');

        $response = $this->deleteJson("/api/admin/clients/{$client->id}");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Client supprimé avec succès.',
            ]);

        $this->assertDatabaseMissing('users', [
            'id' => $client->id,
        ]);
    }

    /** @test */
    public function admin_can_suspend_client()
    {
        Sanctum::actingAs($this->admin);

        $client = User::factory()->create();
        $client->assignRole('client');

        $response = $this->postJson("/api/admin/clients/{$client->id}/suspend");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Client suspendu avec succès.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'is_active' => false,
        ]);
    }

    /** @test */
    public function admin_can_activate_client()
    {
        Sanctum::actingAs($this->admin);

        $client = User::factory()->create(['is_active' => false]);
        $client->assignRole('client');

        $response = $this->postJson("/api/admin/clients/{$client->id}/activate");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Client activé avec succès.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $client->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function cannot_show_non_client_user_as_client()
    {
        Sanctum::actingAs($this->admin);

        $provider = User::factory()->create();
        $provider->assignRole('prestataire');

        $response = $this->getJson("/api/admin/clients/{$provider->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function can_search_clients()
    {
        Sanctum::actingAs($this->admin);

        $client1 = User::factory()->create(['name' => 'John Doe']);
        $client1->assignRole('client');

        $client2 = User::factory()->create(['name' => 'Jane Smith']);
        $client2->assignRole('client');

        $response = $this->getJson('/api/admin/clients?search=John');

        $response->assertStatus(200);
        $this->assertEquals(1, count($response->json('data')));
    }

    /** @test */
    public function non_admin_cannot_access_clients()
    {
        $client = User::factory()->create();
        $client->assignRole('client');
        Sanctum::actingAs($client);

        $response = $this->getJson('/api/admin/clients');

        $response->assertStatus(403);
    }
}
