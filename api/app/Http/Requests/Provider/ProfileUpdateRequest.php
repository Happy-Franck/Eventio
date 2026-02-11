<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // L'utilisateur doit être authentifié (vérifié par le middleware)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|string|email|max:255|unique:users,email,{$userId}",
            'username' => "sometimes|nullable|string|max:255|unique:users,username,{$userId}",
            'first_name' => 'sometimes|nullable|string|max:255',
            'last_name' => 'sometimes|nullable|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'city' => 'sometimes|nullable|string|max:255',
            'postal_code' => 'sometimes|nullable|string|max:20',
            'bio' => 'sometimes|nullable|string',
            'website' => 'sometimes|nullable|url|max:255',
            'business_type' => 'sometimes|nullable|string|in:individual,company',
            'company_name' => 'sometimes|nullable|string|max:255',
            'prestation_type_ids' => 'sometimes|array',
            'prestation_type_ids.*' => 'exists:prestation_types,id',
        ];
    }
}

