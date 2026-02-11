<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class TeamSelectionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('client');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'provider_id' => 'required|exists:users,id',
            'prestation_type_id' => 'required|exists:prestation_types,id',
            'estimated_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'provider_id.required' => 'Le prestataire est requis.',
            'provider_id.exists' => 'Le prestataire sélectionné n\'existe pas.',
            'prestation_type_id.required' => 'Le type de prestation est requis.',
            'prestation_type_id.exists' => 'Le type de prestation sélectionné n\'existe pas.',
            'estimated_price.min' => 'Le prix estimé doit être positif.',
        ];
    }
}
