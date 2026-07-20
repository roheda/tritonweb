<?php

namespace App\Console\Commands;

use App\Services\WebpImageOptimizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class OptimizeImagesToWebp extends Command
{
    protected $signature = 'triton:images-webp
        {--apply : Convierte archivos y actualiza las rutas en la base de datos}
        {--delete-originals : Elimina JPG y PNG después de actualizar las rutas}
        {--quality=84 : Calidad WebP entre 55 y 95}
        {--max-width=2200 : Ancho máximo en pixeles}
        {--max-height=2200 : Alto máximo en pixeles}';

    protected $description = 'Convierte imágenes JPG y PNG existentes del sitio a WebP de forma segura.';

    private $optimizer;
    private $converted = [];
    private $errors = 0;
    private $candidates = 0;
    private $savedBytes = 0;

    public function handle()
    {
        $this->optimizer = new WebpImageOptimizer();

        if (!$this->optimizer->supportsWebp()) {
            $this->error('El servidor no tiene soporte GD para generar WebP. Activa GD con WebP antes de continuar.');
            return 1;
        }

        $apply = (bool) $this->option('apply');
        $deleteOriginals = (bool) $this->option('delete-originals');
        $options = [
            'quality' => intval($this->option('quality')),
            'max_width' => intval($this->option('max-width')),
            'max_height' => intval($this->option('max-height')),
        ];

        $this->info($apply
            ? 'Convirtiendo imágenes existentes a WebP...'
            : 'Modo diagnóstico: no se modificarán archivos ni base de datos.');

        $targets = [
            ['table' => 'galerias_imagenes', 'columns' => ['ruta']],
            ['table' => 'amenidades', 'columns' => ['ruta']],
            ['table' => 'desarrollos', 'columns' => ['imagen', 'logo', 'imagen_social']],
            ['table' => 'Slider', 'columns' => ['foto']],
            ['table' => 'equipo', 'columns' => ['foto']],
            ['table' => 'notas', 'columns' => ['foto']],
        ];

        foreach ($targets as $target) {
            $this->processTable($target['table'], $target['columns'], $apply, $deleteOriginals, $options);
        }

        if ($apply && count($this->converted) > 0) {
            $this->replaceEmbeddedReferences();
        }

        $this->line('');
        $this->info('Imágenes candidatas: ' . $this->candidates);
        $this->info('Rutas convertidas: ' . count($this->converted));
        $this->info('Ahorro estimado: ' . $this->formatBytes($this->savedBytes));

        if ($this->errors > 0) {
            $this->warn('Archivos con error: ' . $this->errors . '. Revisa los mensajes anteriores.');
        }

        if (!$apply) {
            $this->comment('Para ejecutar la conversión: php artisan triton:images-webp --apply');
            $this->comment('Para borrar originales después: agrega --delete-originals');
        }

        return $this->errors > 0 ? 2 : 0;
    }

    private function processTable($table, array $columns, $apply, $deleteOriginals, array $options)
    {
        if (!Schema::hasTable($table) || !Schema::hasColumn($table, 'id')) {
            return;
        }

        foreach ($columns as $column) {
            if (!Schema::hasColumn($table, $column)) {
                continue;
            }

            $rows = DB::table($table)
                ->select('id', $column)
                ->whereNotNull($column)
                ->where($column, '<>', '')
                ->get();

            foreach ($rows as $row) {
                $storedPath = isset($row->{$column}) ? trim((string) $row->{$column}) : '';
                if (!$this->isConvertiblePath($storedPath)) {
                    continue;
                }

                $this->candidates++;

                if (isset($this->converted[$storedPath])) {
                    if ($apply) {
                        DB::table($table)->where('id', $row->id)->update([$column => $this->converted[$storedPath]]);
                    }
                    continue;
                }

                $absolutePath = $this->resolveStoredPath($storedPath);
                if (!$absolutePath) {
                    $this->warn('No se encontró: ' . $storedPath);
                    $this->errors++;
                    continue;
                }

                if (!$apply) {
                    $this->line('[pendiente] ' . $table . '.' . $column . ' → ' . $storedPath);
                    continue;
                }

                try {
                    $result = $this->optimizer->optimizeExistingFile($absolutePath, $storedPath, $options);
                    if (!$result) {
                        continue;
                    }

                    DB::table($table)->where('id', $row->id)->update([$column => $result['new_stored_path']]);
                    $this->converted[$storedPath] = $result['new_stored_path'];
                    $this->savedBytes += max(0, $result['old_size'] - $result['new_size']);
                    $this->info('[webp] ' . $storedPath . ' → ' . $result['new_stored_path']);

                    if ($deleteOriginals && is_file($result['old_absolute_path'])) {
                        @unlink($result['old_absolute_path']);
                    }
                } catch (Exception $e) {
                    $this->error($storedPath . ': ' . $e->getMessage());
                    $this->errors++;
                }
            }
        }
    }

    private function replaceEmbeddedReferences()
    {
        $textTargets = [
            ['table' => 'notas', 'columns' => ['descripcion']],
            ['table' => 'desarrollos', 'columns' => ['descripcion', 'descripcion_corta', 'informacion_comercial', 'esquema_pago']],
        ];

        foreach ($textTargets as $target) {
            if (!Schema::hasTable($target['table']) || !Schema::hasColumn($target['table'], 'id')) {
                continue;
            }

            foreach ($target['columns'] as $column) {
                if (!Schema::hasColumn($target['table'], $column)) {
                    continue;
                }

                foreach ($this->converted as $oldPath => $newPath) {
                    $rows = DB::table($target['table'])
                        ->select('id', $column)
                        ->where($column, 'like', '%' . $oldPath . '%')
                        ->get();

                    foreach ($rows as $row) {
                        DB::table($target['table'])
                            ->where('id', $row->id)
                            ->update([$column => str_replace($oldPath, $newPath, $row->{$column})]);
                    }
                }
            }
        }
    }

    private function isConvertiblePath($path)
    {
        if ($path === '' || preg_match('#^(https?:)?//#i', $path) || strpos($path, 'data:') === 0) {
            return false;
        }

        $pathOnly = (string) parse_url($path, PHP_URL_PATH);
        return (bool) preg_match('/\.(jpe?g|png)$/i', $pathOnly);
    }

    private function resolveStoredPath($storedPath)
    {
        $cleanPath = ltrim(str_replace('\\', '/', $storedPath), '/');
        $candidates = [
            public_path($cleanPath),
            base_path($cleanPath),
            base_path('public/' . $cleanPath),
        ];

        foreach ($candidates as $candidate) {
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    private function formatBytes($bytes)
    {
        if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
        if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
        if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
        return intval($bytes) . ' bytes';
    }
}
