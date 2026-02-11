<?php

namespace App\Http\Requests\Provider;

use Illuminate\Foundation\Http\FormRequest;

class ServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('prestataire');
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
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => [
                'nullable',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($value && $this->price_min && $value < $this->price_min) {
                        $fail('Le prix maximum doit être supérieur ou égal au prix minimum.');
                    }
                },
            ],
            'description' => 'nullable|string|max:2000',
            'portfolio_images' => 'nullable|array|max:10',
            'portfolio_images.*' => 'string|max:255',
            'experience_years' => 'nullable|integer|min:0|max:50',
            'is_available' => 'boolean',
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
            'price_min.min' => 'Le prix minimum doit être positif.',
            'price_max.min' => 'Le prix maximum doit être positif.',
            'experience_years.min' => 'L\'expérience doit être positive.',
            'experience_years.max' => 'L\'expérience ne peut pas dépasser 50 ans.',
            'portfolio_images.max' => 'Vous ne pouvez pas ajouter plus de 10 images.',
        ];
    }
}
