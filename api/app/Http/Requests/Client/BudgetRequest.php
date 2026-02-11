<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class BudgetRequest extends FormRequest
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
            'total_budget_min' => 'required|numeric|min:0',
            'total_budget_max' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($value < $this->total_budget_min) {
                        $fail('Le budget maximum doit être supérieur ou égal au budget minimum.');
                    }
                },
            ],
            'status' => 'sometimes|in:draft,active,completed,archived',
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
            'total_budget_min.required' => 'Le budget minimum est requis.',
            'total_budget_min.min' => 'Le budget minimum doit être positif.',
            'total_budget_max.required' => 'Le budget maximum est requis.',
            'total_budget_max.min' => 'Le budget maximum doit être positif.',
        ];
    }
}
