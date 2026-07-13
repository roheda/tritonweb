<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Equipo;
use Validator;
use Exception;
use Auth;
use DB;

class EquipoController extends Controller {

	/**
	 * Método que devuelve todas los registros
	 */
	public function getEquipo() {

		$equipo = Equipo::all();

		foreach ($equipo as $key) {
			$key->estatus  = intval($key->estatus);
			$key->fecha    = date('Y-m-d h:i:s', strtotime($key->fecha));
		}

		return response()->json($equipo);
	}

	/**
	 * Método que devuelve los registros activos
	 */
	public function getActiveEquipo() {
		$equipo = Equipo::where('estatus', '=', 1)->get();
		return response()->json($equipo);
	}

	/**
	 * Método que devuelve las Equipo activas (paginación)
	 */
	public function getEquipoPaginate() {
		$equipo = Equipo::where('estatus', '=', 1)->orderBy('id', 'desc')->paginate(10);
		return response()->json($equipo);
	}

	/**
	 * Método para guardar un nuevo registro
	 */
	public function newEquipo() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$input = [
				'nombre'   => $data['nombre'], 
				'puesto'   => $data['puesto'], 
				'foto'     => $data['foto'] 
			];

			$rules = [
				'nombre'   => 'required', 
				'puesto'   => 'required', 
				'foto'     => 'required' 
			];

			$messages = [
				'nombre.required'   => 'Escribe un nombre',
				'puesto.required'   => 'Escribe un puesto',
				'foto.required'     => 'Elige una fotografía',
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$equipo = new Equipo();

			$equipo->nombre      = $data['nombre'];  
			$equipo->descripcion = $data['descripcion']; 
			$equipo->puesto      = $data['puesto']; 
			$equipo->foto        = $data['foto']; 
			$equipo->estatus     = 1; 

			$equipo->save();

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
	public function updateEquipo($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$input = [
				'nombre'   => $data['nombre'], 
				'puesto'   => $data['puesto'], 
				'foto'     => $data['foto'] 
			];

			$rules = [
				'nombre'   => 'required', 
				'puesto'   => 'required', 
				'foto'     => 'required' 
			];

			$messages = [
				'nombre.required'   => 'Escribe un nombre',
				'puesto.required'   => 'Escribe un puesto',
				'foto.required'     => 'Elige una fotografía',
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$equipo = Equipo::find($id);

			$equipo->nombre      = $data['nombre'];  
			$equipo->descripcion = $data['descripcion']; 
			$equipo->puesto      = $data['puesto']; 
			$equipo->foto        = $data['foto']; 

			$equipo->save();

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
	public function deleteEquipo($id) {

		$equipo  = Equipo::find($id);

		DB::transaction(function() use($equipo) {

			if(!$equipo->delete())
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
	  	
	    $equipo = Equipo::find($id);

	    $equipo->estatus = (intval($equipo->estatus) == 1) ? 0 : 1;
    
        $equipo->save();

        return response()->json(array(
			'mensaje' => 'El estatus se actualizó correctamente',
			'estatus' => 'success'
		), 200);
    }
}
