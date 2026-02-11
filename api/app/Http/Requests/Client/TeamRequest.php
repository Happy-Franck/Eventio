<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class TeamRequest extends FormRequest
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
            'event_name' => 'required|string|max:255',
            'event_date' => 'nullable|date|after:today',
            'event_location' => 'nullable|string|max:255',
            'expected_guests' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:draft,active,confirmed,completed,cancelled',
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
            'event_name.required' => 'Le nom de l\'événement est requis.',
            'event_date.after' => 'La date de l\'événement doit être dans le futur.',
            'expected_guests.min' => 'Le nombre d\'invités doit être au moins 1.',
        ];
    }
}
