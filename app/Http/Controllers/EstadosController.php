<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str as Str;
use Illuminate\Http\Request;
use App\Estado;
use Validator;
use Exception;
use Auth;
use DB;

class EstadosController extends Controller {

	/**
	 * Método que devuelve todos los estados
	 */
	public function getEstados() {
		$estados = Estado::all();
		return response()->json($estados);
	}

	/**
	 * Método que devuelve un estado por id
	 */
	public function getEstadoById($id) {
		$estados = Estado::find($id);
		return response()->json($estados);
	}
}