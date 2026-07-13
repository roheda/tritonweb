<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str as Str;
use App\Desarrollo;
use App\Amenidad;
use Validator;
use Exception;
use DB;

class DesarrollosController extends Controller
{
    /**
     * Devuelve todos los desarrollos para el administrador.
     */
    public function getDesarrollos()
    {
        $desarrollos = DB::table('desarrollos as a')
            ->join('estados as b', 'a.idEstado', '=', 'b.id')
            ->select('a.*', 'b.nombre as estado')
            ->orderBy('a.id', 'DESC')
            ->get();

        foreach ($desarrollos as $desarrollo) {
            $this->prepareDevelopment($desarrollo, true);
        }

        return response()->json($desarrollos);
    }

    /**
     * Devuelve los desarrollos activos para el sitio público.
     */
    public function getActiveDesarrollos($idEstado)
    {
        $query = DB::table('desarrollos as a')
            ->join('estados as b', 'a.idEstado', '=', 'b.id')
            ->select('a.*', 'b.nombre as estado')
            ->where('a.estatus', '=', 1);

        if (intval($idEstado) > 0) {
            $query->where('a.idEstado', '=', $idEstado);
        }

        $desarrollos = $query->orderBy('a.id', 'DESC')->get();

        foreach ($desarrollos as $desarrollo) {
            $this->prepareDevelopment($desarrollo, false);
        }

        return response()->json($desarrollos);
    }

    /**
     * Devuelve los desarrollos activos. Se conserva por compatibilidad.
     */
    public function getDesarrollosPaginate($idEstado)
    {
        return $this->getActiveDesarrollos($idEstado);
    }

    /**
     * Devuelve el detalle público de un desarrollo.
     */
    public function getDesarrolloDetail($slug)
    {
        $desarrollo = DB::table('desarrollos as a')
            ->join('estados as b', 'a.idEstado', '=', 'b.id')
            ->select('a.*', 'b.nombre as estado')
            ->where('a.slug', '=', $slug)
            ->where('a.estatus', '=', 1)
            ->first();

        if (!$desarrollo) {
            return response()->json([
                'mensaje' => 'El desarrollo solicitado no está disponible.',
                'estatus' => 'alert'
            ], 404);
        }

        $this->prepareDevelopment($desarrollo, true);
        $desarrollo->unidades = $this->getPublicUnits($desarrollo->id);

        return response()->json($desarrollo);
    }

    /**
     * Devuelve las amenidades de un desarrollo.
     */
    public function getAmenidades($idDesarrollo)
    {
        return DB::table('amenidades as a')
            ->select('a.*')
            ->where('a.idDesarrollo', '=', $idDesarrollo)
            ->get();
    }

    /**
     * Guarda un nuevo desarrollo.
     */
    public function newDesarrollo()
    {
        $response = ['mensaje' => '', 'estatus' => ''];

        try {
            $data = request()->all();
            $data['slug'] = Str::slug($data['nombre'] ?? '');

            $validator = $this->validateDevelopment($data, 0);

            if ($validator->fails()) {
                throw new Exception($validator->messages()->first());
            }

            DB::transaction(function () use ($data) {
                $desarrollo = new Desarrollo();
                $this->fillDevelopment($desarrollo, $data, true);
                $desarrollo->estatus = 1;
                $desarrollo->save();

                $this->syncAmenities($desarrollo->id, $data['amenidades'] ?? []);
            });

            $response['mensaje'] = 'El desarrollo se agregó correctamente.';
            $response['estatus'] = 'success';
        } catch (Exception $e) {
            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'alert';
        }

        return response()->json($response, 200);
    }

    /**
     * Actualiza un desarrollo.
     */
    public function updateDesarrollo($id)
    {
        $response = ['mensaje' => '', 'estatus' => ''];

        try {
            $data = request()->all();
            $data['slug'] = Str::slug($data['nombre'] ?? '');

            $validator = $this->validateDevelopment($data, $id);

            if ($validator->fails()) {
                throw new Exception($validator->messages()->first());
            }

            DB::transaction(function () use ($data, $id) {
                $desarrollo = Desarrollo::find($id);

                if (!$desarrollo) {
                    throw new Exception('No se encontró el desarrollo.');
                }

                $this->fillDevelopment($desarrollo, $data, false);
                $desarrollo->save();

                $this->syncAmenities($id, $data['amenidades'] ?? []);
            });

            $response['mensaje'] = 'El desarrollo se actualizó correctamente.';
            $response['estatus'] = 'success';
        } catch (Exception $e) {
            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'alert';
        }

        return response()->json($response, 200);
    }

