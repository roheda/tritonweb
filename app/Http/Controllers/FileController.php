<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Validator;
use Exception;
use Auth;

class FileController extends Controller {

    /**
     * Método que guarda una imagen.
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
                'file.max'      => 'La imagen no debe pesar mas de 5MB.',
            ];

            $validator = Validator::make($input, $rules, $messages);

            if($validator->fails())
                throw new Exception($validator->messages()->first());

            $file = $this->makeFile('file', 'files/images');

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
     * Entrega una versión reducida y cacheada de imágenes públicas.
     * Las imágenes originales nunca se modifican.
     */
    public function optimizedImage() {

        $source = rawurldecode((string) request()->query('src', ''));
        $source = ltrim(str_replace('\\', '/', $source), '/');
        $width = max(240, min(1600, intval(request()->query('w', 800))));
        $quality = max(55, min(88, intval(request()->query('q', 78))));

        if ($source === '' || strpos($source, '..') !== false)
            abort(404);

        if (!preg_match('#^(files/images|img)/#i', $source))
            abort(404);

        $sourcePath = $this->resolvePublicImagePath($source);

        if (!$sourcePath)
            abort(404);

        $info = @getimagesize($sourcePath);

        if (!$info || empty($info[0]) || empty($info[1]))
            return $this->imageFileResponse($sourcePath, false);

        $imageType = intval($info[2]);
        $webpType = defined('IMAGETYPE_WEBP') ? IMAGETYPE_WEBP : -1;
        $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, $webpType];

        if (!in_array($imageType, $allowedTypes, true))
            return $this->imageFileResponse($sourcePath, false);

        if (intval($info[0]) <= $width || !function_exists('imagecreatetruecolor'))
            return $this->imageFileResponse($sourcePath, false);

        $cacheDirectory = public_path('files/cache/images');

        if (!is_dir($cacheDirectory) && !@mkdir($cacheDirectory, 0755, true))
            return $this->imageFileResponse($sourcePath, false);

        $targetExtension = function_exists('imagewebp') ? 'webp' : ($imageType === IMAGETYPE_PNG ? 'png' : 'jpg');
        $cacheKey = md5($sourcePath . '|' . @filemtime($sourcePath) . '|' . $width . '|' . $quality);
        $cachePath = $cacheDirectory . DIRECTORY_SEPARATOR . $cacheKey . '.' . $targetExtension;

        if (!file_exists($cachePath)) {
            $sourceImage = $this->createImageResource($sourcePath, $imageType, $webpType);

            if (!$sourceImage)
                return $this->imageFileResponse($sourcePath, false);

            if ($imageType === IMAGETYPE_JPEG)
                $sourceImage = $this->applyJpegOrientation($sourceImage, $sourcePath);

            $sourceWidth = imagesx($sourceImage);
            $sourceHeight = imagesy($sourceImage);
            $targetWidth = min($width, $sourceWidth);
            $targetHeight = max(1, intval(round($sourceHeight * ($targetWidth / $sourceWidth))));
            $targetImage = imagecreatetruecolor($targetWidth, $targetHeight);

            if (!$targetImage) {
                imagedestroy($sourceImage);
                return $this->imageFileResponse($sourcePath, false);
            }

            if ($imageType === IMAGETYPE_PNG || $imageType === $webpType) {
                imagealphablending($targetImage, false);
                imagesavealpha($targetImage, true);
                $transparent = imagecolorallocatealpha($targetImage, 0, 0, 0, 127);
                imagefilledrectangle($targetImage, 0, 0, $targetWidth, $targetHeight, $transparent);
            } else {
                $background = imagecolorallocate($targetImage, 255, 255, 255);
                imagefilledrectangle($targetImage, 0, 0, $targetWidth, $targetHeight, $background);
            }

            $resampled = imagecopyresampled(
                $targetImage,
                $sourceImage,
                0,
                0,
                0,
                0,
                $targetWidth,
                $targetHeight,
                $sourceWidth,
                $sourceHeight
            );

            $saved = false;

            if ($resampled) {
                if ($targetExtension === 'webp') {
                    $saved = @imagewebp($targetImage, $cachePath, $quality);
                } elseif ($targetExtension === 'png') {
                    $compression = max(0, min(9, 9 - intval(round(($quality / 100) * 9))));
                    $saved = @imagepng($targetImage, $cachePath, $compression);
                } else {
                    $saved = @imagejpeg($targetImage, $cachePath, $quality);
                }
            }

            imagedestroy($sourceImage);
            imagedestroy($targetImage);

            if (!$saved || !file_exists($cachePath))
                return $this->imageFileResponse($sourcePath, false);
        }

