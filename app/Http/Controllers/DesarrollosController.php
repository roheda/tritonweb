<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str as Str;
use Illuminate\Http\Request;
use App\Desarrollo;
use App\Amenidad;
use Validator;
use Exception;
use Auth;
use DB;

class DesarrollosController extends Controller {

	/**
	 * Método que devuelve todos los desarrollos
	 */
	public function getDesarrollos() {

		$desarrollos = DB::table('desarrollos as a')
						->join('estados as b', 'a.idEstado', '=', 'b.id')
						->select('a.*', 'b.nombre as estado')
						->orderBy('b.id', 'DESC')
						->get();

		foreach ($desarrollos as $key) {

			$key->estatus    = intval($key->estatus);
			$key->fecha      = date('Y-m-d', strtotime($key->fecha));
			$key->amenidades = $this->getAmenidades($key->id);
		}

		return response()->json($desarrollos);
	}

	/**
	 * Método que devuelve los desarrollos activos
	 */
	public function getActiveDesarrollos($idEstado) {

		$desarrollos = DB::table('desarrollos as a')
						->join('estados as b', 'a.idEstado', '=', 'b.id')
						->select('a.*', 'b.nombre as estado')
						->where('a.estatus', '=', 1);

		if(intval($idEstado) > 0)
			$desarrollos = $desarrollos->where('a.idEstado', '=', $idEstado)->get();

		$desarrollos = $desarrollos->orderBy('a.id', 'DESC')->get();

		foreach ($desarrollos as $key) {
			$key->estatus = intval($key->estatus);
			$key->fecha   = date('Y-m-d', strtotime($key->fecha));
		}

		return response()->json($desarrollos);
	}

	/**
	 * Método que devuelve los desarrollos activos (10 por pagina)
	 */
	public function getDesarrollosPaginate($idEstado) {

		$desarrollos = DB::table('desarrollos as a')
						->join('estados as b', 'a.idEstado', '=', 'b.id')
						->select('a.*', 'b.nombre as estado')
						->where('a.estatus', '=', 1);

		if(intval($idEstado) > 0)
			$desarrollos = $desarrollos->where('a.idEstado', '=', $idEstado)->get();

		$desarrollos = $desarrollos->orderBy('a.id', 'DESC')->get();

		return response()->json($desarrollos);
	}

	/**
	 * Método que devuelve las Desarrollos activos
	 */
	public function getDesarrolloDetail($slug) {

		$desarrollo = DB::table('desarrollos as a')
						->join('estados as b', 'a.idEstado', '=', 'b.id')
						->select('a.*', 'b.nombre as estado')
						->where('a.slug', '=', $slug)
						->where('a.estatus', '=', 1)
						->first();

		$desarrollo->fecha      = date('Y-m-d', strtotime($desarrollo->fecha));
		$desarrollo->amenidades = $this->getAmenidades($desarrollo->id);
		
		return response()->json($desarrollo);
	}

	/**
	 * Método que devuelve las amenidades de un desarrollo
	 */
	public function getAmenidades($idDesarrollo) {

		$amenidades = DB::table('amenidades as a')
						->select('a.*')
						->where('a.idDesarrollo', '=', $idDesarrollo)
						->get();
		
		return $amenidades;
	}

	/**
	 * Método para guardar una nueva Desarrollo
	 */
	public function newDesarrollo() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$data['slug'] = Str::slug($data['nombre']);

			$input = [
				'nombre'   => $data['nombre'],
				'idEstado' => $data['idEstado'],
				'slug'     => $data['slug'],
				'imagen'   => $data['imagen'],
				'logo'     => $data['logo']
			];

			$rules = [
				'nombre'   => 'required',
				'idEstado' => 'required',
				'slug'     => 'unique:desarrollos,slug',
				'imagen'   => 'required',
				'logo'     => 'required'
			];

