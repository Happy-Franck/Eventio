<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'provider',
        'provider_id',
        'is_active',
        'is_approved',
        'phone',
        'address',
        'city',
        'postal_code',
        'bio',
        'website',
        'username',
        'first_name',
        'last_name',
        'business_type',
        'company_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_approved' => 'boolean',
        ];
    }

    /**
     * Les types de prestation du prestataire
     */
    public function prestationTypes(): BelongsToMany
    {
        return $this->belongsToMany(PrestationType::class, 'user_prestation_types');
    }

    /**
     * Get the provider services (for prestataires).
     */
    public function providerServices(): HasMany
    {
        return $this->hasMany(ProviderService::class);
    }

    /**
     * Get the budgets (for clients).
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * Get the teams (for clients).
     */
    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    /**
     * Get the collections (for clients).
     */
    public function collections(): HasMany
    {
        return $this->hasMany(Collection::class);
    }

    /**
     * Get team selections where this user is the provider.
     */
    public function teamSelections(): HasMany
    {
        return $this->hasMany(TeamSelection::class, 'provider_id');
    }

    /**
     * Get collection items where this user is the provider.
     */
    public function collectionItems(): HasMany
    {
        return $this->hasMany(CollectionItem::class, 'provider_id');
    }
}
