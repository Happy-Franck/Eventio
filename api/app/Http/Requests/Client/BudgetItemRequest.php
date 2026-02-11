<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class BudgetItemRequest extends FormRequest
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
            'prestation_type_id' => 'required|exists:prestation_types,id',
            'allocated_min' => 'required|numeric|min:0',
            'allocated_max' => [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($value < $this->allocated_min) {
                        $fail('Le montant maximum doit être supérieur ou égal au montant minimum.');
                    }
                },
            ],
            'actual_cost' => 'nullable|numeric|min:0',
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
            'prestation_type_id.required' => 'Le type de prestation est requis.',
            'prestation_type_id.exists' => 'Le type de prestation sélectionné n\'existe pas.',
            'allocated_min.required' => 'Le montant minimum alloué est requis.',
            'allocated_min.min' => 'Le montant minimum doit être positif.',
            'allocated_max.required' => 'Le montant maximum alloué est requis.',
            'allocated_max.min' => 'Le montant maximum doit être positif.',
        ];
    }
}
