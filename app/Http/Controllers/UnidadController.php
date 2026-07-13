<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Unidad;
use Validator;
use Exception;
use Auth;
use DB;

class UnidadController extends Controller {

	/**
	 * Método que devuelve todas los registros
	 */
	public function getUnidades($idDesarrollo) {

		$unidad = Unidad::where('idDesarrollo', '=', $idDesarrollo)->get();

		foreach ($unidad as $key) {
			$key->created_at = date('Y-m-d h:i:s', strtotime($key->created_at));
		}

		return response()->json($unidad);
	}

	/**
	 * Método que devuelve los registros activos
	 */
	public function getActiveUnidades($idDesarrollo) {
		$unidad = Unidad::where('idDesarrollo', '=', $idDesarrollo)->get();
		return response()->json($unidad);
	}

	/**
	 * Método que devuelve las unidades activas (paginación)
	 */
	public function getUnidadesPaginate($idDesarrollo) {
		$unidad = Unidad::where('idDesarrollo', '=', $idDesarrollo)->orderBy('id', 'desc')->paginate(10);
		return response()->json($unidad);
	}

	/**
	 * Método que devuelve las unidades del desarrollo con la misma clave
	 */
	private function getUnidadesByKey($idDesarrollo, $clave, $id) {

		$unidades = Unidad::where('idDesarrollo', '=', $idDesarrollo)->where('clave', '=', $clave);

		if($id != 0)
			$unidades = $unidades->where('id', '!=', $id);
		
		return $unidades->get();
	}

	/**
	 * Método para guardar un nuevo registro
	 */
	public function newUnidad() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$input = [
				'idDesarrollo' => $data['idDesarrollo'],
				'clave'        => $data['clave'],
				'descripcion'  => $data['descripcion'],
				'imagen'       => $data['imagen'],
				'tipo'         => $data['tipo'],
				'estatus'      => $data['estatus'],
				'construccion' => $data['construccion'],
				'terreno'      => $data['terreno'],
				'precio'       => $data['precio'],
			];

			$rules = [
				'idDesarrollo' => 'required',
				'clave'        => 'required',
				'descripcion'  => 'required',
				'tipo'         => 'required',
				'estatus'      => 'required',
				'construccion' => 'required',
				'terreno'      => 'required',
				'precio'       => 'required',
			];

			$messages = [
				'idDesarrollo.required' => 'Selecciona un desarrollo',
				'clave.required'        => 'Escribe una clave',
				'descripcion.required'  => 'Escribe una descripción',
				'construccion.required' => 'Escribe el tamaño de construcción',
				'terreno.required'      => 'Escribe el tamaño de terreno',
				'tipo.required'         => 'Escribe un tipo',
				'estatus.required'      => 'Selecciona un estatus',
				'precio.required'       => 'Escribe un precio',
			];

			$validator = Validator::make($input, $rules, $messages);

			$validator->after(function($validator) use ($data) {

				if(count($this->getUnidadesByKey($data['idDesarrollo'], $data['clave'], 0)) > 0)
					$validator->errors()->add('clave', 'La clave no se puede repetir.');
			});

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$unidad = new Unidad();

			$unidad->idDesarrollo = $data['idDesarrollo'];
			$unidad->clave        = $data['clave'];
			$unidad->descripcion  = $data['descripcion'];
			$unidad->imagen       = $data['imagen'];
			$unidad->brochure     = $data['brochure'];
			$unidad->tipo         = $data['tipo'];
			$unidad->estatus      = $data['estatus'];
			$unidad->largo        = $data['largo'];
			$unidad->ancho        = $data['ancho'];
			$unidad->construccion = $data['construccion'];
			$unidad->terreno      = $data['terreno'];
			$unidad->equipamiento = $data['equipamiento'];
			$unidad->precio       = $data['precio'];
			$unidad->precio24     = $data['precio24'];
			$unidad->precio48     = $data['precio48'];
			$unidad->precio60     = $data['precio60'];
			$unidad->precio72     = $data['precio72'];

			$unidad->save();

			$response["mensaje"] = 'El registro se ha agregado correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	} 

	/**
	 * Método para acualizar registro
	 */
	public function updateUnidad($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$input = [
				'clave'        => $data['clave'],
				'descripcion'  => $data['descripcion'],
				'tipo'         => $data['tipo'],
				'estatus'      => $data['estatus'],
				'construccion' => $data['construccion'],
				'terreno'      => $data['terreno'],
				'precio'       => $data['precio'],
			];

			$rules = [
				'clave'        => 'required',
				'descripcion'  => 'required',
				'tipo'         => 'required',
				'estatus'      => 'required',
				'construccion' => 'required',
				'terreno'      => 'required',
				'precio'       => 'required',
			];

			$messages = [
				'clave.required'        => 'Escribe una clave',
				'descripcion.required'  => 'Escribe una descripción',
				'construccion.required' => 'Escribe el tamaño de construcción',
				'terreno.required'      => 'Escribe el tamaño de terreno',
				'tipo.required'         => 'Escribe un tipo',
				'estatus.required'      => 'Selecciona un estatus',
				'precio.required'       => 'Escribe un precio',
			];

			$validator = Validator::make($input, $rules, $messages);

			$validator->after(function($validator) use ($data, $id) {

				if(count($this->getUnidadesByKey($data['idDesarrollo'], $data['clave'], $id)) > 0)
					$validator->errors()->add('clave', 'La clave no se puede repetir.');
			});

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$unidad = Unidad::find($id);

			$unidad->clave        = $data['clave'];
			$unidad->descripcion  = $data['descripcion'];
			$unidad->imagen       = $data['imagen'];
			$unidad->brochure     = $data['brochure'];
			$unidad->tipo         = $data['tipo'];
			$unidad->estatus      = $data['estatus'];
			$unidad->largo        = $data['largo'];
			$unidad->ancho        = $data['ancho'];
			$unidad->construccion = $data['construccion'];
			$unidad->terreno      = $data['terreno'];
			$unidad->equipamiento = $data['equipamiento'];
			$unidad->precio       = $data['precio'];
			$unidad->precio24     = $data['precio24'];
			$unidad->precio48     = $data['precio48'];
			$unidad->precio60     = $data['precio60'];
			$unidad->precio72     = $data['precio72'];

			$unidad->save();

			$response["mensaje"] = 'El registro se actualizó correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	}

	/**
	 * Método para eliminar un registro
	 */
	public function deleteUnidad($id) {

		$unidad  = Unidad::find($id);

		DB::transaction(function() use($unidad) {

			if(!$unidad->delete())
				throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

		return response()->json(array(
			'message' => 'Registro eliminado',
			'status'  => 'success'
		), 200);
	}

	/**
	 * Método que sirve para cambiar el estatus de un registro
	 */
	public function directorioEstatus($id) {
	  	
	    $unidad = Unidad::find($id);

	    $unidad->estatus = (intval($unidad->estatus) == 1) ? 0 : 1;
    
        $unidad->save();

        return response()->json(array(
			'mensaje' => 'El estatus se actualizó correctamente',
			'estatus' => 'success'
		), 200);
    }
}
