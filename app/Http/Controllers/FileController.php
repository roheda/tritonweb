<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Validator;
use Exception;
use Auth;

class FileController extends Controller {

	/**
	 * Método para guardar una imagen
	 */
	public function uploadImagen() {

		$data = [
			'mensaje' => '',
			'estatus' => '',
			'file'    => ''
		];

		try {

			$input = [
				'file' => request()->file('file'),
			];

			$rules = [
				'file' => 'required|image|max:5000',
			];

			$messages = [
				'file.required' => 'Imagen requerida',
				'file.image'    => 'El archivo debe de ser de tipo imagen',
				'file.max'      => 'La imagen no debe pesar mas de 2MB.',
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$file = $this->makeFile('file', 'files/images');
			// $file = $this->makeFile('file', 'public/files/images');
			
			$data['mensaje'] = 'La imagen se ha guardado exitosamente.';
			$data['estatus'] = 'success';		
			$data['file']    = $file['path'];

		} catch(Exception $e) {
			
			$data['mensaje'] = $e->getMessage();
			$data['estatus'] = 'error';		
		}

		return response()->json($data, 200);
	}


	/**
	 * Método para guardar un archivo 
	 */
	public function uploadFile() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
			'file'    => []
		];

		try {

			$input = [
				'file' => request()->file('file'),
			];

			$rules = [
				'file' => 'required|max:50000',
			];

			$messages = [
				'file.required' => 'Archivo requerido',
				'file.max'      => 'El archivo no debe pesar mas de 10MB.',
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$file = $this->makeFile('file', 'files/docs');
			// $file = $this->makeFile('file', 'public/files/docs');
			
			$data['nombre'] = $file['name'];
			$data['peso']   = (floatval($file['size']) /1024) / 1024;
			$data['ruta']   = $file['path'];

			$response['mensaje'] = 'El archivo se ha guardado exitosamente.';
			$response['estatus'] = 'success';		
			$response['file']    = $data;

		} catch(Exception $e) {
			
			$response['mensaje'] = $e->getMessage();
			$response['estatus'] = 'error';		
		}

		return response()->json($response, 200);
	}

	/**
	 * Método para guardar un archivo 
	 */
	public function deleteFile() {

		$response = [
			'mensaje' => '',
			'estatus' => '',
			'file'    => ''
		];

		try {

			$data = request()->all();

			$input = [
				"ruta" => $data["ruta"]
			];

			$rules = [
				'ruta' => 'required'
			];

			$messages = [
				'ruta.required' => 'Ruta requerida'
			];

			$validator = Validator::make($input, $rules, $messages);

			if($validator->fails())
				throw new Exception($validator->messages()->first());

			$delete = $this->destroyFile($data["ruta"]);
			
			$response['mensaje'] = $delete['mensaje'];
			$response['estatus'] = $delete['estatus'];		

		} catch(Exception $e) {
			
			$response['mensaje'] = $e->getMessage();
			$response['estatus'] = 'error';		
		}

		return response()->json($response, 200);
	}

	/**
	 * Método para subir el archivo a la carpeta deseada. 
	 */
	public function makeFile($file, $ruta) {
        
		$dataFile = request()->file($file);
		$origName = '';
		
		if (method_exists($dataFile, 'getClientOriginalName'))
			$origName = $dataFile->getClientOriginalName();

		if (method_exists($dataFile, 'getSize'))
			$peso = $dataFile->getSize();

		$separate    = explode(".", $origName);
        $cleanString = $this->limpiarString($separate[0]);
        $nombre      = $cleanString . '_' . rand(1, 100000000) . '.' . $separate[1];
           
        $dataFile->move($ruta, utf8_decode($nombre));

       	if(!file_exists($ruta . DIRECTORY_SEPARATOR .  utf8_decode($nombre)))
			throw new Exception("Ocurrió un error al mover el archivo.");

		$response = array(
			'path' => $ruta . DIRECTORY_SEPARATOR . $nombre,
			'name' => $origName,
			'size' => $peso
		);

		return $response;
	}

	/**
	 * Método para limpiar una cadena de cualquier catarctér extraño
	 */
	public function destroyFile($ruta) {
     	
     	$response = [
     		'mensaje' => '',
     		'estatus' => ''
     	];

		try {

			if(!file_exists($ruta))
				throw new Exception("El archivo no existe.");

			if (!unlink($ruta))
				throw new Exception("Ocurrió un error al eliminar el archivo del servidor.");

			$response['mensaje'] = 'El archivo se ha eliminado exitosamente';
			$response['estatus'] = 'success';

		} catch(Exception $e) {
		  	
			$response['mensaje'] = $e->getMessage();
			$response['estatus'] = 'error';
		}

		return $response;
	}

	/**
	 * Método para limpiar una cadena de cualquier catarctér extraño
	 */
	public function limpiarString($string) {
	
	    $string = trim($string); 

	    $string = str_replace(
	        array('á', 'à', 'ä', 'â', 'ª', 'Á', 'À', 'Â', 'Ä'),
	        array('a', 'a', 'a', 'a', 'a', 'A', 'A', 'A', 'A'),
	        $string
	    ); 
	 
	    $string = str_replace(
	        array('é', 'è', 'ë', 'ê', 'É', 'È', 'Ê', 'Ë'),
	        array('e', 'e', 'e', 'e', 'E', 'E', 'E', 'E'),
	        $string
	    ); 
	 
	    $string = str_replace(
	        array('í', 'ì', 'ï', 'î', 'Í', 'Ì', 'Ï', 'Î'),
	        array('i', 'i', 'i', 'i', 'I', 'I', 'I', 'I'),
	        $string
	    ); 
	 
	    $string = str_replace(
	        array('ó', 'ò', 'ö', 'ô', 'Ó', 'Ò', 'Ö', 'Ô'),
	        array('o', 'o', 'o', 'o', 'O', 'O', 'O', 'O'),
	        $string
	    ); 
	 
	    $string = str_replace(
	        array('ú', 'ù', 'ü', 'û', 'Ú', 'Ù', 'Û', 'Ü'),
	        array('u', 'u', 'u', 'u', 'U', 'U', 'U', 'U'),
	        $string
	    ); 
	 
	    $string = str_replace(
	        array('ñ', 'Ñ', 'ç', 'Ç'),
	        array('n', 'N', 'c', 'C',),
	        $string
	    ); 
	 
	    // //Esta parte se encarga de eliminar cualquier caracter extraño
	    $string = str_replace(
	        array("¨", "º", "-", "~", "#", "@", "|", "!", '·', '$', '%', '&', '/', '(', ')', '?', '¡', '¿', '[', '^', '<code>', ']', '+', '}', '{', '¨', '´', '>', '< ', ';', ',', ':', '.', ' '), '',  
	        $string
	    ); 

	    return $string;
	}
}
