<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str as Str;
use Illuminate\Http\Request;
use App\GaleriaImagen;
use App\Galeria;
use Validator;
use Exception;
use Auth;
use DB;

class GaleriasController extends Controller {

	/**
	 * Método que devuelve la galeria del desarrollo
	 */
	public function getGaleria($idDesarrollo) {

		$galeria = Galeria::where('idDesarrollo', '=', $idDesarrollo)->first();

		if($galeria != null) {

			$galeria->imagenes = DB::table('galerias_imagenes')->where('idGaleria', $galeria->id)->get();
			$galeria->cantidad = count($galeria->imagenes);
			$galeria->estatus  = intval($galeria->estatus);
			$galeria->fecha    = date('Y-m-d h:i:s', strtotime($galeria->fecha));
		}

		return response()->json($galeria);
	}

	/**
	 * Método que devuelve las Galerias activas (10 galerias)
	 */
	public function getActiveGalerias() {

		$galerias = Galeria::where('estatus', '=', 1)->orderBy('id', 'desc')->take(10)->get();

		foreach ($galerias as $key) {

			$key->imagenes = DB::table('galerias_imagenes')->where('idGaleria', $key->id)->get();
			$key->fecha    = date('Y-m-d', strtotime($key->fecha));
		}

		return response()->json($galerias);
	}

	/**
	 * Método para guardar una nueva Galeria
	 */
	public function newGaleria() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$data['slug'] = Str::slug($data['titulo']);

			$input = [
				'titulo'       => $data['titulo'],
				'idDesarrollo' => $data['idDesarrollo'],
				'slug'         => $data['slug']
			];

			$rules = [
				'titulo'       => 'required',
				'idDesarrollo' => 'unique:galerias,idDesarrollo',
				'slug'         => 'unique:galerias,slug'
			];

			$messages = [
				'titulo.required'     => 'Escribe un titulo.',
				'idDesarrollo.unique' => 'El desarrollo ya cuenta con una galería.',
				'slug.unique'         => 'El título ya fue utilizado.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$galeria = new Galeria();

			$galeria->titulo       = $data['titulo'];  
			$galeria->idDesarrollo = $data['idDesarrollo'];  
			$galeria->slug         = $data['slug']; 
			$galeria->fecha        = $data['fecha']; 
			$galeria->estatus      = 1; 

			$galeria->save();

			$id = $galeria->id;

			foreach ($data['imagenes'] as $key) {

				$imagen = new GaleriaImagen();

				$imagen->descripcion = $key['descripcion'];
				$imagen->ruta        = $key['ruta'];

				$imagen->idGaleria = $id;

				$imagen->save();
			}

			$response["mensaje"] = 'El registro se ha agregado correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	} 

	/**
	 * Método para acualizar Galeria
	 */
	public function updateGaleria($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data  = request()->all();

			$data['slug'] = Str::slug($data['titulo']);

			$input = [
				'titulo' => $data['titulo'],
				'slug'   => $data['slug']
			];

			$rules = [
				'titulo' => 'required',
				'slug'   => 'unique:galerias,slug,' . $id
			];

			$messages = [
				'titulo.required' => 'Escribe un titulo.',
				'slug.unique'     => 'El título ya fue utilizado.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$galeria = Galeria::find($id);

			$galeria->titulo = $data['titulo']; 
			$galeria->slug   = $data['slug']; 

			$galeria->save();

			DB::table('galerias_imagenes')->where('idGaleria', $id)->delete();

			foreach ($data['imagenes'] as $key) {

				$imagen = new GaleriaImagen();

				$imagen->descripcion = $key['descripcion'];
				$imagen->ruta        = $key['ruta'];

				$imagen->idGaleria = $id;
				
				$imagen->save();
			}

			$response["mensaje"] = 'El registro se actualizó correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	}

	/**
	 * Método para eliminar un Galeria
	 */
	public function deleteGaleria($id) {

		$galeria  = Galeria::find($id);
		$imagenes = DB::table('galerias_imagenes')->where('idGaleria', $id);

		foreach ($imagenes->get() as $key) {

			if(file_exists($key->ruta))
				unlink($key->ruta);
		}

		$imagenes->delete();

		DB::transaction(function() use($galeria) {

			if(!$galeria->delete())
				throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

		return response()->json(array(
			'message' => 'Registro eliminado',
			'status'  => 'success'
		), 200);
	}

	/**
	 * Método que sirve para cambiar el estatus de un Galeria
	 */
	public function galeriaEstatus($id) {
	  	
	    $galeria = Galeria::find($id);

	    $galeria->estatus = (intval($galeria->estatus) == 1) ? 0 : 1;
    
        $galeria->save();

        return response()->json(array(
			'mensaje' => 'El estatus se actualizó correctamente',
			'estatus' => 'success'
		), 200);
    }
}