    /**
     * Elimina un desarrollo.
     */
    public function deleteDesarrollo($id)
    {
        $desarrollo = Desarrollo::find($id);

        if (!$desarrollo) {
            return response()->json([
                'message' => 'No se encontró el desarrollo.',
                'status' => 'alert'
            ], 404);
        }

        DB::transaction(function () use ($desarrollo) {
            DB::table('amenidades')->where('idDesarrollo', $desarrollo->id)->delete();

            if (!$desarrollo->delete()) {
                throw new Exception('No fue posible eliminar el desarrollo.');
            }
        });

        return response()->json([
            'message' => 'Registro eliminado',
            'status' => 'success'
        ], 200);
    }

    /**
     * Cambia el estatus público de un desarrollo.
     */
    public function desarrolloEstatus($id)
    {
        $desarrollo = Desarrollo::find($id);

        if (!$desarrollo) {
            return response()->json([
                'mensaje' => 'No se encontró el desarrollo.',
                'estatus' => 'alert'
            ], 404);
        }

        $desarrollo->estatus = intval($desarrollo->estatus) === 1 ? 0 : 1;
        $desarrollo->save();

        return response()->json([
            'mensaje' => 'El estatus se actualizó correctamente',
            'estatus' => 'success'
        ], 200);
    }

    private function validateDevelopment(array $data, $id)
    {
        $input = [
            'nombre' => $data['nombre'] ?? null,
            'idEstado' => $data['idEstado'] ?? null,
            'slug' => $data['slug'] ?? null,
            'imagen' => $data['imagen'] ?? null,
            'logo' => $data['logo'] ?? null,
            'tipo_desarrollo' => $data['tipo_desarrollo'] ?? null,
            'tipo_operacion' => $data['tipo_operacion'] ?? null,
            'estado_comercial' => $data['estado_comercial'] ?? null,
            'precio_desde' => $data['precio_desde'] ?? null,
            'mostrar_precio' => $data['mostrar_precio'] ?? 1
        ];

        $slugRule = 'unique:desarrollos,slug';
        if (intval($id) > 0) {
            $slugRule .= ',' . intval($id);
        }

        $rules = [
            'nombre' => 'required',
            'idEstado' => 'required',
            'slug' => $slugRule,
            'imagen' => 'required',
            'logo' => 'required',
            'tipo_desarrollo' => 'nullable|in:residencial,comercial,mixto',
            'tipo_operacion' => 'nullable|in:venta,renta,venta_renta',
            'estado_comercial' => 'nullable|in:disponible,ultimas_unidades,proximamente,vendido,agotado,operando,consultar',
            'precio_desde' => 'nullable|numeric|min:0',
            'mostrar_precio' => 'nullable|boolean'
        ];

        $messages = [
            'nombre.required' => 'Escribe un nombre.',
            'idEstado.required' => 'Elige un estado.',
            'slug.unique' => 'El nombre ya fue utilizado.',
            'imagen.required' => 'Agrega una imagen principal.',
            'logo.required' => 'Agrega un logo.',
            'tipo_desarrollo.in' => 'Selecciona un tipo de desarrollo válido.',
            'tipo_operacion.in' => 'Selecciona si el proyecto es venta o renta.',
            'estado_comercial.in' => 'Selecciona un estado comercial válido.',
            'precio_desde.numeric' => 'El precio debe ser numérico.'
        ];

        return Validator::make($input, $rules, $messages);
    }

