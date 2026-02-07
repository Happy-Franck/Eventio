<?php

namespace App\Http\Controllers;

use App\Models\PrestationType;
use Illuminate\Http\Request;

class PrestationTypeController extends Controller
{
    /**
     * Liste tous les types de prestation disponibles
     */
    public function index()
    {
        $prestationTypes = PrestationType::all();

        return response()->json($prestationTypes);
    }

    /**
     * Affiche un type de prestation spécifique
     */
    public function show($id)
    {
        $prestationType = PrestationType::findOrFail($id);

        return response()->json($prestationType);
    }
}
