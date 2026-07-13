<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Comentario;
use Validator;
use Exception;
use Auth;
use DB;

class ContactoController extends Controller {

	/**
	 * Método que devuelve todas las Comentarios
	 */
	public function getComentarios() {

		$comentarios = Comentario::all();
		return response()->json($comentarios);
	}

	/**
	 * Método para eliminar un Comentario
	 */
	public function deleteComentario($id) {

		$comentario = Comentario::find($id);

		DB::transaction(function() use($comentario) {

			if(!$comentario->delete())
				throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

		return response()->json(array(
			'mensaje' => 'El comentario se eliminó correctamente',
			'estatus' => 'success'
		), 200);
	}

	/**
	 * Método para guardar un comentario en la bandeja
	 */
	public function newComent() {

		$data = [
			'status'  => 'success',
			'mensaje' => []
		];

		try {

			$getData = request()->all();
			
			$input = [
				'is_broker' => $getData['is_broker'],
				'nombre'    => $getData['nombre'],
				'apellido'  => $getData['apellido'],
				'correo'    => (request()->has('correo')) ? $getData['correo'] : 'error',
				'telefono'  => $getData['telefono'],
				'ciudad'    => $getData['ciudad'],
				'pais'      => $getData['pais']
			];

			$rules = [
				'is_broker' => 'required',
				'nombre'    => 'required',
				'apellido'  => 'required',
				'correo'    => 'required|email',
				'telefono'  => 'required',
				'ciudad'    => 'required',
				'pais'      => 'required',
			];

			$messages = [
				'is_broker.required' => 'Selecciona si eres broker o cliente.',
				'nombre.required'    => 'Escribe tu nombre.',
				'apellido.required'  => 'Escribe tu apellido.',
				'correo.required'    => 'Escribe tu correo.',
				'correo.email'       => 'El formato de correo es incorrecto.',
				'telefono.required'  => 'Escribe tu teléfono.',
				'ciudad.required'    => 'Escribe tu ciudad.',
				'pais.required'      => 'Escribe tu país.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$comentario = new Comentario();

			$comentario->is_broker   = $getData['is_broker'];
			$comentario->nombre      = $getData['nombre'];
			$comentario->apellido    = $getData['apellido'];
			$comentario->correo      = $getData['correo'];
			$comentario->telefono    = $getData['telefono'];
			$comentario->ciudad      = $getData['ciudad'];
			$comentario->pais        = $getData['pais'];
			$comentario->medio       = $getData['medio'];
			$comentario->preferencia = $getData['preferencia'];
			$comentario->mensaje     = $getData['mensaje'];
			$comentario->privacy     = 1;

			$comentario->save();

			$response["mensaje"] = 'El mensaje se ha registrado correctamente';
			$response["estatus"] = "success";

			// if($data['status'] == 'success') {

			// 	$correo['nombre'] = $getData['nombre'];
			// 	$correo['correo'] = $getData['correo'];
			// 	$correo['header'] = '¡Hola ' . $correo['nombre'] . '!';
			// 	$correo['body']   = 'Acabamos de recibir tu mensaje, lo turnaremos al area correspondiente';
			// 	$correo['footer'] = 'Gracias por ponerte en contacto';

			// 	Mail::send('emails.emailBienvenido', $correo, function($message) use ($correo) {
			// 	 	$message->from('danycardenasarenas@gmail.com', 'triton Vida');
			// 	 	$message->to($correo['correo'], $correo['nombre'])->subject('¡Gracias por tu mensaje!');
			// 	});
			// }

        } catch (Exception $e) {

			$data['status']  = 'error';
			$data['mensaje'] = $e->getMessage();
		}

		return response()->json($data, 200);
	}
}
