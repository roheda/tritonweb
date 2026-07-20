<?php

namespace App\Services;

use Exception;

class WebpImageOptimizer
{
    const DEFAULT_QUALITY = 84;
    const DEFAULT_MAX_WIDTH = 2200;
    const DEFAULT_MAX_HEIGHT = 2200;

    public function optimizeUploadedFile($uploadedFile, $directory, array $options = [])
    {
        if (!$uploadedFile || !$uploadedFile->isValid()) {
            throw new Exception('No fue posible leer la imagen subida.');
        }

        $mime = $this->normalizeMime($uploadedFile->getMimeType());
        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!in_array($mime, $allowed, true)) {
            throw new Exception('Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
        }

        $originalName = $uploadedFile->getClientOriginalName();
        $originalSize = intval($uploadedFile->getSize());
        $extension = strtolower($uploadedFile->getClientOriginalExtension());
        $baseName = $this->cleanBaseName(pathinfo($originalName, PATHINFO_FILENAME));
        $directory = trim(str_replace('\\', '/', $directory), '/');
        $absoluteDirectory = public_path($directory);

        if (!is_dir($absoluteDirectory) && !mkdir($absoluteDirectory, 0755, true) && !is_dir($absoluteDirectory)) {
            throw new Exception('No fue posible crear la carpeta pública de imágenes.');
        }

        // Un archivo WebP ya viene en el formato correcto. Se conserva tal cual para
        // asegurar compatibilidad incluso cuando GD no puede decodificar WebP.
        if ($mime === 'image/webp') {
            $fileName = $baseName . '_' . $this->randomSuffix() . '.webp';
            $uploadedFile->move($absoluteDirectory, $fileName);
            $absolutePath = $absoluteDirectory . DIRECTORY_SEPARATOR . $fileName;

            return $this->result(
                $directory . '/' . $fileName,
                $originalName,
                $originalSize,
                filesize($absolutePath),
                false,
                'webp'
            );
        }

        // No convertimos GIF porque un WebP estático eliminaría la animación.
        if ($mime === 'image/gif') {
            $fileName = $baseName . '_' . $this->randomSuffix() . '.gif';
            $uploadedFile->move($absoluteDirectory, $fileName);
            $absolutePath = $absoluteDirectory . DIRECTORY_SEPARATOR . $fileName;

            return $this->result(
                $directory . '/' . $fileName,
                $originalName,
                $originalSize,
                filesize($absolutePath),
                false,
                'gif'
            );
        }

        if ($this->supportsWebp()) {
            $fileName = $baseName . '_' . $this->randomSuffix() . '.webp';
            $absolutePath = $absoluteDirectory . DIRECTORY_SEPARATOR . $fileName;
            $this->encodeToWebp($uploadedFile->getRealPath(), $absolutePath, $mime, $options);

            return $this->result(
                $directory . '/' . $fileName,
                $originalName,
                $originalSize,
                filesize($absolutePath),
                true,
                'webp'
            );
        }

        // Fallback: si el servidor no tiene GD con WebP, se conserva la imagen original.
        $extension = $extension ?: $this->extensionForMime($mime);
        $fileName = $baseName . '_' . $this->randomSuffix() . '.' . $extension;
        $uploadedFile->move($absoluteDirectory, $fileName);
        $absolutePath = $absoluteDirectory . DIRECTORY_SEPARATOR . $fileName;

        return $this->result(
            $directory . '/' . $fileName,
            $originalName,
            $originalSize,
            filesize($absolutePath),
            false,
            $extension
        );
    }

