<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Slider;
use App\Nota;
use Validator;
use Exception;
use Auth;
use DB;

class HomeController extends Controller {

	/**
	 * Método que devuelve los slide activos
	 */
	public function getActiveSlider() {
		$slider = Slider::where('estatus', 1)->get();
		return response()->json($slider);
	}

	// /**
	//  * Método que devuelve las Documento activos
	//  */
	// public function getActiveDocumentos() {

	// 	$documents = Documento::where('estatus', '=', 1)->get();

	// 	for ($i = 0; $i < count($documents); $i++) { 
	// 		$documents[$i]['documentos'] = DocumentoRuta::where('idDocumento', $documents[$i]['id'])->get();
	// 	}

	// 	return Response::json($documents, 200);
	// }
}
