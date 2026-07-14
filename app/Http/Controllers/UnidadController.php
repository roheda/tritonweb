<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Unidad;
use Validator;
use Exception;
use DB;

class UnidadController extends Controller
{
    public function getUnidades($idDesarrollo)
    {
        $unidades = Unidad::where('idDesarrollo', '=', $idDesarrollo)
            ->orderBy('clave', 'asc')
            ->get();

        foreach ($unidades as $unidad) {
            $this->prepareUnidad($unidad);
        }

        return response()->json($unidades);
    }

    public function getActiveUnidades($idDesarrollo)
    {
        $unidades = Unidad::where('idDesarrollo', '=', $idDesarrollo)
            ->orderBy('clave', 'asc')
            ->get();

        foreach ($unidades as $unidad) {
            $this->prepareUnidad($unidad);
        }

        return response()->json($unidades);
    }

    public function getUnidadesPaginate($idDesarrollo)
    {
        return Unidad::where('idDesarrollo', '=', $idDesarrollo)
            ->orderBy('clave', 'asc')
            ->paginate(20);
    }

    private function getUnidadesByKey($idDesarrollo, $clave, $id)
    {
        $query = Unidad::where('idDesarrollo', '=', $idDesarrollo)
            ->where('clave', '=', $clave);

        if (intval($id) > 0) {
            $query->where('id', '!=', $id);
        }

        return $query->get();
    }

    public function newUnidad()
    {
        $response = ['mensaje' => '', 'estatus' => ''];

        try {
            $data = request()->all();
            $validator = $this->validateUnidad($data, 0);

            if ($validator->fails()) {
                throw new Exception($validator->messages()->first());
            }

            $unidad = new Unidad();
            $this->fillUnidad($unidad, $data);
            $unidad->save();

            $response['mensaje'] = 'La unidad se agregó correctamente.';
            $response['estatus'] = 'success';
        } catch (Exception $e) {
            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'alert';
        }

        return response()->json($response, 200);
    }

    public function updateUnidad($id)
    {
        $response = ['mensaje' => '', 'estatus' => ''];

        try {
            $data = request()->all();
            $validator = $this->validateUnidad($data, $id);

            if ($validator->fails()) {
                throw new Exception($validator->messages()->first());
            }

            $unidad = Unidad::find($id);
            if (!$unidad) {
                throw new Exception('No se encontró la unidad.');
            }

            $this->fillUnidad($unidad, $data);
            $unidad->save();

            $response['mensaje'] = 'La unidad se actualizó correctamente.';
            $response['estatus'] = 'success';
        } catch (Exception $e) {
            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'alert';
        }

        return response()->json($response, 200);
    }

    public function updateEstatus($id)
    {
        $response = ['mensaje' => '', 'estatus' => ''];

        try {
            $data = request()->all();
            $validator = Validator::make(
                ['estatus' => $data['estatus'] ?? null],
                ['estatus' => 'required|in:0,1,2'],
                ['estatus.in' => 'Selecciona un estatus válido.']
            );

            if ($validator->fails()) {
                throw new Exception($validator->messages()->first());
            }

            $unidad = Unidad::find($id);
            if (!$unidad) {
                throw new Exception('No se encontró la unidad.');
            }

            $unidad->estatus = intval($data['estatus']);
            $unidad->save();

            $response['mensaje'] = 'La disponibilidad se actualizó correctamente.';
            $response['estatus'] = 'success';
        } catch (Exception $e) {
            $response['mensaje'] = $e->getMessage();
            $response['estatus'] = 'alert';
        }

        return response()->json($response, 200);
    }

    public function deleteUnidad($id)
    {
        $unidad = Unidad::find($id);

        if (!$unidad) {
            return response()->json([
                'message' => 'No se encontró la unidad.',
                'status' => 'alert'
            ], 404);
        }

        DB::transaction(function () use ($unidad) {
            if (!$unidad->delete()) {
                throw new Exception('No fue posible eliminar la unidad.');
            }
        });

        return response()->json([
            'message' => 'Unidad eliminada.',
            'status' => 'success'
        ], 200);
    }