    private function fillDevelopment(Desarrollo $desarrollo, array $data, $isNew)
    {
        $fields = [
            'idEstado', 'nombre', 'descripcion', 'descripcion_corta',
            'tipo_desarrollo', 'tipo_operacion', 'tipo_producto',
            'estado_comercial', 'precio_desde', 'precio_texto',
            'mostrar_precio', 'etapa', 'imagen', 'brochure', 'logo',
            'svg', 'slug', 'video', 'enlace', 'ubicacion', 'zona',
            'ciudad', 'direccion', 'mapa_url', 'informacion_comercial',
            'esquema_pago', 'disponibilidad_texto', 'meta_title',
            'meta_description', 'imagen_social'
        ];

        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $desarrollo->{$field} = $data[$field];
            }
        }

        $desarrollo->mostrar_precio = isset($data['mostrar_precio'])
            ? intval($data['mostrar_precio'])
            : 1;

        if ($isNew && isset($data['fecha'])) {
            $desarrollo->fecha = $data['fecha'];
        }
    }

    private function syncAmenities($idDesarrollo, array $amenidades)
    {
        DB::table('amenidades')->where('idDesarrollo', $idDesarrollo)->delete();

        foreach ($amenidades as $item) {
            if (empty($item['ruta'])) {
                continue;
            }

            $amenidad = new Amenidad();
            $amenidad->idDesarrollo = $idDesarrollo;
            $amenidad->descripcion = $item['descripcion'] ?? '';
            $amenidad->ruta = $item['ruta'];
            $amenidad->save();
        }
    }

    private function prepareDevelopment($desarrollo, $includeAmenities)
    {
        $desarrollo->estatus = intval($desarrollo->estatus);
        $desarrollo->mostrar_precio = isset($desarrollo->mostrar_precio)
            ? intval($desarrollo->mostrar_precio)
            : 1;
        $desarrollo->fecha = !empty($desarrollo->fecha)
            ? date('Y-m-d', strtotime($desarrollo->fecha))
            : null;

        if ($includeAmenities) {
            $desarrollo->amenidades = $this->getAmenidades($desarrollo->id);
        }

        $summary = $this->getAvailabilitySummary($desarrollo);
        $desarrollo->total_unidades = $summary['total'];
        $desarrollo->unidades_disponibles = $summary['disponibles'];
        $desarrollo->unidades_apartadas = $summary['apartadas'];
        $desarrollo->unidades_no_disponibles = $summary['no_disponibles'];
        $desarrollo->resumen_disponibilidad = $summary['texto'];
        $desarrollo->ubicacion_completa = $this->buildLocation($desarrollo);
        $desarrollo->operacion_texto = $this->operationLabel($desarrollo->tipo_operacion ?? null);
        $desarrollo->estado_comercial_texto = $this->commercialStatusLabel($desarrollo->estado_comercial ?? null);
    }

    private function getAvailabilitySummary($desarrollo)
    {
        $counts = DB::table('unidades')
            ->select('estatus', DB::raw('COUNT(*) as total'))
            ->where('idDesarrollo', '=', $desarrollo->id)
            ->groupBy('estatus')
            ->pluck('total', 'estatus');

        $available = isset($counts[2]) ? intval($counts[2]) : 0;
        $reserved = isset($counts[1]) ? intval($counts[1]) : 0;
        $unavailable = isset($counts[0]) ? intval($counts[0]) : 0;
        $total = $available + $reserved + $unavailable;

        if ($total > 0) {
            if ($available > 0) {
                $noun = ($desarrollo->tipo_operacion ?? '') === 'renta' ? 'espacios' : 'unidades';
                $text = $available . ' ' . $noun . ' disponibles';
            } else {
                $text = ($desarrollo->tipo_operacion ?? '') === 'renta'
                    ? 'Sin espacios disponibles'
                    : 'Sin unidades disponibles';
            }
        } else {
            $text = !empty($desarrollo->disponibilidad_texto)
                ? $desarrollo->disponibilidad_texto
                : 'Consulta disponibilidad';
        }

        return [
            'total' => $total,
            'disponibles' => $available,
            'apartadas' => $reserved,
            'no_disponibles' => $unavailable,
            'texto' => $text
        ];
    }

    private function getPublicUnits($idDesarrollo)
    {
        return DB::table('unidades')
            ->select(
                'id', 'idDesarrollo', 'clave', 'descripcion', 'brochure',
                'imagen', 'tipo', 'estatus', 'construccion', 'terreno',
                'equipamiento', 'precio', 'precio24', 'precio48',
                'precio60', 'precio72'
            )
            ->where('idDesarrollo', '=', $idDesarrollo)
            ->orderBy('clave', 'ASC')
            ->get();
    }

    private function buildLocation($desarrollo)
    {
        $parts = [];

        foreach (['zona', 'ciudad', 'estado'] as $field) {
            if (!empty($desarrollo->{$field}) && !in_array($desarrollo->{$field}, $parts)) {
                $parts[] = $desarrollo->{$field};
            }
        }

        if (count($parts) === 0 && !empty($desarrollo->ubicacion)) {
            return $desarrollo->ubicacion;
        }

        return implode(', ', $parts);
    }

    private function operationLabel($value)
    {
        $labels = [
            'venta' => 'Venta',
            'renta' => 'Renta',
            'venta_renta' => 'Venta y renta'
        ];

        return $labels[$value] ?? 'Consultar';
    }

    private function commercialStatusLabel($value)
    {
        $labels = [
            'disponible' => 'Disponible',
            'ultimas_unidades' => 'Últimas unidades',
            'proximamente' => 'Próximamente',
            'vendido' => '100% vendido',
            'agotado' => 'Agotado',
            'operando' => 'En operación',
            'consultar' => 'Consultar disponibilidad'
        ];

        return $labels[$value] ?? 'Consultar disponibilidad';
    }
}
