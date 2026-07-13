<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Slider;
use Validator;
use Exception;
use Auth;
use DB;

class SliderController extends Controller {

	/**
	 * Método que devuelve todos los slider
	 */
	public function getSlider() {
		
		$slider = Slider::all();

		foreach ($slider as $key) {
			$key->estatus = intval($key->estatus);
		}
		
		return response()->json($slider);
	}

	/**
	 * Método que devuelve los slide activos
	 */
	public function getActiveSlider() {
		$slider = Slider::where('estatus', 1)->get();
		return response()->json($slider);
	}	

	/**
	 * Método para guardar un nuevo slide
	 */
	public function newSlide() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$input = [
				'titulo' => $data['titulo'],
				'foto'   => $data['foto']
			];

			$rules = [
				'titulo' => 'required',
				'foto'   => 'required'
			];

			$messages = [
				'titulo.required' => 'Escribe un titulo.',
				'foto.required'   => 'Elige una imagen.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			DB::transaction(function() use($data) {
				
				$slide = Slider::create($data);

				if(!$slide)
					throw new Exception(Lang::get('messages.exception_saving_model'));
			});

			$response["mensaje"] = 'Slide agregado correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	} 

	/**
	 * Método para acualizar slide
	 */
	public function updateSlide($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data  = request()->all();

			$input = [
				'titulo' => $data['titulo'],
				'foto'   => $data['foto']
			];

			$rules = [
				'titulo' => 'required',
				'foto'   => 'required'
			];

			$messages = [
				'titulo.required' => 'Escribe un titulo.',
				'foto.required'   => 'Selecciona una imagen.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$slide = Slider::findOrFail($id);

			DB::transaction(function() use ($slide, $data) {
				
				if(!$slide->update($data))
					throw new Exception(Lang::get('messages.exception_saving_model'));			
			});

			$response["mensaje"] = 'El slide se actualizó correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	}

	/**
	 * Método para eliminar una imagen
	 */
	public function destroyImage() {

		$photo = request()->all();
		$photo = Slider::where('photo', $photo["name"])->first();
		// var_dump($photo);

		if(file_exists($photo["name"])) {
			unlink($photo["name"]);
		}

		return \response()->json(array(
			'message' => 'Slide eliminado',
			'status' => 'success'), 200);
	}

	/**
	 * Método para eliminar un slide
	 */
	public function deleteSlide($id) {

		$slide = Slider::findOrFail($id);
		$photo = $slide->photo;

		DB::transaction(function() use($slide) {

			if(!$slide->delete())
				throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

		if(file_exists($photo))
			unlink($photo);

		return response()->json(array(
			'mensaje' => 'Slide eliminado',
			'estatus' => 'success'
		), 200);
	}

	/**
	 * Método que sirve para cambiar el estatus de un slide
	 */
	public function slideEstatus($id) {
	  	
	    $slide = Slider::find($id);

	    if($slide->estatus == 1)
            $slide->estatus = 0;

        else
            $slide->estatus = 1;
    
        $slide->save();

        return response()->json(array(
			'mensaje' => 'El estatus se actualizó correctamente',
			'estatus' => 'success'
		), 200);
    }
}