			$messages = [
				'nombre.required'   => 'Escribe un nombre.',
				'idEstado.required' => 'Elige un estado.',
				'slug.unique'       => 'El título ya fue utilizado.',
				'imagen.required'   => 'Agrega una imagen.',
				'logo.required'     => 'Agrega un logo.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$desarrollo = new Desarrollo();

			$desarrollo->idEstado    = $data['idEstado'];
			$desarrollo->nombre      = $data['nombre'];
			$desarrollo->descripcion = $data['descripcion'];
			$desarrollo->imagen      = $data['imagen'];
			$desarrollo->brochure    = $data['brochure'];
			$desarrollo->logo        = $data['logo'];
			$desarrollo->svg         = $data['svg'];
			$desarrollo->slug        = $data['slug'];
			$desarrollo->fecha       = $data['fecha'];
			$desarrollo->video       = $data['video'];
			$desarrollo->enlace      = $data['enlace'];
			$desarrollo->ubicacion   = $data['ubicacion'];
			$desarrollo->estatus     = 1;

			$desarrollo->save();

			if(count($data['amenidades']) > 0) {

				$id = $desarrollo->id;

				foreach ($data['amenidades'] as $key) {

					$imagen = new Amenidad();

					$imagen->idDesarrollo = $id;
					$imagen->descripcion  = $key['descripcion'];
					$imagen->ruta         = $key['ruta'];

					$imagen->save();
				}
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
	 * Método para acualizar Desarrollo
	 */
	public function updateDesarrollo($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data  = request()->all();

			$data['slug'] = Str::slug($data['nombre']);

			$input = [
				'nombre'   => $data['nombre'],
				'idEstado' => $data['idEstado'],
				'slug'     => $data['slug'],
				'imagen'   => $data['imagen'],
				'logo'     => $data['logo']
			];

			$rules = [
				'nombre'   => 'required',
				'idEstado' => 'required',
				'slug'     => 'unique:desarrollos,slug,' . $id,
				'imagen'   => 'required',
				'logo'     => 'required'
			];

			$messages = [
				'nombre.required'   => 'Escribe un nombre.',
				'idEstado.required' => 'Elige un estado.',
				'slug.unique'       => 'El título ya fue utilizado.',
				'imagen.required'   => 'Agrega una imagen.',
				'logo.required'     => 'Agrega un logo.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$desarrollo = Desarrollo::find($id);

			$desarrollo->idEstado    = $data['idEstado'];
			$desarrollo->nombre      = $data['nombre'];
			$desarrollo->descripcion = $data['descripcion'];
			$desarrollo->imagen      = $data['imagen'];
			$desarrollo->brochure    = $data['brochure'];
			$desarrollo->logo        = $data['logo'];
			$desarrollo->svg         = $data['svg'];
			$desarrollo->slug        = $data['slug'];
			$desarrollo->video       = $data['video'];
			$desarrollo->enlace      = $data['enlace'];
			$desarrollo->ubicacion   = $data['ubicacion'];

			$desarrollo->save();

			if(count($data['amenidades']) > 0) {

				DB::table('amenidades')->where('idDesarrollo', $id)->delete();

				foreach ($data['amenidades'] as $key) {

					$imagen = new Amenidad();

					$imagen->idDesarrollo = $id;
					$imagen->descripcion  = $key['descripcion'];
					$imagen->ruta         = $key['ruta'];
					
					$imagen->save();
				}
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
	 * Método para eliminar un Desarrollo
	 */
	public function deleteDesarrollo($id) {

		$desarrollo  = Desarrollo::find($id);

		DB::transaction(function() use($desarrollo) {

			if(!$desarrollo->delete())
				throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

		return response()->json(array(
			'message' => 'Registro eliminado',
			'status'  => 'success'
		), 200);
	}

	/**
	 * Método que sirve para cambiar el estatus de un Desarrollo
	 */
	public function desarrolloEstatus($id) {
	  	
	    $desarrollo = Desarrollo::find($id);

	    $desarrollo->estatus = (intval($desarrollo->estatus) == 1) ? 0 : 1;
    
        $desarrollo->save();

        return response()->json(array(
			'mensaje' => 'El estatus se actualizó correctamente',
			'estatus' => 'success'
		), 200);
    }
}