    /**
     * Ruta anterior conservada para compatibilidad.
     * Si recibe estatus, usa el nuevo cambio directo; si no, avanza al siguiente estado.
     */
    public function directorioEstatus($id)
    {
        if (request()->has('estatus')) {
            return $this->updateEstatus($id);
        }

        $unidad = Unidad::find($id);
        if (!$unidad) {
            return response()->json([
                'mensaje' => 'No se encontró la unidad.',
                'estatus' => 'alert'
            ], 404);
        }

        $unidad->estatus = (intval($unidad->estatus) + 1) % 3;
        $unidad->save();

        return response()->json([
            'mensaje' => 'La disponibilidad se actualizó correctamente.',
            'estatus' => 'success'
        ], 200);
    }

    private function validateUnidad(array $data, $id)
    {
        $input = [
            'idDesarrollo' => $data['idDesarrollo'] ?? null,
            'clave' => trim($data['clave'] ?? ''),
            'descripcion' => $data['descripcion'] ?? null,
            'tipo' => trim($data['tipo'] ?? ''),
            'estatus' => $data['estatus'] ?? null,
            'construccion' => $data['construccion'] ?? 0,
            'terreno' => $data['terreno'] ?? 0,
            'precio' => $data['precio'] ?? 0
        ];

        $rules = [
            'idDesarrollo' => 'required|integer|exists:desarrollos,id',
            'clave' => 'required|max:100',
            'descripcion' => 'nullable|max:255',
            'tipo' => 'required|max:100',
            'estatus' => 'required|in:0,1,2',
            'construccion' => 'nullable|numeric|min:0',
            'terreno' => 'nullable|numeric|min:0',
            'precio' => 'nullable|numeric|min:0'
        ];

        $messages = [
            'idDesarrollo.required' => 'Selecciona un desarrollo.',
            'clave.required' => 'Escribe la clave de la unidad o local.',
            'tipo.required' => 'Escribe el tipo de unidad o local.',
            'estatus.in' => 'Selecciona un estatus válido.',
            'construccion.numeric' => 'La superficie debe ser numérica.',
            'terreno.numeric' => 'El terreno debe ser numérico.',
            'precio.numeric' => 'El precio o renta debe ser numérico.'
        ];

        $validator = Validator::make($input, $rules, $messages);
        $validator->after(function ($validator) use ($input, $id) {
            if (
                !empty($input['idDesarrollo']) &&
                !empty($input['clave']) &&
                count($this->getUnidadesByKey($input['idDesarrollo'], $input['clave'], $id)) > 0
            ) {
                $validator->errors()->add('clave', 'La clave ya existe en este desarrollo.');
            }
        });

        return $validator;
    }

    private function fillUnidad(Unidad $unidad, array $data)
    {
        $unidad->idDesarrollo = intval($data['idDesarrollo']);
        $unidad->clave = trim($data['clave']);
        $unidad->descripcion = trim($data['descripcion'] ?? '');
        $unidad->tipo = trim($data['tipo']);
        $unidad->estatus = intval($data['estatus']);
        $unidad->construccion = floatval($data['construccion'] ?? 0);
        $unidad->terreno = floatval($data['terreno'] ?? 0);
        $unidad->precio = floatval($data['precio'] ?? 0);
        $unidad->imagen = $data['imagen'] ?? '';
        $unidad->brochure = $data['brochure'] ?? '';
        $unidad->equipamiento = trim($data['equipamiento'] ?? '');
        $unidad->largo = floatval($data['largo'] ?? 0);
        $unidad->ancho = floatval($data['ancho'] ?? 0);
        $unidad->precio24 = floatval($data['precio24'] ?? 0);
        $unidad->precio48 = floatval($data['precio48'] ?? 0);
        $unidad->precio60 = floatval($data['precio60'] ?? 0);
        $unidad->precio72 = floatval($data['precio72'] ?? 0);
    }

    private function prepareUnidad($unidad)
    {
        $unidad->estatus = intval($unidad->estatus);
        $unidad->construccion = floatval($unidad->construccion);
        $unidad->terreno = floatval($unidad->terreno);
        $unidad->precio = floatval($unidad->precio);
        $unidad->updated_at_texto = !empty($unidad->updated_at)
            ? date('d/m/Y H:i', strtotime($unidad->updated_at))
            : '';
    }
}
