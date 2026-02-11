<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $categoryId = $this->route('category');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
            'description' => 'nullable|string|max:1000',
            'parent_id' => [
                'nullable',
                'exists:categories,id',
                function ($attribute, $value, $fail) use ($categoryId) {
                    // Empêcher qu'une catégorie soit son propre parent
                    if ($categoryId && $value == $categoryId) {
                        $fail('Une catégorie ne peut pas être son propre parent.');
                    }
                },
            ],
            'is_active' => 'boolean',
            'order' => 'integer|min:0',
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
            'name.required' => 'Le nom de la catégorie est requis.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'slug.required' => 'Le slug est requis.',
            'slug.unique' => 'Ce slug existe déjà.',
            'slug.regex' => 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets.',
            'parent_id.exists' => 'La catégorie parente n\'existe pas.',
            'order.min' => 'L\'ordre doit être un nombre positif.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-générer le slug si non fourni
        if (!$this->has('slug') && $this->has('name')) {
            $this->merge([
                'slug' => \Illuminate\Support\Str::slug($this->name),
            ]);
        }
    }
}