    public function optimizeExistingFile($absolutePath, $storedPath, array $options = [])
    {
        if (!is_file($absolutePath)) {
            throw new Exception('No existe el archivo: ' . $storedPath);
        }

        $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));
        if ($extension === 'webp' || !in_array($extension, ['jpg', 'jpeg', 'png'], true)) {
            return null;
        }

        if (!$this->supportsWebp()) {
            throw new Exception('El servidor no tiene soporte GD para generar WebP.');
        }

        $mime = $this->normalizeMime($this->detectMime($absolutePath));
        $targetAbsolutePath = preg_replace('/\.(jpe?g|png)$/i', '.webp', $absolutePath);
        $targetStoredPath = preg_replace('/\.(jpe?g|png)$/i', '.webp', str_replace('\\', '/', $storedPath));

        if (!$targetAbsolutePath || !$targetStoredPath) {
            throw new Exception('No fue posible construir la ruta WebP para ' . $storedPath);
        }

        if (!is_file($targetAbsolutePath)) {
            $this->encodeToWebp($absolutePath, $targetAbsolutePath, $mime, $options);
        }

        return [
            'old_stored_path' => str_replace('\\', '/', $storedPath),
            'new_stored_path' => $targetStoredPath,
            'old_absolute_path' => $absolutePath,
            'new_absolute_path' => $targetAbsolutePath,
            'old_size' => intval(filesize($absolutePath)),
            'new_size' => intval(filesize($targetAbsolutePath)),
        ];
    }

    public function supportsWebp()
    {
        return function_exists('imagecreatefromstring') && function_exists('imagewebp');
    }

    private function encodeToWebp($sourcePath, $targetPath, $mime, array $options)
    {
        $quality = isset($options['quality']) ? intval($options['quality']) : self::DEFAULT_QUALITY;
        $maxWidth = isset($options['max_width']) ? intval($options['max_width']) : self::DEFAULT_MAX_WIDTH;
        $maxHeight = isset($options['max_height']) ? intval($options['max_height']) : self::DEFAULT_MAX_HEIGHT;

        $quality = max(55, min(95, $quality));
        $maxWidth = max(320, $maxWidth);
        $maxHeight = max(320, $maxHeight);

        $contents = @file_get_contents($sourcePath);
        if ($contents === false) {
            throw new Exception('No fue posible leer la imagen para optimizarla.');
        }

        $image = @imagecreatefromstring($contents);
        if (!$image) {
            throw new Exception('La imagen está dañada o el servidor no reconoce su formato.');
        }

        if ($mime === 'image/jpeg') {
            $image = $this->applyExifOrientation($image, $sourcePath);
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1, $maxWidth / max(1, $width), $maxHeight / max(1, $height));
        $targetWidth = max(1, intval(round($width * $scale)));
        $targetHeight = max(1, intval(round($height * $scale)));

        if ($targetWidth !== $width || $targetHeight !== $height) {
            $resized = imagecreatetruecolor($targetWidth, $targetHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
            imagefilledrectangle($resized, 0, 0, $targetWidth, $targetHeight, $transparent);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        } else {
            imagealphablending($image, false);
            imagesavealpha($image, true);
        }

        $targetDirectory = dirname($targetPath);
        if (!is_dir($targetDirectory) && !mkdir($targetDirectory, 0755, true) && !is_dir($targetDirectory)) {
            imagedestroy($image);
            throw new Exception('No fue posible preparar la carpeta de destino.');
        }

        if (!@imagewebp($image, $targetPath, $quality)) {
            imagedestroy($image);
            throw new Exception('No fue posible generar la imagen WebP.');
        }

        imagedestroy($image);
        @chmod($targetPath, 0644);
    }

    private function applyExifOrientation($image, $sourcePath)
    {
        if (!function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($sourcePath);
        $orientation = isset($exif['Orientation']) ? intval($exif['Orientation']) : 1;
        $rotated = null;

        if ($orientation === 3) {
            $rotated = imagerotate($image, 180, 0);
        } elseif ($orientation === 6) {
            $rotated = imagerotate($image, -90, 0);
        } elseif ($orientation === 8) {
            $rotated = imagerotate($image, 90, 0);
        }

        if ($rotated) {
            imagedestroy($image);
            return $rotated;
        }

        return $image;
    }

    private function detectMime($path)
    {
        if (function_exists('mime_content_type')) {
            return mime_content_type($path);
        }

        $info = @getimagesize($path);
        return isset($info['mime']) ? $info['mime'] : '';
    }

    private function normalizeMime($mime)
    {
        $mime = strtolower(trim((string) $mime));
        if ($mime === 'image/jpg' || $mime === 'image/pjpeg') return 'image/jpeg';
        if ($mime === 'image/x-png') return 'image/png';
        return $mime;
    }

    private function extensionForMime($mime)
    {
        if ($mime === 'image/jpeg') return 'jpg';
        if ($mime === 'image/png') return 'png';
        if ($mime === 'image/webp') return 'webp';
        if ($mime === 'image/gif') return 'gif';
        return 'img';
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

    private function result($path, $originalName, $originalSize, $finalSize, $optimized, $format)
    {
        return [
            'path' => str_replace('\\', '/', $path),
            'name' => $originalName,
            'size' => intval($finalSize),
            'original_size' => intval($originalSize),
            'optimized' => (bool) $optimized,
            'format' => $format,
            'saved_bytes' => max(0, intval($originalSize) - intval($finalSize)),
        ];
    }
}