        return $this->imageFileResponse($cachePath, true);
    }

    /**
     * Método para guardar un archivo.
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
                'file.max'      => 'El archivo no debe pesar mas de 50MB.',
            ];

            $validator = Validator::make($input, $rules, $messages);

            if($validator->fails())
                throw new Exception($validator->messages()->first());

            $file = $this->makeFile('file', 'files/docs');

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
     * Método para eliminar un archivo.
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
                'ruta' => $data['ruta']
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

            $delete = $this->destroyFile($data['ruta']);

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
        $peso = 0;

        if (method_exists($dataFile, 'getClientOriginalName'))
            $origName = $dataFile->getClientOriginalName();

        if (method_exists($dataFile, 'getSize'))
            $peso = $dataFile->getSize();

        $separate = explode('.', $origName);
        $extension = count($separate) > 1 ? end($separate) : 'file';
        $cleanString = $this->limpiarString(pathinfo($origName, PATHINFO_FILENAME));
        $nombre = $cleanString . '_' . rand(1, 100000000) . '.' . $extension;

        $dataFile->move($ruta, utf8_decode($nombre));

        if(!file_exists($ruta . DIRECTORY_SEPARATOR . utf8_decode($nombre)))
            throw new Exception('Ocurrió un error al mover el archivo.');

        return [
            'path' => $ruta . DIRECTORY_SEPARATOR . $nombre,
            'name' => $origName,
            'size' => $peso
        ];
    }

    /**
     * Elimina un archivo del servidor.
     */
    public function destroyFile($ruta) {

        $response = [
            'mensaje' => '',
            'estatus' => ''
        ];

        try {

            if(!file_exists($ruta))
                throw new Exception('El archivo no existe.');

            if (!unlink($ruta))
                throw new Exception('Ocurrió un error al eliminar el archivo del servidor.');

            $response['mensaje'] = 'El archivo se ha eliminado exitosamente';
            $response['estatus'] = 'success';

        } catch(Exception $e) {

            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'error';
        }

        return $response;
    }

    private function resolvePublicImagePath($source) {

        $candidates = [
            public_path($source),
            base_path($source),
            base_path('public' . DIRECTORY_SEPARATOR . $source)
        ];

        foreach ($candidates as $candidate) {
            $realPath = realpath($candidate);

            if (!$realPath || !is_file($realPath))
                continue;

            $normalized = str_replace('\\', '/', $realPath);

            if (strpos($normalized, '/files/images/') !== false || strpos($normalized, '/img/') !== false)
                return $realPath;
        }

        return null;
    }

    private function createImageResource($path, $imageType, $webpType) {

        if ($imageType === IMAGETYPE_JPEG && function_exists('imagecreatefromjpeg'))
            return @imagecreatefromjpeg($path);

        if ($imageType === IMAGETYPE_PNG && function_exists('imagecreatefrompng'))
            return @imagecreatefrompng($path);

        if ($imageType === $webpType && function_exists('imagecreatefromwebp'))
            return @imagecreatefromwebp($path);

        return false;
    }

    private function applyJpegOrientation($image, $path) {

        if (!function_exists('exif_read_data'))
            return $image;

        $exif = @exif_read_data($path);
        $orientation = isset($exif['Orientation']) ? intval($exif['Orientation']) : 1;
        $rotated = false;

        if ($orientation === 3)
            $rotated = @imagerotate($image, 180, 0);
        elseif ($orientation === 6)
            $rotated = @imagerotate($image, -90, 0);
        elseif ($orientation === 8)
            $rotated = @imagerotate($image, 90, 0);

        if ($rotated) {
            imagedestroy($image);
            return $rotated;
        }

        return $image;
    }

    private function imageFileResponse($path, $immutable) {

        $maxAge = $immutable ? 31536000 : 604800;
        $cacheControl = 'public, max-age=' . $maxAge;

        if ($immutable)
            $cacheControl .= ', immutable';

        return response()->file($path, [
            'Cache-Control' => $cacheControl,
            'X-Content-Type-Options' => 'nosniff'
        ]);
    }

    /**
     * Método para limpiar una cadena de cualquier carácter extraño.
     */
    public function limpiarString($string) {

        $string = trim($string);

        $string = str_replace(
            ['á', 'à', 'ä', 'â', 'ª', 'Á', 'À', 'Â', 'Ä'],
            ['a', 'a', 'a', 'a', 'a', 'A', 'A', 'A', 'A'],
            $string
        );

        $string = str_replace(
            ['é', 'è', 'ë', 'ê', 'É', 'È', 'Ê', 'Ë'],
            ['e', 'e', 'e', 'e', 'E', 'E', 'E', 'E'],
            $string
        );

        $string = str_replace(
            ['í', 'ì', 'ï', 'î', 'Í', 'Ì', 'Ï', 'Î'],
            ['i', 'i', 'i', 'i', 'I', 'I', 'I', 'I'],
            $string
        );

        $string = str_replace(
            ['ó', 'ò', 'ö', 'ô', 'Ó', 'Ò', 'Ö', 'Ô'],
            ['o', 'o', 'o', 'o', 'O', 'O', 'O', 'O'],
            $string
        );

        $string = str_replace(
            ['ú', 'ù', 'ü', 'û', 'Ú', 'Ù', 'Û', 'Ü'],
            ['u', 'u', 'u', 'u', 'U', 'U', 'U', 'U'],
            $string
        );

        $string = str_replace(
            ['ñ', 'Ñ', 'ç', 'Ç'],
            ['n', 'N', 'c', 'C'],
            $string
        );

        $string = str_replace(
            ['¨', 'º', '-', '~', '#', '@', '|', '!', '·', '$', '%', '&', '/', '(', ')', '?', '¡', '¿', '[', '^', '<code>', ']', '+', '}', '{', '´', '>', '< ', ';', ',', ':', '.', ' '],
            '',
            $string
        );

        return $string;
    }
}
