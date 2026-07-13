<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str as Str;
use Illuminate\Http\Request;
use App\Nota;
use Validator;
use Exception;
use Auth;
use DB;

class NotasController extends Controller {

	/**
	 * Método que devuelve todas las Notas
	 */
	public function getNotas() {

		$notas = Nota::orderBy('id', 'desc')->get();

		foreach ($notas as $key) {
			$key->fecha   = date('Y-m-d h:i:s', strtotime($key->fecha));
			$key->estatus = intval($key->estatus);
		}

		return response()->json($notas);
	}

	/**
	 * Método que devuelve las Notas activos
	 */
	public function getActiveNotas($categoria) {

		$notas = Nota::where('estatus', 1);

		if($categoria != "Inicio") {
			$notas = $notas->where('categoria', $categoria);
		}

		$notas = $notas->orderBy('id', 'desc')->get();

		foreach ($notas as $key) {
			$key->fecha = date('Y-m-d', strtotime($key->fecha));
		}

		return response()->json($notas);
	}

	/**
	 * Método que devuelve las Notas activos
	 */
	public function getNotasPaginate($categoria) {

		$notas = Nota::where('estatus', 1);

		if($categoria != "Inicio") {
			$notas = $notas->where('categoria', $categoria);
		}
		
		$notas = $notas->orderBy('id', 'desc')->paginate(10);

		foreach ($notas as $key) {
			$key->fecha = date('Y-m-d', strtotime($key->fecha));
		}

		return response()->json($notas);
	}

	/**
	 * Método que devuelve las Notas activos
	 */
	public function getNotaDetail($slug) {

		$nota = Nota::where('slug', $slug)->where('estatus', 1)->first();
		$nota->fecha = date('Y-m-d', strtotime($nota->fecha));		
		
		return response()->json($nota);
	}

	/**
	 * Método para guardar una nueva Nota
	 */
	public function newNota() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$data['slug'] = Str::slug($data['titulo']);

			$input = [
				'titulo'      => $data['titulo'],
				'descripcion' => $data['descripcion'],
				'slug'        => $data['slug']
			];

			$rules = [
				'titulo'      => 'required',
				'descripcion' => 'required',
				'slug'        => 'unique:notas,slug'
			];

			$messages = [
				'titulo.required'      => 'Escribe un titulo.',
				'descripcion.required' => 'Escribe el cuerpo de la nota.',
				'slug.unique'          => 'El título ya fue utilizado'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());			

			DB::transaction(function() use($data) {
				
				$nota = Nota::create($data);

				if(!$nota)
					throw new Exception(Lang::get('messages.exception_saving_model'));
			});

			$response["mensaje"] = 'El registro se ha agregado correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	} 

	/**
	 * Método para acualizar una Nota
	 */
	public function updateNota($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {

			$data = request()->all();

			$data['slug'] = Str::slug($data['titulo']);

			$input = [
				'titulo'      => $data['titulo'],
				'descripcion' => $data['descripcion'],
				'categoria'   => $data['categoria'],
				'slug'        => $data['slug']
			];

			$rules = [
				'titulo'      => 'required',
				'descripcion' => 'required',
				'categoria'   => 'required',
				'slug'        => 'unique:notas,slug,' . $id,
			];

			$messages = [
				'titulo.required'      => 'Escribe un titulo.',
				'descripcion.required' => 'Escribe el cuerpo de la nota.',
				'categoria.required'   => 'Selecciona una categoría',
				'slug.unique'          => 'El título ya fue utilizado.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$nota = Nota::findOrFail($id);

			DB::transaction(function() use ($nota, $data) {
					
				if(!$nota->update($data))
					throw new Exception(Lang::get('messages.exception_saving_model'));			
			});

			$response["mensaje"] = 'El registro se actualizó correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	}

	/**
	 * Método para eliminar un Nota
	 */
	public function deleteNota($id) {

		$nota  = Nota::findOrFail($id);
		$photo = $nota->photo;

		DB::transaction(function() use($nota) {

			if(!$nota->delete())
				throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

		if(file_exists($photo))
			unlink($photo);

		return response()->json(array(
			'message' => 'Registro eliminado',
			'status'  => 'success'
		), 200);
	}

	/**
	 * Método que sirve para cambiar el estatus de un Nota
	 */
	public function NotaEstatus($id) {
	  	
	    $nota = Nota::find($id);

	    if($nota->estatus == 1)
            $nota->estatus = 0;

        else
            $nota->estatus = 1;
    
        $nota->save();

        return response()->json(array(
			'mensaje' => 'El estatus se actualizó correctamente',
			'estatus' => 'success'
		), 200);
    }
}
