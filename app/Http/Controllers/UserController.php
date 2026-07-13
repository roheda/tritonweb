<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\Permiso;
use App\User;
use Validator;
use Exception;;
use Auth;
use DB;

class UserController extends Controller {

	/**
	 * Método que devuelve los datos y permisos del usuario logueado
	 */
	public function getPermisosMenu() {
  		
		$user = Auth::user();
		$rol  = intval($user->idRol);

		$array = [
			'id'              => $user->id, 
			'nombre'          => $user->nombre, 
			'apellidoPaterno' => $user->apPaterno,
			'apellidoMaterno' => $user->apMaterno, 
			'nombreCompleto'  => $user->nombre . ' ' . $user->apPaterno,
			'email'           => $user->email, 
			'path'            => $user->path, 
			'username'        => $user->username,
			'menu'            => []
		];

		$permisos = $user->permissions;
		
		foreach ($permisos as $key) {

			if($key->nombre == 'Seguridad') {

				$menu = [
					'nombre' => 'Usuarios',
					'icono'  => 'person',
					'ruta'   => '/usuarios'
				];

				array_push($array['menu'], $menu);
			}

			if($key->nombre == 'Slider') {

				$menu = [
					'nombre' => 'Slider',
					'icono'  => 'panorama',
					'ruta'   => '/slider'
				];

				array_push($array['menu'], $menu);
			}

			if($key->nombre == 'Desarrollos') {

				$menu = [
					'nombre' => 'Desarrollos',
					'icono'  => 'business',
					'ruta'   => '/desarrollos'
				];

				array_push($array['menu'], $menu);
			}


			if($key->nombre == 'Bandeja de contacto') {

				$menu = [
					'nombre' => 'Bandeja de contacto',
					'icono'  => 'mail',
					'ruta'   => '/contacto'
				];

				array_push($array['menu'], $menu);
			}

			if($key->nombre == 'Unidades') {

				$menu = [
					'nombre' => 'Unidades',
					'icono'  => 'vpn_key',
					'ruta'   => '/unidades'
				];

				array_push($array['menu'], $menu);
			}

			if($key->nombre == 'Equipo') {

				$menu = [
					'nombre' => 'Equipo',
					'icono'  => 'person_add',
					'ruta'   => '/equipo'
				];

				array_push($array['menu'], $menu);
			}

			if($key->nombre == 'Notas') {

				$menu = [
					'nombre' => 'Notas',
					'icono'  => 'local_library',
					'ruta'   => '/notas'
				];

				array_push($array['menu'], $menu);
			}
		}

		return response()->json($array);
	}

	/**
	 * Método que devuelve todos los usuarios
	 */
	public function getUsuarios() {

		$usuarios = DB::table('users as a')->select('a.*')->get();

		foreach ($usuarios as $key) {			
			$key->permisos = User::find($key->id)->permissions;
		}

		return response()->json($usuarios);
	}

	/**
	 * Método que devuelve todos los permisos
	 */
	public function getPermisos() {

		$permisos = Permiso::all();

		foreach ($permisos as $key) {			
			$key->checked = false;
		}

		return response()->json($permisos);
	}

	/**
	 * Método que sirve para crear un usuario
	 */
	public function saveUsuario() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();

			$input = [
				'nombre'    => $data['nombre'],
				'apPaterno' => $data['apPaterno'],
				'username'  => $data['username'],
				'password'  => $data['password'],
				'email'     => $data['email']
			];

			$rules = [
				'nombre'    => 'required',
				'apPaterno' => 'required',
				'username'  => 'required|unique:users,username',
				'password'  => 'required|min:6',
				'email'     => 'required'
			];

