<?php

namespace App\Http\Controllers;

use App\Services\WebpImageOptimizer;
use Exception;
use Validator;

class OptimizedFileController extends Controller
{
    /**
     * Acepta JPG, PNG, WebP y GIF. JPG/PNG/WebP se guardan optimizados
     * como WebP cuando GD del servidor tiene soporte disponible.
     */
    public function uploadImagen()
    {
        $response = [
            'mensaje' => '',
            'estatus' => '',
            'file' => '',
            'optimized' => false,
            'format' => '',
            'original_size' => 0,
            'final_size' => 0,
            'saved_bytes' => 0,
        ];

        try {
            $uploadedFile = request()->file('file');
            $validator = Validator::make(
                ['file' => $uploadedFile],
                ['file' => 'required|file|max:10000'],
                [
                    'file.required' => 'Imagen requerida.',
                    'file.file' => 'El archivo debe ser una imagen válida.',
                    'file.max' => 'La imagen no debe pesar más de 10 MB.',
                ]
            );

            if ($validator->fails()) {
                throw new Exception($validator->messages()->first());
            }

            $optimizer = new WebpImageOptimizer();
            $file = $optimizer->optimizeUploadedFile($uploadedFile, 'files/images', [
                'quality' => 84,
                'max_width' => 2200,
                'max_height' => 2200,
            ]);

            $response['mensaje'] = $file['optimized']
                ? 'La imagen se guardó y optimizó en formato WebP.'
                : 'La imagen se guardó correctamente.';
            $response['estatus'] = 'success';
            $response['file'] = $file['path'];
            $response['optimized'] = $file['optimized'];
            $response['format'] = $file['format'];
            $response['original_size'] = $file['original_size'];
            $response['final_size'] = $file['size'];
            $response['saved_bytes'] = $file['saved_bytes'];
        } catch (Exception $e) {
            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'error';
        }

        return response()->json($response, 200);
    }
}
