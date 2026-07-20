<?php

namespace App\Services;

use Exception;

class CompatibleWebpImageOptimizer
{
    private $optimizer;

    public function __construct()
    {
        $this->optimizer = new WebpImageOptimizer();
    }

    public function optimizeUploadedFile($uploadedFile, $directory, array $options = [])
    {
        $extension = strtolower((string) $uploadedFile->getClientOriginalExtension());
        $mime = strtolower((string) $uploadedFile->getMimeType());

        // PHP/Fileinfo antiguos pueden reportar WebP como application/octet-stream.
        // Se valida la extensión y se conserva el archivo en su formato nativo.
        if ($extension === 'webp' && $mime !== 'image/webp') {
            $directory = trim(str_replace('\\', '/', $directory), '/');
            $absoluteDirectory = public_path($directory);

            if (!is_dir($absoluteDirectory) && !mkdir($absoluteDirectory, 0755, true) && !is_dir($absoluteDirectory)) {
                throw new Exception('No fue posible crear la carpeta pública de imágenes.');
            }

            $originalName = $uploadedFile->getClientOriginalName();
            $originalSize = intval($uploadedFile->getSize());
            $baseName = $this->cleanBaseName(pathinfo($originalName, PATHINFO_FILENAME));
            $fileName = $baseName . '_' . $this->randomSuffix() . '.webp';
            $uploadedFile->move($absoluteDirectory, $fileName);
            $absolutePath = $absoluteDirectory . DIRECTORY_SEPARATOR . $fileName;

            return [
                'path' => $directory . '/' . $fileName,
                'name' => $originalName,
                'size' => intval(filesize($absolutePath)),
                'original_size' => $originalSize,
                'optimized' => false,
                'format' => 'webp',
                'saved_bytes' => max(0, $originalSize - intval(filesize($absolutePath))),
            ];
        }

        return $this->optimizer->optimizeUploadedFile($uploadedFile, $directory, $options);
    }

    public function optimizeExistingFile($absolutePath, $storedPath, array $options = [])
    {
        return $this->optimizer->optimizeExistingFile($absolutePath, $storedPath, $options);
    }

    public function supportsWebp()
    {
        return $this->optimizer->supportsWebp();
    }

    private function cleanBaseName($name)
    {
        $name = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', (string) $name) ?: (string) $name;
        $name = preg_replace('/[^A-Za-z0-9]+/', '-', $name);
        $name = trim((string) $name, '-');
        return $name !== '' ? strtolower($name) : 'imagen';
    }

    private function randomSuffix()
    {
        try {
            return bin2hex(random_bytes(5));
        } catch (Exception $e) {
            return str_replace('.', '', uniqid('', true));
        }
    }
}