			$messages = [
				'nombre.required'    => 'Escribe el nombre.',
				'apPaterno.required' => 'Escribe el apellido paterno.',
				'username.required'  => 'Escribe el nombre de usuario.',
				'username.unique'    => 'El nombre de usuario debe ser unico',
				'password.required'  => 'Escribe un password.',
				'password.min'       => 'La contraseña debe tener al menos 6 caracteres',
				'email.required'     => 'Escribe un email.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			DB::transaction(function() use($data) {
				
				$user = User::create($data);

				if(!$user)
					throw new Exception(Lang::get('messages.exception_saving_model'));

				if($data['permisos']) {

					$idPermisos = array();
					
					foreach($data['permisos'] as $key) {

						if($key['checked'] == true)
							$idPermisos[] = $key['id'];
					}

					$user->permissions()->sync($idPermisos);
				}
			});

			$response["mensaje"] = 'El registro se agregó correctamente';
			$response["estatus"] = "success";
		
		} catch (Exception $e) {

			$response["mensaje"] = $e->getMessage();
			$response["estatus"] = "alert";
		}

		return response()->json($response, 200);
	}

	/**
	 * Método que sirve para editar un usuario
	 */
	public function update($id) {

		$response = [
			'mensaje' => '',
			'estatus' => '',
		];

		try {
			
			$data = request()->all();
			$user = null;

			$input = [
				'nombre'    => $data['nombre'],
				'apPaterno' => $data['apPaterno'],
				'username'  => $data['username'],
				'email'     => $data['email']
			];

			$rules = [
				'nombre'    => 'required',
				'apPaterno' => 'required',
				'username'  => 'required|unique:users,username,' . $id,
				'email'     => 'required'
			];

			$messages = [
				'nombre.required'    => 'Escribe el nombre.',
				'apPaterno.required' => 'Escribe el apellido paterno.',
				'username.required'  => 'Escribe el nombre de usuario.',
				'username.unique'    => 'El nombre de usuario debe ser unico',
				'email.required'     => 'Escribe un email.'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$user = User::find($id);

			if(isset($user))
	    		$user->password = (strlen($data['password']) == 0) ? $user->password : $data['password'];

			DB::transaction(function() use($user, $data) {
			
				if(!$user->update($data))
					throw new Exception(Lang::get('messages.exception_saving_model'));

				if($data['permisos']) {

					$idPermisos = array();
					
					foreach($data['permisos'] as $key) {

						if($key['checked'] == true)
							$idPermisos[] = $key['id'];
					}

					$user->permissions()->sync($idPermisos);
				} 
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
	 * Método que sirve para eliminar un usuario
	 */
	public function deleteUsuario($id) {
		
		$user = User::find($id);

		if(User::count() <= 1)
	    	throw new Exception(Lang::get('messages.exception_min_users'));

	    if(Auth::user()->id === $user->id) 
	    	throw new Exception(Lang::get('messages.exception_user_auth_destroy'));

		DB::transaction(function() use($user) {

			$user->permissions()->detach();
	    	
	    	if(!$user->delete())
	    		throw new Exception(Lang::get('messages.exception_deleting_model'));
		});

	    return response()->json(array(
			'message' => 'Usuario eliminado',
			'status'  => 'success'
		), 200);
	}

	/**
	 * Método que devuelve los permisos por id
	 */
	public function getPermisosById($id) {

		$permisos        = Permiso::all();
		$permisosUsuario = User::find($id)->permisos;
		$permisosFull    = array();

        for ($i = 0;$i < count($permisos); $i++ ) {
			
			$permisosFull[$i]['id']          = $permisos[$i]->id;
			$permisosFull[$i]['nombre']      = $permisos[$i]->nombre;
			$permisosFull[$i]['descripcion'] = $permisos[$i]->descripcion;
			$permisosFull[$i]['status']      = false;

         	for($r = 0; $r < count($permisosUsuario); $r++) {

         	 	if( $permisosFull[$i]['id'] == $permisosUsuario[$r]['id'])         	 		
         	 		$permisosFull[$i]['status'] = true;
         	}
        }

        return response()->json($permisosFull);
	}

	public function getAllPermisos() {

		$permisosFull = array();

		$us = Auth::user();

		if($us['id_rol'] == 3)
			$permisos = Permiso::all();

		else
			$permisos = Permiso::where('id', '!=', 38)->get();

        for ($i = 0; $i < count($permisos); $i++ ) {

			$permisosFull[$i]['id']          = $permisos[$i]->id;
			$permisosFull[$i]['name']        = $permisos[$i]->name;
			$permisosFull[$i]['descripcion'] = $permisos[$i]->descripcion;
			$permisosFull[$i]['status']      = false;
        }

        return response()->json($permisosFull);
	}

	public function uploadfoto() {

		$response = array('status' => 200);

		try {

			if(Input::hasFile('file'))
				$file = FileService::make('file');
			
			$response['success'] = 'Se ha creado exitosamente la imagen: ';
			$response['file']    = $file;

		} catch(Exception $e) {
			
			$response['status'] = 406;
			$response['error']  = $e->getMessage();
		
		}

		return $response;
	}

	public function getUserPorfile(){
  		$id = Auth::id();
		$user = User::where('id','=', $id)->get()->toArray();
		return $user;
	}

	public function updatePerfil($id) {
	
		$user    = User::find($id);
		$getData = Input::all();

		$user["nombre"]    = ($getData["nombre"]);
		$user["apPaterno"] = ($getData["apPaterno"]);
		$user["apMaterno"] = ($getData["apMaterno"]);
		$user["email"]     = ($getData["email"]);
		$user["username"]  = ($getData["username"]);
		$user["path"]      = ($getData["path"]);
	    
	    if($getData["password"] != "") {

	    	$user["password"] = ($getData["password"]);
	    }
	    
	    $user->save();

      	return response()->json(array(
			'message' => 'El usuario ' . $user->username . ' ha sido actualizado correctamente.',
			'status'  => 'success'
      	), 200);
	}
}
